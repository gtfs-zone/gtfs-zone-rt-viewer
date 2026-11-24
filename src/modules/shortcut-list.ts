/**
 * This app's keyboard commands: the shared map set plus opening the load
 * modal. There is no export, no undo and no patch manager here, so nothing in
 * this list is a shortcut to a feature that does not exist.
 */

import type { ShortcutCommand } from 'gtfs-zone-web-common/ui/keyboard-shortcuts';
import {
  mapShortcuts,
  type MapShortcutHost,
} from 'gtfs-zone-web-common/ui/shortcut-list';
import { t } from '../i18n/messages';

interface ShortcutHost extends MapShortcutHost {
  /** Open the load modal and load whatever it returns. */
  openLoadModal: () => Promise<void>;
}

export function viewerShortcuts(host: ShortcutHost): ShortcutCommand[] {
  return mapShortcuts(host, [
    {
      keys: 'ctrl+o',
      description: t('shortcut.openLoad'),
      handler: (e) => {
        e?.preventDefault();
        return host.openLoadModal();
      },
    },
  ]);
}
