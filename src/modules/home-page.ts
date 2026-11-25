/**
 * Home: the four tree nodes with a one-line state each, the realtime refresh
 * interval and Share. Before a feed is chosen, the intro and a button that
 * opens the load modal.
 */

import type { TreePage } from 'gtfs-zone-web-common/gtfs/tree-page';
import {
  endpointNodeState,
  treeNodeRows,
  type TreeNodeState,
} from 'gtfs-zone-web-common/gtfs/realtime-node-page';
import { hasAnyRealtimeUrl } from 'gtfs-zone-web-common/gtfs/feed-selection';
import { escapeHtml } from 'gtfs-zone-web-common/util/escape-html';
import { CONFIG } from '../config';
import type { RenderContext } from './render-context';
import type { FeedSession } from './feed-session';
import { feedName } from './breadcrumbs';
import { isReproducible } from './feed-url';
import { introHtml } from '../intro';
import { t } from '../i18n/messages';

/** `data-action` names Home's buttons send to the panel. */
export const HOME_ACTIONS = {
  openLoad: 'open-load',
  copyLink: 'copy-link',
  interval: 'interval',
} as const;

/** No feed yet: the intro and the button that opens the load modal. */
function emptyPage(): TreePage {
  return {
    eyebrow: t('crumb.feed'),
    title: t('crumb.noFeed'),
    sections: [
      {
        body: `
          <div class="flex flex-col gap-6 py-4">
            ${introHtml()}
            <div class="flex flex-col items-center text-center gap-3">
              <button type="button" data-action="${HOME_ACTIONS.openLoad}" class="btn btn-primary btn-sm">
                ${t('status.pickFeed')}
              </button>
            </div>
          </div>`,
      },
    ],
  };
}

function scheduleState(session: FeedSession): TreeNodeState {
  const type = 'schedule';
  if (session.scheduleError) {
    return {
      type,
      state: t('home.scheduleError', { message: session.scheduleError }),
    };
  }
  if (session.scheduledFeed) {
    return {
      type,
      state: t('home.scheduleLoaded'),
      since: session.scheduleLoadedAt ?? undefined,
    };
  }
  return {
    type,
    state: session.selection?.scheduled
      ? t('home.scheduleLoading')
      : t('home.noSchedule'),
  };
}

function nodeStates(session: FeedSession): TreeNodeState[] {
  const endpoints = session.status?.endpoints;
  return [
    scheduleState(session),
    session.simulating
      ? { type: 'vehicle_positions', state: t('home.simulated') }
      : endpointNodeState('vehicle_positions', endpoints?.vehicles ?? null),
    endpointNodeState('trip_updates', endpoints?.tripUpdates ?? null),
    endpointNodeState('service_alerts', endpoints?.alerts ?? null),
  ];
}

function renderInterval(session: FeedSession): string {
  const current = session.pollIntervalMs;
  return `<div class="join">${CONFIG.RT_INTERVAL_OPTIONS_MS.map(
    (ms) =>
      `<button type="button" class="btn btn-xs join-item${ms === current ? ' btn-active' : ''}" data-action="${HOME_ACTIONS.interval}" data-arg="${ms}">${escapeHtml(t('shell.seconds', { n: ms / 1000 }))}</button>`
  ).join('')}</div>`;
}

/**
 * The hash is long enough that reading it out of the address bar is
 * unpleasant, so copying is the primary path.
 */
function renderShare(session: FeedSession): string {
  const reproducible = session.selection
    ? isReproducible(session.selection)
    : false;
  return `
    <div class="rounded-lg border border-base-300 p-3 space-y-2">
      <button type="button" class="btn btn-xs btn-primary" data-action="${HOME_ACTIONS.copyLink}" ${
        reproducible
          ? ''
          : `disabled title="${escapeHtml(t('status.shareFile'))}"`
      }>${t('status.copyLink')}</button>
      <p class="text-xs opacity-60">
        ${reproducible ? t('status.shareNote') : t('status.shareFile')}
      </p>
    </div>`;
}

export function homePage(ctx: RenderContext): TreePage {
  const session = ctx.session;
  if (!session.selection) {
    return emptyPage();
  }
  const realtime = hasAnyRealtimeUrl(session.selection.realtime);
  return {
    eyebrow: t('crumb.feed'),
    title: feedName(session) ?? t('crumb.noFeed'),
    sections: [
      { body: treeNodeRows(ctx, nodeStates(session)) },
      ...(realtime
        ? [{ title: t('shell.refreshRate'), body: renderInterval(session) }]
        : []),
      { title: t('status.share'), body: renderShare(session) },
    ],
  };
}
