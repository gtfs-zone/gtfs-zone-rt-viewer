import {
  renderNavIcon,
  type NavIconName,
} from 'gtfs-zone-web-common/ui/nav-icons';
import {
  realtimeNavbarActions,
  renderOutlineIcon,
} from 'gtfs-zone-web-common/ui/navbar-action-list';
import { t } from '../i18n/messages';

/**
 * This app's navbar action row and dock artwork. Element ids are the contract
 * with the click wiring in `src/index.ts`.
 *
 * The realtime refresh-rate picker is not here: it is a dropdown, not one of
 * the navbar action kinds, and stays as sibling markup in `index.html`.
 */

const RELOAD_PATH =
  'M16.023 9.348h4.992V4.356m-.001 4.992-3.181-3.183a8.25 8.25 0 0 0-13.803 3.7M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7';
const PENCIL_PATH =
  'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125';

export const NAVBAR_ACTIONS = realtimeNavbarActions({
  repo: 'gtfs-zone-rt-viewer',
  leading: [
    {
      kind: 'icon',
      id: 'reload-feed-btn',
      label: t('nav.reload'),
      icon: renderOutlineIcon(RELOAD_PATH),
      tooltipId: 'reload-feed-tip',
    },
    {
      // The href is written at boot from the loaded feed's schedule URL.
      kind: 'link',
      id: 'edit-feed-btn',
      label: t('nav.edit'),
      icon: renderOutlineIcon(PENCIL_PATH),
      href: '#',
      external: true,
      tooltipId: 'edit-feed-tip',
    },
  ],
  trailing: [
    {
      kind: 'labeled',
      id: 'load-btn',
      // Opens the one modal covering every feed source.
      label: t('nav.load'),
      icon: renderNavIcon('load', { sizeClass: 'h-4 w-4' }),
      btnClass: 'btn-primary',
    },
  ],
});

/**
 * Icons the mobile dock shares with the navbar, by element id. Alerts names the
 * indicator span rather than the button, so the badge keeps its anchor.
 */
export const DOCK_ICONS: [string, NavIconName][] = [
  ['dock-browse', 'browse'],
  ['dock-alerts-icon', 'alerts'],
  ['dock-help', 'guide'],
];
