import type { WithModal } from 'gtfs-zone-web-common/ui/page-state-schema';

/**
 * Union of every page gtfs-zone-rt-viewer can display. Each variant carries the minimal
 * set of object keys needed to identify and restore the page.
 *
 * Route, stop, vehicle and alert ids are each unique within a feed, so no
 * variant needs a parent id to disambiguate.
 */
export type PageLocation =
  | { type: 'home' }
  | { type: 'route'; route_id: string }
  | { type: 'stop'; stop_id: string }
  | { type: 'vehicle'; vehicle_id: string }
  | { type: 'alert'; alert_id: string };

/**
 * The modals that live in the URL hash. The load modal is deliberately absent:
 * it is a boot step and a transient editor of the feed selection, and the
 * selection it produces is already in the hash on its own.
 *
 * A modal is orthogonal to the page beneath it: closing one returns to that
 * page rather than to a separate page state. `page` names the guide page the
 * help modal opens on.
 */
export type ModalState = { type: 'alerts' } | { type: 'help'; page?: string };

export type PageState = WithModal<PageLocation, ModalState>;
