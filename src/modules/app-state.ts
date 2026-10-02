/**
 * Focus changes and feed selection.
 *
 * The focus half is `gtfs-zone-web-common`'s `FocusController`: map click, panel link,
 * hash change and boot restore all converge on it. What this adds is the feed
 * half of the hash, and the boot sequence that reads a link before its feed
 * has loaded.
 */

import type { FeedSelection } from 'gtfs-zone-web-common/gtfs/feed-selection';
import type { BreadcrumbItem } from 'gtfs-zone-web-common/ui/breadcrumb-trail';
import type { FocusHooks } from 'gtfs-zone-web-common/ui/focus-controller';
import { ValidatedFocusController } from 'gtfs-zone-web-common/ui/focus-controller';
import type { PageState } from '../types/page-state';
import { buildBreadcrumbs, validateState } from './breadcrumbs';
import type { FeedSession } from './feed-session';
import {
  describeMissing,
  isComplete,
} from 'gtfs-zone-web-common/gtfs/feed-selection';
import { paramsToSelection, selectionToParams } from './feed-url';
import { createPageStateManager } from './page-state-manager';

/** What the hash named at boot, read once before anything loads. */
export interface BootRequest {
  selection: FeedSelection | null;
  /** True when the selection can be loaded as it stands. */
  complete: boolean;
  /** Why it cannot, when it names only half a session. */
  problem: string | null;
  /** The focus the link carried, captured before a load rewrites the hash. */
  pending: PageState;
}

export type AppStateHooks = FocusHooks<PageState>;

export class AppState extends ValidatedFocusController<
  PageState,
  BreadcrumbItem<PageState>
> {
  constructor(session: FeedSession, hooks: AppStateHooks) {
    super(createPageStateManager(), hooks, {
      breadcrumbs: (state) => buildBreadcrumbs(session, state),
      validate: (state) => validateState(session, state),
    });

    // The selection is half of the hash, so any change to it — a modal load, an
    // inline URL edit on the status page — has to be reflected there too.
    session.addEventListener('change', () => {
      this.pages.setFeedParams(selectionToParams(session.selection));
    });

    // A new scheduled feed almost never contains the object that was focused in
    // the old one, and leaving a stale focus in place would render an object
    // page for something the loaded feed does not describe.
    session.addEventListener('scheduleloaded', () => this.dropInvalidFocus());
  }

  /**
   * What the hash named, without loading any of it.
   *
   * The loading itself belongs to the one caller that already knows how to
   * report a failed load, so this only reads. `pending` has to be captured here
   * and handed back rather than re-read later: loading rewrites the feed half of
   * the hash, and the focus half would be re-read from a hash that no longer
   * names what the link named.
   *
   * `problem` is set for a link that names only half a session — the boot modal
   * prints it rather than a toast, since the modal is where it gets fixed.
   */
  bootRequest(): BootRequest {
    const selection = paramsToSelection(window.location.hash.slice(1));
    const pending = this.pages.pendingStateFromURL();
    if (!selection) {
      return { selection: null, complete: false, problem: null, pending };
    }
    const complete = isComplete(selection);
    return {
      selection,
      complete,
      // The modal's own hint line already names what is missing; this says why
      // the modal is open at all, which the hint cannot.
      problem: complete
        ? null
        : `This link names only part of a feed — ${describeMissing(selection).toLowerCase()}.`,
      pending,
    };
  }

  /**
   * Apply the focus a link carried, once its feed has actually loaded. A focus
   * that no longer resolves is reported rather than silently dropped.
   */
  finishBoot(pending: PageState): void {
    this.pendingFocus = pending;
    this.resolvePendingFocus(true);
  }

  /** Paint the empty app when boot loaded nothing. */
  bootEmpty(): void {
    this.repaint();
  }
}
