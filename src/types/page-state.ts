import type { WithModal } from 'gtfs-zone-web-common/ui/page-state-schema';
import type { TreeLocation } from 'gtfs-zone-web-common/gtfs/tree-location';

/** Every page gtfs-zone-rt-viewer can display: the shared object tree. */
export type PageLocation = TreeLocation;

/**
 * The modals that live in the URL hash. The load modal is deliberately absent:
 * it is a boot step and a transient editor of the feed selection, and the
 * selection it produces is already in the hash on its own.
 *
 * A modal is orthogonal to the page beneath it: closing one returns to that
 * page rather than to a separate page state. `page` names the guide page the
 * help modal opens on.
 */
export type ModalState = { type: 'help'; page?: string };

export type PageState = WithModal<PageLocation, ModalState>;
