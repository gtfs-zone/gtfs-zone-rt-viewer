/**
 * The right panel's object pages: one dispatcher over `PageState`.
 *
 * The host, the realtime index, the live relative times and the route-strip
 * hover are `gtfs-zone-web-common`'s `RtPanel`. The panel re-renders on every
 * realtime poll, which is every 15 seconds; only pages that read realtime
 * data build the index.
 */

import type { PageState } from '../types/page-state';
import { RtPanel } from 'gtfs-zone-web-common/gtfs/rt-panel';
import type { RtIndex } from 'gtfs-zone-web-common/gtfs/rt-index';
import type { TreePage } from 'gtfs-zone-web-common/gtfs/tree-page';
import type { MapDataIssues } from 'gtfs-zone-web-common/map/layer-manager';
import { alertPage } from 'gtfs-zone-web-common/gtfs/alert-page';
import { agencyPage } from 'gtfs-zone-web-common/gtfs/agency-page';
import { feedInfoPage } from 'gtfs-zone-web-common/gtfs/feed-info-page';
import {
  schedulePage,
  type ScheduleSourceStatus,
} from 'gtfs-zone-web-common/gtfs/schedule-page';
import {
  routePage,
  type RoutePageOptions,
} from 'gtfs-zone-web-common/gtfs/route-page';
import { stopPage } from 'gtfs-zone-web-common/gtfs/stop-page';
import type { RtPageHooks } from 'gtfs-zone-web-common/gtfs/rt-page';
import { vehiclePage } from 'gtfs-zone-web-common/gtfs/vehicle-page';
import { tripPage } from 'gtfs-zone-web-common/gtfs/trip-page';
import {
  serviceAlertsPage,
  tripUpdatesPage,
  vehiclePositionsPage,
  type NodeEndpoint,
} from 'gtfs-zone-web-common/gtfs/realtime-node-page';
import type { RealtimeEndpointName } from 'gtfs-zone-web-common/gtfs/feed-selection';
import type { VehiclePosition } from 'gtfs-zone-web-common/gtfs/rt-types';
import { formatNumber } from 'gtfs-zone-web-common/i18n/fmt';
import { CONFIG } from '../config';
import type { FeedSession } from './feed-session';
import type { RenderContext } from './render-context';
import { homePage } from './home-page';
import { t } from '../i18n/messages';

export interface PanelRendererHooks {
  /** Navigate to a page, as if the user had clicked it on the map. */
  navigate: (state: PageState) => void;
  /** The full hash for a page, so links are real links. */
  href: (state: PageState) => string;
  /** Light a stop on the map while its route-strip row is hovered. */
  hoverStop: (stop_id: string | null) => void;
  /** Run a `data-action` button: Home's load, share and interval buttons. */
  action: (action: string, arg: string) => void;
  /** What the map could not draw, for the Schedule page. */
  mapIssues: () => MapDataIssues | null;
}

export class PanelRenderer extends RtPanel<PageState> {
  constructor(
    host: HTMLElement,
    session: FeedSession,
    hooks: PanelRendererHooks
  ) {
    // `change` carries endpoint status and schedule load state for Home and
    // the realtime nodes.
    super(host, session, ['vehicles', 'tripUpdates', 'alerts', 'change'], {
      ...hooks,
      renderPage: (state, rt) =>
        renderPage({ session, href: hooks.href }, rt, state, hooks.mapIssues),
    });
  }
}

const LINKS: RtPageHooks<PageState, VehiclePosition> = {
  vehicleLink: (v) => ({ type: 'vehicle', vehicle_key: v.key }),
  tripLink: (loc) => loc,
};

const ROUTE_OPTIONS: RoutePageOptions<PageState, VehiclePosition> = {
  ...LINKS,
  agencyLink: (agency_id) => ({ type: 'agency', agency_id }),
};

/** An endpoint's status block inputs, or null when it is not configured. */
function endpoint(
  session: FeedSession,
  name: RealtimeEndpointName
): NodeEndpoint | null {
  const status = session.status;
  const rt = session.selection?.realtime;
  if (!status || !rt) {
    return null;
  }
  const rawUrls: Record<RealtimeEndpointName, string> = {
    vehicles: rt.vehiclesUrl ?? '',
    tripUpdates: rt.tripUpdatesUrl ?? '',
    alerts: rt.alertsUrl ?? '',
  };
  return {
    status: status.endpoints[name],
    options: {
      rawUrl: rawUrls[name],
      rtBase: CONFIG.RT_BASE,
      useCors: rt.useCors,
      nextPollAt: status.nextPollAt,
    },
  };
}

/** What stands in for the vehicles endpoint on a schedule-only feed. */
function simulationNote(session: FeedSession): string {
  if (!session.simulating) {
    return `<p class="text-xs opacity-60">${t('status.noRealtime')}</p>`;
  }
  const running = session.scheduledRunning;
  const shown = session.rtCounts.vehicles;
  const capped =
    running !== null && running > shown
      ? `<p class="text-xs text-warning">${t('status.simulatingCapped', { running: formatNumber(running), shown: formatNumber(shown) })}</p>`
      : '';
  return `<p class="text-xs opacity-60">${t('status.simulating', { seconds: CONFIG.SCHEDULED_TICK_MS / 1000 })}</p>
      ${capped}`;
}

/** The selection's schedule and how its load went. */
function scheduleSource(session: FeedSession): ScheduleSourceStatus | null {
  const src = session.selection?.scheduled;
  if (!src) {
    return null;
  }
  return {
    label: src.label,
    url: src.kind === 'url' ? src.url : undefined,
    useCors: src.kind === 'url' ? src.useCors : undefined,
    loadedAt: session.scheduleLoadedAt,
    error: session.scheduleError,
    restored: session.scheduleRestored,
    storeError: session.storeError,
  };
}

/** `rt` builds the realtime index; only the cases that read it call it. */
function renderPage(
  ctx: RenderContext,
  rt: () => RtIndex,
  state: PageState,
  mapIssues: () => MapDataIssues | null
): TreePage {
  switch (state.type) {
    case 'home':
      return homePage(ctx);
    case 'schedule':
      return schedulePage(ctx, {
        source: scheduleSource(ctx.session),
        mapIssues: mapIssues(),
      });
    case 'feed_info':
      return feedInfoPage(ctx);
    case 'agency':
      return agencyPage(ctx, state.agency_id);
    case 'vehicle_positions':
      return vehiclePositionsPage(ctx, rt(), {
        endpoint: endpoint(ctx.session, 'vehicles'),
        noEndpoint: simulationNote(ctx.session),
        vehicleLink: LINKS.vehicleLink,
      });
    case 'trip_updates':
      return tripUpdatesPage(ctx, rt(), {
        endpoint: endpoint(ctx.session, 'tripUpdates'),
        tripLink: LINKS.tripLink,
      });
    case 'service_alerts':
      return serviceAlertsPage(ctx, {
        endpoint: endpoint(ctx.session, 'alerts'),
      });
    case 'route':
      return routePage(ctx, rt(), state.route_id, ROUTE_OPTIONS);
    case 'stop':
      return stopPage(ctx, rt(), state.stop_id, LINKS);
    case 'trip':
      return tripPage(ctx, rt(), state);
    case 'vehicle':
      return vehiclePage(ctx, rt(), state.vehicle_key);
    case 'alert':
      return alertPage(ctx, state.alert_id);
  }
}
