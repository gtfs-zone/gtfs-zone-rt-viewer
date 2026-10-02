import { CONFIG } from '../config';
import { t } from '../i18n/messages';
import { GTFSRealtime } from '../gtfs-rt';
import type { FeedStatus, FetchStartDetail } from '../gtfs-rt';
import type {
  AlertRecord,
  TripUpdate,
} from 'gtfs-zone-web-common/gtfs/rt-types';
import type { VehiclePosition } from 'gtfs-zone-web-common/gtfs/rt-types';
import { FeedSessionBase } from 'gtfs-zone-web-common/gtfs/feed-session';
import { feedProgressIndicator } from 'gtfs-zone-web-common/ui/progress-indicator';
import { LoadCancelledError } from 'gtfs-zone-web-common/gtfs/feed-download';
import type {
  FeedSelection,
  RealtimeEndpointName,
} from 'gtfs-zone-web-common/gtfs/feed-selection';
import {
  REALTIME_ENDPOINT_LABELS,
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

export interface RealtimeCounts {
  vehicles: number;
  tripUpdates: number;
  alerts: number;
}

/**
 * Owns the loaded feeds: the scheduled dataset, the RT poller, and the selection
 * they came from. Everything that loads a feed goes through here so there is a
 * single place that reports progress and a single place the status page reads.
 *
 * Re-dispatches the poller's payload events, so consumers (map, alerts modal,
 * status page) never have to re-subscribe when the poller is replaced.
 */
export class FeedSession extends FeedSessionBase {
  selection: FeedSelection | null = null;
  poller: GTFSRealtime | null = null;
  rtCounts: RealtimeCounts = { vehicles: 0, tripUpdates: 0, alerts: 0 };

  private intervalMs = readStoredIntervalMs();

  get status(): FeedStatus | null {
    return this.poller?.getStatus() ?? null;
  }

  /** Load a complete selection: the schedule first, then start the RT poller. */
  async load(selection: FeedSelection): Promise<void> {
    if (!isComplete(selection)) {
      throw new Error(t('load.incomplete'));
    }
    const previous = this.selection;
    this.selection = selection;
    const scheduled = selection.scheduled!;
    try {
      await this.loadSchedule(
        scheduled.kind === 'file'
          ? { file: scheduled.file }
          : { url: resolvedScheduledUrl(scheduled) },
        scheduled.label
      );
    } catch (err) {
      // A cancelled load leaves the session exactly as it was, unless a newer
      // load has already replaced the selection.
      if (err instanceof LoadCancelledError && this.selection === selection) {
        this.selection = previous;
      }
      throw err;
    }
    this.startPoller(selection);
    this.emitChange();
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

  private startPoller(selection: FeedSelection): void {
    this.poller?.stop();
    this.rtCounts = { vehicles: 0, tripUpdates: 0, alerts: 0 };
    this.vehicles = new Map();
    this.alerts = new Map();
    this.tripUpdates = [];

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

    poller.addEventListener('vehicles', (e) => {
      const detail = (e as CustomEvent<VehiclePosition[]>).detail;
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
    });
    poller.addEventListener('tripUpdates', (e) => {
      const detail = (e as CustomEvent<TripUpdate[]>).detail;
      this.rtCounts.tripUpdates = detail.length;
      this.tripUpdates = detail;
      this.dispatchEvent(
        new CustomEvent<TripUpdate[]>('tripUpdates', { detail })
      );
    });
    poller.addEventListener('alerts', (e) => {
      const detail = (e as CustomEvent<AlertRecord[]>).detail;
      this.rtCounts.alerts = detail.length;
      this.alerts = new Map(detail.map((a) => [a.id, a]));
      this.dispatchEvent(new CustomEvent<AlertRecord[]>('alerts', { detail }));
    });

    poller.start();
  }
}
