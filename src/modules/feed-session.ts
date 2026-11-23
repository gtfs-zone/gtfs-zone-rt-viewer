import { CONFIG } from '../config';
import { t } from '../i18n/messages';
import { GTFSRealtime } from 'gtfs-zone-web-common/gtfs/rt-poller';
import type {
  FeedStatus,
  FetchStartDetail,
} from 'gtfs-zone-web-common/gtfs/rt-poller';
import type {
  AlertRecord,
  TripUpdate,
} from 'gtfs-zone-web-common/gtfs/rt-types';
import type { VehiclePosition } from 'gtfs-zone-web-common/gtfs/rt-types';
import { FeedSessionBase } from 'gtfs-zone-web-common/gtfs/feed-session';
import { ParseCache } from 'gtfs-zone-web-common/gtfs/parse-cache';
import type { FeedLibrary } from 'gtfs-zone-web-common/ui/load-modal';
import { alertTripIds } from 'gtfs-zone-web-common/gtfs/alerts';
import { feedProgressIndicator } from 'gtfs-zone-web-common/ui/progress-indicator';
import { LoadCancelledError } from 'gtfs-zone-web-common/gtfs/feed-download';
import type {
  FeedSelection,
  RealtimeEndpointName,
  RealtimeSource,
} from 'gtfs-zone-web-common/gtfs/feed-selection';
import {
  REALTIME_ENDPOINT_LABELS,
  hasAnyRealtimeUrl,
  isComplete,
  resolvedRealtimeUrls,
  resolvedScheduledUrl,
} from 'gtfs-zone-web-common/gtfs/feed-selection';

/**
 * The remembered poll interval, or the default. Anything not on the offered
 * menu is discarded — the dropdown could never show it back to the user.
 */
function readStoredIntervalMs(): number {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(CONFIG.RT_INTERVAL_KEY);
  } catch {
    // Storage unavailable; fall through to the default.
  }
  const parsed = Number(stored);
  return (CONFIG.RT_INTERVAL_OPTIONS_MS as readonly number[]).includes(parsed)
    ? parsed
    : CONFIG.RT_INTERVAL_DEFAULT_MS;
}

/** What the parse cache keeps with a stored feed, to rebuild its selection. */
interface StoredExtra {
  useCors: boolean;
  realtime: RealtimeSource | null;
}

export interface RealtimeCounts {
  vehicles: number;
  tripUpdates: number;
  alerts: number;
}

/**
 * Owns the loaded feeds: the scheduled dataset, the RT poller when the
 * selection has realtime, and the selection they came from. Schedules load
 * through the parse cache, which keeps only the feed in use. Everything that loads a feed goes through here so there is a
 * single place that reports progress and a single place the status page reads.
 *
 * Re-dispatches the poller's payload events, so consumers (map, alerts modal,
 * status page) never have to re-subscribe when the poller is replaced.
 */
export class FeedSession extends FeedSessionBase {
  selection: FeedSelection | null = null;
  poller: GTFSRealtime | null = null;
  rtCounts: RealtimeCounts = { vehicles: 0, tripUpdates: 0, alerts: 0 };
  /**
   * Scheduled runs on the road at the last tick, before the worker's cap, or
   * null when vehicles are not simulated (a realtime feed, or nothing loaded).
   */
  scheduledRunning: number | null = null;
  protected parseCache = new ParseCache('viz');

  private intervalMs = readStoredIntervalMs();
  private simTimer: ReturnType<typeof setInterval> | null = null;

  /** Vehicles come from the timetable, not a realtime feed. */
  get simulating(): boolean {
    return this.simTimer !== null;
  }

  get status(): FeedStatus | null {
    return this.poller?.getStatus() ?? null;
  }

  /**
   * Load a complete selection: the schedule first, then the RT poller if it
   * names an endpoint. `storedId` restores that stored feed instead of
   * fetching the schedule.
   */
  async load(selection: FeedSelection, storedId?: string): Promise<void> {
    if (!isComplete(selection)) {
      throw new Error(t('load.incomplete'));
    }
    const previous = this.selection;
    this.selection = selection;
    const scheduled = selection.scheduled!;
    // The current schedule is released as the load starts, so its realtime
    // half stops with it.
    this.stopPoller();
    this.stopSimulation();
    try {
      const extra: StoredExtra = {
        useCors: scheduled.kind === 'url' && scheduled.useCors,
        realtime: selection.realtime,
      };
      await this.loadSchedule(
        storedId
          ? { stored: storedId }
          : scheduled.kind === 'file'
            ? { file: scheduled.file }
            : { url: resolvedScheduledUrl(scheduled) },
        scheduled.label,
        {
          sourceUrl: scheduled.kind === 'url' ? scheduled.url : undefined,
          extra,
        }
      );
    } catch (err) {
      // A cancelled load keeps the previous selection, so Reload can bring it
      // back, unless a newer load has already replaced it.
      if (err instanceof LoadCancelledError && this.selection === selection) {
        this.selection = previous;
      }
      throw err;
    }
    if (hasAnyRealtimeUrl(selection.realtime)) {
      this.startPoller(selection);
    } else {
      console.log('[FeedSession] no realtime endpoints; simulating vehicles');
      this.startSimulation();
    }
    this.emitChange();
  }

  /** The selection a stored feed was loaded with, or null when it is gone. */
  storedSelection(id: string): FeedSelection | null {
    const entry = this.parseCache.get(id);
    if (!entry) {
      return null;
    }
    const extra = entry.extra as StoredExtra | undefined;
    return {
      scheduled: {
        kind: 'url',
        url: entry.sourceUrl,
        useCors: extra?.useCors ?? true,
        label: entry.label,
      },
      realtime: extra?.realtime ?? null,
    };
  }

  /** The stored feeds, for the load modal's "Your feeds". */
  library(): FeedLibrary {
    return {
      feeds: this.parseCache.offers(this.scheduleEntry?.id ?? null),
      onDelete: (id) => this.parseCache.delete(id),
    };
  }

  /** Re-run the current selection from scratch: schedule download plus a fresh poller. */
  async reload(): Promise<void> {
    if (!this.selection) {
      return;
    }
    await this.load(this.selection);
  }

  /** The RT poll interval, remembered per-device across loads and sessions. */
  get pollIntervalMs(): number {
    return this.intervalMs;
  }

  setPollIntervalMs(intervalMs: number): void {
    this.intervalMs = intervalMs;
    try {
      localStorage.setItem(CONFIG.RT_INTERVAL_KEY, String(intervalMs));
    } catch {
      // Private browsing or a full quota — the interval still applies this session.
    }
    this.poller?.setIntervalMs(intervalMs);
    this.emitChange();
  }

  private stopPoller(): void {
    this.poller?.stop();
    this.poller = null;
    this.rtCounts = { vehicles: 0, tripUpdates: 0, alerts: 0 };
    this.vehicles = new Map();
    this.alerts = new Map();
    this.tripUpdates = [];
  }

  /** The simulation stops with the schedule it reads. */
  protected releaseSchedule(): void {
    this.stopSimulation();
    super.releaseSchedule();
  }

  private stopSimulation(): void {
    if (!this.simTimer) {
      return;
    }
    clearInterval(this.simTimer);
    this.simTimer = null;
    this.scheduledRunning = null;
    this.rtCounts.vehicles = 0;
    this.vehicles = new Map();
    console.log('[FeedSession] scheduled vehicles stopped');
  }

  /**
   * Recompute scheduled vehicle positions every `SCHEDULED_TICK_MS` and apply
   * them as the session's vehicles. A tick still in flight skips the next
   * one; a failed tick stops the simulation.
   */
  private startSimulation(): void {
    this.stopSimulation();
    const feed = this.scheduledFeed;
    if (!feed) {
      throw new Error('[FeedSession] no schedule to simulate');
    }
    let busy = false;
    const tick = (): void => {
      if (busy) {
        return;
      }
      busy = true;
      const live = () => this.simTimer === timer && this.scheduledFeed === feed;
      feed
        .scheduledVehicles(Date.now())
        .then(({ vehicles, running }) => {
          if (!live()) {
            return;
          }
          // Simulated vehicles carry their stop, so only the trip rows are
          // fetched; the vehicle page loads its trip's stop_times itself.
          this.withTrips(
            'vehicles',
            vehicles.map((v) => v.tripId),
            () => {
              if (!live()) {
                return;
              }
              this.scheduledRunning = running;
              this.applyVehicles(vehicles);
              this.emitChange();
            },
            { stopTimes: false }
          );
        })
        .catch((err) => {
          if (!live()) {
            return;
          }
          console.error('[FeedSession] scheduled vehicles failed', err);
          this.stopSimulation();
          this.dispatchEvent(
            new CustomEvent<VehiclePosition[]>('vehicles', { detail: [] })
          );
          this.emitChange();
        })
        .finally(() => {
          busy = false;
        });
    };
    const timer = setInterval(tick, CONFIG.SCHEDULED_TICK_MS);
    this.simTimer = timer;
    console.log('[FeedSession] simulating scheduled vehicles');
    tick();
  }

  private startPoller(selection: FeedSelection): void {
    this.stopPoller();
    this.stopSimulation();

    const poller = new GTFSRealtime(
      resolvedRealtimeUrls(selection.realtime!, CONFIG.RT_BASE),
      this.intervalMs
    );
    this.poller = poller;

    poller.addEventListener('fetchstart', (e) => {
      const { name, prominent } = (e as CustomEvent<FetchStartDetail>).detail;
      if (prominent) {
        feedProgressIndicator.startLoading(
          `rt-${name}`,
          `Fetching ${REALTIME_ENDPOINT_LABELS[name]}…`
        );
      }
    });
    poller.addEventListener('fetchend', (e) => {
      feedProgressIndicator.finishLoading(
        `rt-${(e as CustomEvent<RealtimeEndpointName>).detail}`
      );
    });
    poller.addEventListener('statuschange', () => this.emitChange());

    // Each payload is applied once the scheduled trips it names are fetched.
    poller.addEventListener('vehicles', (e) => {
      const detail = (e as CustomEvent<VehiclePosition[]>).detail;
      this.withTrips(
        'vehicles',
        detail.map((v) => v.tripId),
        () => {
          if (this.poller === poller) {
            this.applyVehicles(detail);
          }
        }
      );
    });
    poller.addEventListener('tripUpdates', (e) => {
      const detail = (e as CustomEvent<TripUpdate[]>).detail;
      this.withTrips(
        'tripUpdates',
        detail.map((u) => u.trip?.tripId),
        () => {
          if (this.poller !== poller) {
            return;
          }
          this.rtCounts.tripUpdates = detail.length;
          this.tripUpdates = detail;
          this.dispatchEvent(
            new CustomEvent<TripUpdate[]>('tripUpdates', { detail })
          );
        }
      );
    });
    poller.addEventListener('alerts', (e) => {
      const detail = (e as CustomEvent<AlertRecord[]>).detail;
      this.withTrips('alerts', alertTripIds(detail), () => {
        if (this.poller !== poller) {
          return;
        }
        this.rtCounts.alerts = detail.length;
        this.alerts = new Map(detail.map((a) => [a.id, a]));
        this.dispatchEvent(
          new CustomEvent<AlertRecord[]>('alerts', { detail })
        );
      });
    });

    poller.start();
  }

  private applyVehicles(detail: VehiclePosition[]): void {
    this.rtCounts.vehicles = detail.length;
    this.vehicles = new Map(detail.map((v) => [v.key, v]));
    // Keys are derived to be unique, so the map must not lose anything. A
    // mismatch means the derivation collapsed two vehicles onto one key.
    if (import.meta.env.DEV && this.vehicles.size !== detail.length) {
      console.warn(
        `[FeedSession] vehicle key collision: ${detail.length} payload vehicles, ${this.vehicles.size} distinct keys`
      );
    }
    this.dispatchEvent(
      new CustomEvent<VehiclePosition[]>('vehicles', { detail })
    );
  }
}
