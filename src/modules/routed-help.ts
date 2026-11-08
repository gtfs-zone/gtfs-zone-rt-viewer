/**
 * Opens the guide with its open page kept in the hash. A sidebar click
 * replaces the hash rather than pushing, so Back still closes the guide; a
 * navigation that names another page (a hand-edited hash) switches to it.
 */

import { showHelpModal } from 'gtfs-zone-web-common/ui/help-modal';
import type { NavigationEvent } from 'gtfs-zone-web-common/ui/page-state-manager';
import type { PageState } from '../types/page-state';
import type { AppPageStateManager } from './page-state-manager';

export async function showRoutedHelpModal(
  pages: AppPageStateManager,
  page: string | undefined
): Promise<void> {
  const selectRef = { select: async (_page?: string): Promise<void> => {} };
  const onNavigate = (event: NavigationEvent<PageState>) => {
    const modal = event.to.modal;
    if (modal?.type === 'help') {
      void selectRef.select(modal.page);
    }
  };
  pages.addNavigationHandler(onNavigate);

  try {
    await showHelpModal(page, {
      onSelect: (id) => {
        console.log(`[RoutedHelp] switching to ${id}`);
        pages.rewrite((state) =>
          state.modal?.type === 'help'
            ? { ...state, modal: { type: 'help', page: id } }
            : null
        );
        void selectRef.select(id);
      },
      selectRef,
    });
  } finally {
    pages.removeNavigationHandler(onNavigate);
  }
}
