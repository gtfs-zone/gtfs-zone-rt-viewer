import { PageStateManager } from 'gtfs-zone-web-common/ui/page-state-manager';
import { createPageStateCodec } from 'gtfs-zone-web-common/ui/page-state-schema';
import type { BreadcrumbItem } from 'gtfs-zone-web-common/ui/breadcrumb-trail';
import type { ModalState, PageLocation, PageState } from '../types/page-state';

/** No type param: the page is read from which key is present, in this order. */
const pageStateCodec = createPageStateCodec<PageLocation, ModalState>({
  pages: {
    stop: { stop_id: 'stop' },
    vehicle: { vehicle_id: 'vehicle' },
    alert: { alert_id: 'alert' },
    route: { route_id: 'route' },
  },
  modals: {
    alerts: {},
    help: { page: { param: 'modal_page', optional: true } },
  },
});

export type AppPageStateManager = PageStateManager<
  PageState,
  BreadcrumbItem<PageState>
>;

/** The one manager AppState owns, synced to the hash. */
export function createPageStateManager(): AppPageStateManager {
  return new PageStateManager({ codec: pageStateCodec, enableUrlSync: true });
}
