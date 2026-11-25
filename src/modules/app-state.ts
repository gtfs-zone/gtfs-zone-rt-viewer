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
import {
  linkedUploadId,
  paramsToSelection,
  selectionToParams,
} from './feed-url';
import { createPageStateManager } from './page-state-manager';
import { t } from '../i18n/messages';

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
  constructor(
    private session: FeedSession,
    hooks: AppStateHooks
  ) {
    super(createPageStateManager(), hooks, {
      breadcrumbs: (state) => buildBreadcrumbs(session, state),
      validate: (state) => validateState(session, state),
    });

    // The selection is half of the hash, so any change to it, a modal load or a
    // reload, has to be reflected there too.
    session.addEventListener('change', () => {
      this.pages.setFeedParams(
        selectionToParams(session.selection, session.uploadId)
      );
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
    const hash = window.location.hash.slice(1);
    const selection = paramsToSelection(hash, (id) =>
      this.session.uploadSource(id)
    );
    const pending = this.pages.pendingStateFromURL();
    const uploadId = linkedUploadId(hash);
    if (uploadId && !this.session.uploadSource(uploadId)) {
      return {
        selection: selection?.realtime ? selection : null,
        complete: false,
        problem: t('load.uploadMissing'),
        pending,
      };
    }
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
        : t('load.partialLink', {
            missing: describeMissing(selection).toLowerCase(),
          }),
      pending,
    };
  }

  /**
   * Apply the focus a link carried, once its feed has actually loaded.
   *
   * Vehicles, alerts and realtime-only trips arrive with the first poll, after
   * the schedule, so the focus is retried on each payload and only reported as
   * missing once every endpoint has answered.
   */
  async finishBoot(pending: PageState): Promise<void> {
    const selection = this.session.selection;
    this.pendingFocus = pending;
    // The schedule mirrors only the trips something asked for, so a linked
    // trip is fetched before it is validated.
    const feed = this.session.scheduledFeed;
    if (pending.type === 'trip' && pending.trip_id && feed) {
      await feed
        .loadTrips([pending.trip_id], { stopTimes: false })
        .catch((err) => {
          console.error('[boot] loading the linked trip failed', err);
        });
    }
    this.resolvePendingFocus(false);
    if (!this.pendingFocus) {
      return;
    }

    const retry = (): void => this.resolvePendingFocus(false);
    const kinds = ['vehicles', 'tripUpdates', 'alerts'] as const;
    for (const kind of kinds) {
      this.session.addEventListener(kind, retry);
    }
    await this.session.realtimeSettled();
    for (const kind of kinds) {
      this.session.removeEventListener(kind, retry);
    }

    // A feed loaded since boot is not the one the link named.
    if (this.session.selection !== selection) {
      this.pendingFocus = null;
      return;
    }
    this.resolvePendingFocus(true);
  }

  /** Paint the empty app when boot loaded nothing. */
  bootEmpty(): void {
    this.repaint();
  }
}
