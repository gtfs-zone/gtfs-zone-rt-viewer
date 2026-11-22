import { PageStateManager } from 'gtfs-zone-web-common/ui/page-state-manager';
import { createPageStateCodec } from 'gtfs-zone-web-common/ui/page-state-schema';
import type { BreadcrumbItem } from 'gtfs-zone-web-common/ui/breadcrumb-trail';
import { TREE_PAGE_SPECS } from 'gtfs-zone-web-common/gtfs/tree-location';
import type { ModalState, PageLocation, PageState } from '../types/page-state';

/** The retired alerts modal is now the Service alerts page. */
function migrate(params: URLSearchParams): URLSearchParams {
  if (params.get('modal') === 'alerts') {
    params.delete('modal');
    params.set('type', 'service_alerts');
  }
  return params;
}

/**
 * The page is named by `type=`. Links from before it are read from which key
 * is present, in `untypedPages` order, and rewritten with `type=`.
 */
const pageStateCodec = createPageStateCodec<PageLocation, ModalState>({
  pages: TREE_PAGE_SPECS,
  modals: {
    help: { page: { param: 'modal_page', optional: true } },
  },
  typeParam: 'type',
  untypedPages: ['stop', 'vehicle', 'alert', 'route'],
  migrate,
});

export type AppPageStateManager = PageStateManager<
  PageState,
  BreadcrumbItem<PageState>
>;

/** The one manager AppState owns, synced to the hash. */
export function createPageStateManager(): AppPageStateManager {
  return new PageStateManager({ codec: pageStateCodec, enableUrlSync: true });
}
