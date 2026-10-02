/**
 * The right panel's object pages: one dispatcher over `PageState`.
 *
 * The host, the realtime index, the live relative times and the route-strip
 * hover are `gtfs-zone-web-common`'s `RtPanel`. The panel re-renders on every
 * realtime poll, which is every 15 seconds.
 */

import type { PageState } from '../types/page-state';
import { RtPanel } from 'gtfs-zone-web-common/gtfs/rt-panel';
import type { RtIndex } from 'gtfs-zone-web-common/gtfs/rt-index';
import type { FeedSession } from './feed-session';
import type { RenderContext } from './render-context';
import type { RtPageHooks } from 'gtfs-zone-web-common/gtfs/rt-page';
import { renderAlertPage } from 'gtfs-zone-web-common/gtfs/alert-page';
import { renderRoutePage } from 'gtfs-zone-web-common/gtfs/route-page';
import { renderStopPage } from 'gtfs-zone-web-common/gtfs/stop-page';
import type { VehiclePosition } from 'gtfs-zone-web-common/gtfs/rt-types';
import { renderVehiclePage } from './pages/vehicle-page';

export interface PanelRendererHooks {
  /** Navigate to a page, as if the user had clicked it on the map. */
  navigate: (state: PageState) => void;
  /** The full hash for a page, so links are real links. */
  href: (state: PageState) => string;
  /** Light a stop on the map while its route-strip row is hovered. */
  hoverStop: (stop_id: string | null) => void;
}

export class PanelRenderer extends RtPanel<PageState> {
  constructor(
    host: HTMLElement,
    session: FeedSession,
    hooks: PanelRendererHooks
  ) {
    super(host, session, ['vehicles', 'tripUpdates', 'alerts'], {
      ...hooks,
      renderPage: (state, index) =>
        renderPage({ session, href: hooks.href }, index, state),
    });
  }
}

const PAGE_HOOKS: RtPageHooks<PageState, VehiclePosition> = {
  vehicleLink: (v) => ({ type: 'vehicle', vehicle_id: v.key }),
  vehicleNoun: 'vehicle',
};

function renderPage(
  ctx: RenderContext,
  index: RtIndex,
  state: PageState
): string {
  switch (state.type) {
    case 'home':
      return '';
    case 'route':
      return renderRoutePage(ctx, index, state.route_id, PAGE_HOOKS);
    case 'stop':
      return renderStopPage(ctx, index, state.stop_id, PAGE_HOOKS);
    case 'vehicle':
      return renderVehiclePage(ctx, index, state);
    case 'alert':
      return renderAlertPage(ctx, state.alert_id);
  }
}
