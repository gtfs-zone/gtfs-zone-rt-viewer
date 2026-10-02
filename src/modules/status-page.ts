import type { EndpointStatus } from '../gtfs-rt';
import type { FeedSession } from './feed-session';
import type { MapDataIssues } from 'gtfs-zone-web-common/map/layer-manager';
import type {
  FeedGaps,
  ScheduleRelationshipCounts,
} from 'gtfs-zone-web-common/gtfs/rt-index';
import type { RealtimeEndpointName } from 'gtfs-zone-web-common/gtfs/feed-selection';
import {
  REALTIME_ENDPOINTS,
  REALTIME_ENDPOINT_LABELS,
} from 'gtfs-zone-web-common/gtfs/feed-selection';
import {
  TRIP_SCHEDULE_RELATIONSHIP_LABELS,
  STOP_TIME_SCHEDULE_RELATIONSHIP_LABELS,
} from 'gtfs-zone-web-common/gtfs/entity-render';
import { localClock } from 'gtfs-zone-web-common/gtfs/feed-time';
import { isReproducible } from './feed-url';
import {
  isLocalUrl,
  resolveRealtimeUrl,
} from 'gtfs-zone-web-common/gtfs/feed-url-resolve';
import { CONFIG } from '../config';
import { notify } from 'gtfs-zone-web-common/ui/notification-system';
import { renderIssueCard } from 'gtfs-zone-web-common/ui/issue-card';
import { formatNumber } from 'gtfs-zone-web-common/i18n/fmt';
import { t } from '../i18n/messages';
import { introHtml } from '../intro';

/**
 * The right panel's "nothing focused" content: what is loaded, how much of it,
 * and when each endpoint was last fetched.
 *
 * Read-only, deliberately. This used to carry a draft-based editor per URL,
 * with Apply/Revert, per-field errors and caret restoration to survive a poll
 * landing mid-edit — a lot of machinery to change a URL in a panel that repaints
 * itself every fifteen seconds. Changing a feed now means reopening the Load
 * modal, which comes up seeded from the current selection: the same edit, in the
 * place the feed was chosen, with none of the reconciliation.
 */

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Poll times are facts about this browser, not about the railroad, so they stay
 * in the reader's zone — labelled, so they read as distinct from the feed clock
 * used on the object pages.
 */
function formatClock(ms: number | null): string {
  if (!ms) {
    return '—';
  }
  return localClock(ms);
}

/** "12s ago" / "3m ago" — rendered by the shared ticker, not per-row timers. */
function formatRelative(ms: number): string {
  const secs = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (secs < 60) {
    return t('time.secondsAgo', { s: secs });
  }
  if (secs < 3600) {
    return t('time.minutesAgo', { m: Math.floor(secs / 60), s: secs % 60 });
  }
  return t('time.hoursAgo', {
    h: Math.floor(secs / 3600),
    m: Math.floor((secs % 3600) / 60),
  });
}

function formatCountdown(target: number): string {
  const secs = Math.round((target - Date.now()) / 1000);
  return secs <= 0 ? t('time.now') : t('time.seconds', { s: secs });
}

/**
 * One URL as configured, plus whatever the selection does to it on the way to
 * the network: RT base resolution for a bare path, the CORS proxy, or neither.
 * Both are worth stating — "it is fetching a different URL than the one I typed"
 * is the question this panel exists to answer.
 */
function renderUrl(url: string, useCors: boolean, isRealtime: boolean): string {
  if (!url) {
    return `<p class="text-xs opacity-40">${t('status.notSet')}</p>`;
  }

  const resolved = isRealtime ? resolveRealtimeUrl(url, CONFIG.RT_BASE) : url;
  // A local URL ignores the proxy setting (see `maybeProxy`); say so, but only
  // when the checkbox is on and therefore looks like it is doing something.
  const proxyBypassed = useCors && isLocalUrl(resolved);

  return `
    <p class="text-xs font-mono break-all opacity-70">${escHtml(url)}</p>
    ${
      resolved !== url
        ? `<p class="text-xs font-mono break-all opacity-40">-&gt; ${escHtml(resolved)}</p>`
        : ''
    }
    ${useCors && !proxyBypassed ? `<p class="text-xs opacity-50">${t('status.viaProxy')}</p>` : ''}
    ${
      proxyBypassed
        ? `<p class="text-xs opacity-50">${t('status.localUrl')}</p>`
        : ''
    }`;
}

function statTile(label: string, value: number | string): string {
  return `
    <div class="rounded-lg bg-base-200 px-3 py-2">
      <p class="text-xs opacity-60">${escHtml(label)}</p>
      <p class="text-lg font-semibold tabular-nums">${escHtml(typeof value === 'number' ? formatNumber(value) : value)}</p>
    </div>`;
}

function renderCounts(session: FeedSession): string {
  const s = session.scheduledFeed?.counts();
  const rt = session.rtCounts;
  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.counts')}</h3>
      <div class="grid grid-cols-3 gap-2">
        ${statTile(t('status.stops'), s?.stops ?? 0)}
        ${statTile(t('status.routes'), s?.routes ?? 0)}
        ${statTile(t('status.trips'), s?.trips ?? 0)}
        ${statTile(t('status.shapes'), s?.shapes ?? 0)}
        ${statTile(t('status.agencies'), s?.agencies ?? 0)}
        ${statTile(t('status.services'), s?.services ?? 0)}
        ${statTile(t('status.stopTimes'), s?.stopTimes ?? 0)}
        ${statTile(t('status.vehicles'), rt.vehicles)}
        ${statTile(t('status.tripUpdates'), rt.tripUpdates)}
        ${statTile(t('status.alerts'), rt.alerts)}
      </div>
    </section>`;
}

/** `data-since` / `data-until` are driven by the single shared ticker below. */
function renderEndpoint(
  ep: EndpointStatus,
  rawUrl: string,
  useCors: boolean,
  nextPollAt: number | null
): string {
  const label = REALTIME_ENDPOINT_LABELS[ep.name];

  const fetched = ep.lastFetchedAt
    ? `${formatClock(ep.lastFetchedAt)} <span class="opacity-60" data-since="${ep.lastFetchedAt}">${formatRelative(ep.lastFetchedAt)}</span>`
    : `<span class="opacity-40">${t('status.never')}</span>`;

  const dataAge = ep.feedTimestamp
    ? `${formatClock(ep.feedTimestamp * 1000)} <span class="opacity-60" data-since="${ep.feedTimestamp * 1000}">${formatRelative(ep.feedTimestamp * 1000)}</span>`
    : `<span class="opacity-40">${t('status.notReported')}</span>`;

  return `
    <div class="rounded-lg border border-base-300 p-3 space-y-2">
      <div class="flex items-center gap-2">
        <h4 class="font-medium text-sm flex-1">${escHtml(label)}</h4>
        ${ep.inFlight ? '<span class="loading loading-spinner loading-xs"></span>' : ''}
        ${ep.lastError ? `<span class="badge badge-error badge-xs">${t('status.error')}</span>` : ''}
        ${!ep.url ? `<span class="badge badge-ghost badge-xs">${t('status.notSet')}</span>` : ''}
      </div>

      <dl class="text-xs space-y-1">
        <div class="flex justify-between gap-2">
          <dt class="opacity-60">${t('status.lastFetched')}</dt><dd class="text-right">${fetched}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="opacity-60">${t('status.feedTimestamp')} <span class="opacity-50">${t('status.dataAge')}</span></dt>
          <dd class="text-right">${dataAge}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="opacity-60">${t('status.entities')}</dt>
          <dd class="text-right tabular-nums">${ep.entityCount === null || ep.entityCount === undefined ? '—' : formatNumber(ep.entityCount)}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="opacity-60">${t('status.nextRefresh')}</dt>
          <dd class="text-right">${
            nextPollAt
              ? `<span data-until="${nextPollAt}">${formatCountdown(nextPollAt)}</span>`
              : '—'
          }</dd>
        </div>
      </dl>

      ${
        ep.lastError
          ? `<p class="text-xs text-error break-words">${escHtml(ep.lastError)} <span class="opacity-60">${t('status.errorAt', { time: formatClock(ep.lastErrorAt) })}</span></p>`
          : ''
      }

      ${renderUrl(rawUrl, useCors, true)}

      ${ep.header ? renderHeaderDump(ep) : ''}
      ${renderVehicleIdReport(ep)}
    </div>`;
}

const VEHICLE_ID_STRATEGY_NOTE: Record<string, string> = {
  trip: t('status.idTrip'),
  entity: t('status.idEntity'),
  index: t('status.idIndex'),
};

/**
 * Report, don't absorb: when the vehicles feed's `vehicle.id` is not unique per
 * vehicle, state it plainly and name the offending ids (Plan 06 Root cause D).
 * A well-formed feed takes the `unique` no-op path and this renders nothing.
 */
function renderVehicleIdReport(ep: EndpointStatus): string {
  if (ep.name !== 'vehicles') {
    return '';
  }
  const strategy = ep.vehicleIdStrategy;
  if (!strategy || strategy === 'unique') {
    return '';
  }

  const dups = ep.vehiclesDuplicateIds;
  const list = dups.length
    ? `<ul class="mt-1 space-y-0.5">${dups
        .map(
          (d) =>
            `<li><span class="font-mono break-all">${escHtml(d.vehicleId || t('status.empty'))}</span> — ${t('status.dupVehicles', { count: d.count })}</li>`
        )
        .join('')}</ul>`
    : '';

  return `
    <div class="rounded-lg border border-warning/40 bg-warning/10 p-2 text-xs space-y-1">
      <p class="font-medium">${t('status.idNotUnique')}</p>
      <p class="opacity-70">${t('status.idNotUniqueText', {
        field: '<span class="font-mono">VehicleDescriptor.id</span>',
        strategy: escHtml(VEHICLE_ID_STRATEGY_NOTE[strategy] ?? strategy),
      })}</p>
      ${list}
    </div>`;
}

function renderHeaderDump(ep: EndpointStatus): string {
  const h = ep.header!;
  return `
    <details class="text-xs">
      <summary class="cursor-pointer opacity-60">FeedHeader</summary>
      <table class="table table-xs mt-1">
        <tbody>
          <tr><td class="opacity-60">gtfs_realtime_version</td><td>${escHtml(h.gtfsRealtimeVersion || '—')}</td></tr>
          <tr><td class="opacity-60">incrementality</td><td>${escHtml(h.incrementality || '—')}</td></tr>
          <tr><td class="opacity-60">timestamp</td><td>${h.timestamp ?? '—'}</td></tr>
        </tbody>
      </table>
    </details>`;
}

function renderEndpoints(session: FeedSession): string {
  const status = session.status;
  if (!status) {
    return '';
  }
  const rt = session.selection?.realtime;
  const rawUrls: Record<RealtimeEndpointName, string> = {
    vehicles: rt?.vehiclesUrl ?? '',
    tripUpdates: rt?.tripUpdatesUrl ?? '',
    alerts: rt?.alertsUrl ?? '',
  };
  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.endpoints')}</h3>
      ${REALTIME_ENDPOINTS.map((n) =>
        renderEndpoint(
          status.endpoints[n],
          rawUrls[n],
          rt?.useCors ?? false,
          status.nextPollAt
        )
      ).join('')}
    </section>`;
}

function renderScheduledSection(session: FeedSession): string {
  const src = session.selection?.scheduled;
  if (!src) {
    return '';
  }

  const source =
    src.kind === 'file'
      ? `<p class="text-xs opacity-60">${t('status.uploaded', { name: `<span class="font-mono">${escHtml(src.label)}</span>` })}</p>`
      : renderUrl(src.url, src.useCors, false);

  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.scheduled')}</h3>
      <div class="rounded-lg border border-base-300 p-3 space-y-2">
        <div class="flex items-center gap-2">
          <p class="text-sm flex-1">${escHtml(src.label)}</p>
          ${
            session.scheduleLoadedAt
              ? `<span class="text-xs opacity-60" data-since="${session.scheduleLoadedAt}">${formatRelative(session.scheduleLoadedAt)}</span>`
              : ''
          }
        </div>
        ${session.scheduleError ? `<p class="text-xs text-error break-words">${escHtml(session.scheduleError)}</p>` : ''}
        ${source}
      </div>
    </section>`;
}

/**
 * How the feed names each vehicle's current stop.
 *
 * `current_stop_sequence` is optional in GTFS-RT, and `stop_id` is an equally
 * legitimate way to say the same thing — plenty of feeds use only the latter.
 * That is worth stating but is not a defect, so it renders neutral. The border
 * turns to a warning only when gtfs-zone-rt-viewer had to infer a position from
 * predictions, or could not place a vehicle at all: those are the cases where
 * what is on screen is not simply what the feed said.
 *
 * A feed that reports the sequence renders nothing.
 */
function renderFeedGaps(gaps: FeedGaps | null): string {
  if (!gaps || gaps.missingStopSequence === 0) {
    return '';
  }
  const unplaced =
    gaps.missingStopSequence -
    gaps.resolvedFromStopId -
    gaps.stopSequenceDerived;
  const inferred = gaps.stopSequenceDerived > 0 || unplaced > 0;

  const notes = [
    t('status.gapsOptional', {
      missing: gaps.missingStopSequence,
      total: gaps.vehicles,
    }),
  ];
  if (gaps.resolvedFromStopId > 0) {
    notes.push(
      t('status.gapsStopId', {
        count: gaps.resolvedFromStopId,
        field: '<span class="font-mono">stop_id</span>',
      })
    );
  }
  if (gaps.stopSequenceDerived > 0) {
    notes.push(
      t('status.gapsDerived', {
        count: gaps.stopSequenceDerived,
        field: '<span class="font-mono">stop_time_update</span>',
      })
    );
  }
  if (unplaced > 0) {
    notes.push(t('status.gapsUnplaced', { count: unplaced }));
  }

  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${inferred ? t('status.gaps') : t('status.gapsNeutral')}</h3>
      <div class="rounded-lg border ${inferred ? 'border-warning/40' : 'border-base-300'} p-3 space-y-2">
        <div class="flex justify-between gap-2 text-xs">
          <span>${t('status.gapsRow', { field: '<span class="font-mono">current_stop_sequence</span>' })}</span>
          <span class="tabular-nums font-semibold">${gaps.missingStopSequence}</span>
        </div>
        <p class="text-xs opacity-50">${notes.join(' ')}</p>
      </div>
    </section>`;
}

/**
 * Feed-wide count of trips and stop times the producer took outside SCHEDULED.
 * These are statements the feed made about specific trips, not gaps in what it
 * reported, so the border stays neutral — the same rule `renderFeedGaps` follows
 * for `stop_id`-only feeds.
 *
 * A vehicle and a trip update for the same trip are counted separately, and the
 * row label says which is being counted rather than implying a trip count.
 *
 * Self-hides when every count is SCHEDULED or absent, the same rule
 * `renderIssueCard` uses.
 */
function renderScheduleRelationships(
  counts: ScheduleRelationshipCounts | null
): string {
  if (!counts) {
    return '';
  }

  const line = (label: string, n: number): string => `
    <div class="flex justify-between gap-2 text-xs">
      <span>${escHtml(label)}</span>
      <span class="tabular-nums font-semibold">${n}</span>
    </div>`;

  const rows: string[] = [];
  for (const [relationship, n] of counts.vehicleTrips) {
    if (relationship === 0) {
      continue;
    }
    const label =
      TRIP_SCHEDULE_RELATIONSHIP_LABELS[relationship] ?? String(relationship);
    rows.push(line(t('status.relVehicles', { count: n, label }), n));
  }
  for (const [relationship, n] of counts.updateTrips) {
    if (relationship === 0) {
      continue;
    }
    const label =
      TRIP_SCHEDULE_RELATIONSHIP_LABELS[relationship] ?? String(relationship);
    rows.push(line(t('status.relUpdates', { count: n, label }), n));
  }
  for (const [relationship, n] of counts.stopTimes) {
    if (relationship === 0) {
      continue;
    }
    const label =
      STOP_TIME_SCHEDULE_RELATIONSHIP_LABELS[relationship] ??
      String(relationship);
    rows.push(line(t('status.relStopTimes', { count: n, label }), n));
  }
  if (rows.length === 0) {
    return '';
  }

  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.relTitle')}</h3>
      <div class="rounded-lg border border-base-300 p-3 space-y-2">
        ${rows.join('')}
        <p class="text-xs opacity-50">${t('status.relNote')}</p>
      </div>
    </section>`;
}

/**
 * What the map could not draw. Surfacing these is the point of the tool: a stop
 * with no id or a vehicle pointing at a route the schedule never declares is
 * a feed bug, not a rendering one.
 */
function renderMapIssues(issues: MapDataIssues | null): string {
  if (!issues) {
    return '';
  }
  return renderIssueCard(t('status.mapIssues'), [
    {
      label: t('status.stopsNoId'),
      count: issues.stopsMissingId,
      note: t('status.stopsNoIdNote'),
    },
    {
      label: t('status.stopsNoCoords'),
      count: issues.stopsMissingCoords,
      note: t('status.stopsNoCoordsNote'),
    },
    {
      label: t('status.vehiclesUnmatched'),
      count: issues.vehiclesUnmatched,
      note: t('status.vehiclesUnmatchedNote'),
    },
    {
      label: t('status.vehiclesCollapsed'),
      count: issues.vehiclesDuplicateKeys,
      note: t('status.vehiclesCollapsedNote'),
    },
  ]);
}

/**
 * Malformed `parent_station` links found while indexing the station hierarchy.
 * A station page aggregates over its children, so a mis-wired hierarchy is a
 * reportable feed defect (Plan 06 Phase 7).
 */
function renderStationIssues(session: FeedSession): string {
  const issues = session.scheduledFeed?.stationIssues;
  if (!issues) {
    return '';
  }
  return renderIssueCard(t('status.stationIssues'), [
    {
      label: t('status.danglingParent'),
      count: issues.danglingParent,
      note: t('status.danglingParentNote'),
    },
    {
      label: t('status.wrongParent'),
      count: issues.nonStationParent,
      note: t('status.wrongParentNote'),
    },
    {
      label: t('status.cycle'),
      count: issues.cyclicStops,
      note: t('status.cycleNote'),
    },
  ]);
}

/**
 * CSV columns that arrived with leading/trailing whitespace and were trimmed at
 * parse time (see `parseCSV` in gtfs-scheduled.ts). The GTFS reference forbids the
 * padding, and it is silently fatal: a padded scheduled `stop_id` matches no clean
 * realtime `stop_id`, so absorbing it without saying so would hide the defect.
 *
 * Rows are counted, not distinct values — "3544 rows" is a fact; "3544 stops"
 * would invite the reader to wonder whether any were merged. A clean feed (which
 * is nearly all of them) renders nothing, so this never becomes furniture.
 *
 * Kept bespoke rather than folded into `renderIssueCard`: the label and the note
 * both carry inline `font-mono` markup for the file and column names, which an
 * escaping helper cannot pass through.
 */
function renderPaddedColumns(session: FeedSession): string {
  const padded = session.scheduledFeed?.paddedColumns;
  if (!padded || padded.length === 0) {
    return '';
  }

  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.padded')}</h3>
      <div class="rounded-lg border border-warning/40 p-3 space-y-2">
        ${padded
          .map(
            ({ file, column, rows }) => `
          <div>
            <div class="flex justify-between gap-2 text-xs">
              <span><span class="font-mono">${escHtml(file)}</span> <span class="font-mono">${escHtml(column)}</span></span>
              <span class="tabular-nums font-semibold">${rows}</span>
            </div>
            <p class="text-xs opacity-50">${t('status.paddedNote', {
              rows,
              column: `<span class="font-mono">${escHtml(column)}</span>`,
            })}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>`;
}

/** feed_info.txt and agency.txt, verbatim. */
function renderRawTables(session: FeedSession): string {
  const feed = session.scheduledFeed;
  if (!feed) {
    return '';
  }
  const tables = [
    ...feed.feedInfo.map((info) => ['feed_info.txt', info.raw] as const),
    ...feed.agencies.map((agency) => ['agency.txt', agency.raw] as const),
  ];
  if (tables.length === 0) {
    return '';
  }

  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.metadata')}</h3>
      ${tables
        .map(
          ([file, row]) => `
        <details class="text-xs rounded-lg border border-base-300 p-2">
          <summary class="cursor-pointer">${escHtml(file)}${
            row.agency_name ? ` — ${escHtml(row.agency_name)}` : ''
          }</summary>
          <table class="table table-xs mt-1">
            <tbody>
              ${Object.entries(row)
                .map(
                  ([k, v]) =>
                    `<tr><td class="opacity-60 align-top">${escHtml(k)}</td><td class="break-all">${escHtml(v ?? '')}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        </details>`
        )
        .join('')}
    </section>`;
}

/**
 * The hash is long enough that reading it out of the address bar is unpleasant,
 * so copying is the primary path rather than an afterthought.
 */
function renderShare(session: FeedSession): string {
  if (!session.selection) {
    return '';
  }
  const reproducible = isReproducible(session.selection);
  return `
    <section class="space-y-2">
      <h3 class="font-semibold text-sm">${t('status.share')}</h3>
      <div class="rounded-lg border border-base-300 p-3 space-y-2">
        <button class="btn btn-xs btn-primary" id="status-copy-link" ${
          reproducible ? '' : 'disabled'
        }>${t('status.copyLink')}</button>
        <p class="text-xs opacity-60">
          ${reproducible ? t('status.shareNote') : t('status.shareFile')}
        </p>
      </div>
    </section>`;
}

function renderEmpty(): string {
  return `
    <div class="flex flex-col gap-6 py-4">
      ${introHtml()}
      <div class="flex flex-col items-center text-center gap-3">
        <p class="text-xs opacity-40 max-w-xs">${t('status.emptyNote')}</p>
        <button type="button" id="status-empty-load" class="btn btn-primary btn-sm">
          ${t('status.pickFeed')}
        </button>
      </div>
    </div>`;
}

export class StatusPage {
  private host: HTMLElement;
  private session: FeedSession;
  private tickerId: ReturnType<typeof setInterval> | null = null;
  private renderQueued = false;
  /** False while an object page owns the panel; polls must not paint over it. */
  private active = true;

  constructor(host: HTMLElement, session: FeedSession) {
    this.host = host;
    this.session = session;
  }

  private shareUrl: (() => string) | null = null;
  private openLoad: (() => void) | null = null;
  private mapIssues: (() => MapDataIssues) | null = null;
  private feedGaps: (() => FeedGaps) | null = null;
  private scheduleRelationships: (() => ScheduleRelationshipCounts) | null =
    null;

  /** Supplied by AppState, which is the only thing that knows the full hash. */
  setShareUrlProvider(fn: () => string): void {
    this.shareUrl = fn;
  }

  /** Supplied by the host: the empty state's button opens the load modal. */
  setOpenLoadHandler(fn: () => void): void {
    this.openLoad = fn;
  }

  /** Supplied by MapController — only the layer stack knows what it dropped. */
  setMapIssuesProvider(fn: () => MapDataIssues): void {
    this.mapIssues = fn;
  }

  /** Supplied by PanelRenderer, which owns the realtime read-model. */
  setFeedGapsProvider(fn: () => FeedGaps): void {
    this.feedGaps = fn;
  }

  /** Supplied by PanelRenderer, which owns the realtime read-model. */
  setScheduleRelationshipsProvider(fn: () => ScheduleRelationshipCounts): void {
    this.scheduleRelationships = fn;
  }

  /** Called by AppState when focus moves to or away from home. */
  setActive(active: boolean): void {
    this.active = active;
    if (active) {
      this.render();
    }
  }

  initialize(): void {
    this.session.addEventListener('change', () => this.queueRender());
    this.render();
    // One shared ticker walks every relative timestamp; one interval per row
    // would leak on each re-render.
    this.tickerId = setInterval(() => this.tick(), 1000);
  }

  destroy(): void {
    if (this.tickerId !== null) {
      clearInterval(this.tickerId);
    }
    this.tickerId = null;
  }

  /** Coalesce the burst of statuschange events a single poll produces. */
  private queueRender(): void {
    if (this.renderQueued) {
      return;
    }
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      this.render();
    });
  }

  private tick(): void {
    if (!this.active) {
      return;
    }
    this.host.querySelectorAll<HTMLElement>('[data-since]').forEach((el) => {
      el.textContent = formatRelative(Number(el.dataset.since));
    });
    this.host.querySelectorAll<HTMLElement>('[data-until]').forEach((el) => {
      el.textContent = formatCountdown(Number(el.dataset.until));
    });
  }

  private render(): void {
    if (!this.active) {
      return;
    }

    if (!this.session.selection) {
      this.host.innerHTML = renderEmpty();
      this.host
        .querySelector<HTMLButtonElement>('#status-empty-load')
        ?.addEventListener('click', () => this.openLoad?.());
      return;
    }

    this.host.innerHTML = `
      <div class="space-y-4">
        ${renderCounts(this.session)}
        ${renderFeedGaps(this.feedGaps?.() ?? null)}
        ${renderScheduleRelationships(this.scheduleRelationships?.() ?? null)}
        ${renderMapIssues(this.mapIssues?.() ?? null)}
        ${renderStationIssues(this.session)}
        ${renderPaddedColumns(this.session)}
        ${renderScheduledSection(this.session)}
        ${renderEndpoints(this.session)}
        ${renderShare(this.session)}
        ${renderRawTables(this.session)}
      </div>`;

    this.wire();
  }

  private wire(): void {
    const copyBtn =
      this.host.querySelector<HTMLButtonElement>('#status-copy-link');
    copyBtn?.addEventListener('click', () => {
      if (!this.shareUrl) {
        return;
      }
      void navigator.clipboard
        .writeText(this.shareUrl())
        .then(() => notify.success(t('status.copied')))
        .catch(() => notify.error(t('status.copyFailed')));
    });
  }
}
