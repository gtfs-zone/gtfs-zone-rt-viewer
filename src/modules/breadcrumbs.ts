import type { PageState } from '../types/page-state';
import type { BreadcrumbItem } from 'gtfs-zone-web-common/ui/breadcrumb-trail';
import {
  rtAlertHeader,
  rtTreeCrumbs,
  scheduledCrumbSource,
  truncateCrumb,
  validateTreeLocation,
  type RtTreeSource,
} from 'gtfs-zone-web-common/gtfs/breadcrumbs';
import { feedByUrl } from 'gtfs-zone-web-common/gtfs/feed-catalog';
import type { FeedSelection } from 'gtfs-zone-web-common/gtfs/feed-selection';
import { describeSelection } from 'gtfs-zone-web-common/gtfs/feed-selection';
import type { FeedSession } from './feed-session';
import { vehicleDisplayName } from 'gtfs-zone-web-common/gtfs/entity-render';
import { tripInRealtime } from 'gtfs-zone-web-common/gtfs/trip-page';
import { t } from '../i18n/messages';

/**
 * Synchronous breadcrumb building and focus validation against the loaded feed.
 *
 * gtfs-zone-editor resolves breadcrumbs through an async, database-backed lookup
 * interface. Our whole model is in memory, so both of these are plain reads.
 */

/** The feed catalog's name for a selection's scheduled URL, once the catalog has loaded. */
function catalogName(selection: FeedSelection | null): string | null {
  const scheduled = selection?.scheduled;
  if (scheduled?.kind !== 'url') {
    return null;
  }
  return feedByUrl(scheduled.url)?.name ?? null;
}

/**
 * What to call the loaded feed.
 *
 * A selection restored from a link carries no name, so it falls back to its
 * host — a URL where a name belongs. Once the schedule parses, the feed names
 * itself, so ask it first and only walk back towards the URL from there.
 */
export function feedName(session: FeedSession): string | null {
  const feed = session.scheduledFeed;

  const publisher = feed?.feedInfo[0]?.publisher_name.trim();
  if (publisher) {
    return publisher;
  }

  const named = (feed?.agencies ?? []).filter((agency) => agency.name.trim());
  if (named.length === 1) {
    return named[0].name.trim();
  }
  if (named.length > 1) {
    return t('crumb.more', {
      name: named[0].name.trim(),
      count: named.length - 1,
    });
  }

  const cataloged = catalogName(session.selection);
  if (cataloged) {
    return cataloged;
  }

  const described = session.selection
    ? describeSelection(session.selection)
    : null;
  return described && described !== 'feeds' ? described : null;
}

/**
 * The root crumb. Its eyebrow says what the page is, its label names the feed
 * being looked at, so the crumb reads like every other one: type over object.
 */
function home(session: FeedSession): BreadcrumbItem<PageState> {
  return {
    typeLabel: t('crumb.feed'),
    label: truncateCrumb(feedName(session) ?? t('crumb.noFeed')),
    pageState: { type: 'home' },
  };
}

export function alertLabel(session: FeedSession, alertId: string): string {
  // The crumb's eyebrow already says "Service alert", so the fallback is the
  // bare id rather than a second "Alert".
  return rtAlertHeader(session.alerts, alertId) ?? alertId;
}

/** The loaded schedule and the last poll, as the shared tree reads them. */
function treeSource(session: FeedSession): RtTreeSource {
  const feed = session.scheduledFeed;
  return {
    ...scheduledCrumbSource(feed),
    hasFeedInfo: () => (feed?.feedInfo.length ?? 0) > 0,
    vehicle(key) {
      const vehicle = session.vehicles.get(key);
      return vehicle ? { label: vehicleDisplayName(feed, vehicle) } : null;
    },
    alert(alertId) {
      return session.alerts.has(alertId)
        ? { label: alertLabel(session, alertId) }
        : null;
    },
    realtimeTrip: (loc) => tripInRealtime(session, loc),
  };
}

export function buildBreadcrumbs(
  session: FeedSession,
  state: PageState
): BreadcrumbItem<PageState>[] {
  if (state.type === 'home') {
    return [];
  }
  return [home(session), ...rtTreeCrumbs(treeSource(session), state)];
}

/** The pages the viewer renders; the rest of the tree is not built yet. */
const RENDERED: ReadonlySet<PageState['type']> = new Set([
  'home',
  'schedule',
  'feed_info',
  'agency',
  'vehicle_positions',
  'trip_updates',
  'service_alerts',
  'route',
  'trip',
  'stop',
  'vehicle',
  'alert',
]);

/**
 * Whether a focus still names something in the loaded feed.
 *
 * Vehicles and alerts are checked against the last poll, so a focus can go
 * invalid without anything changing on our side — that is the point, and the
 * caller reports it rather than hiding it.
 */
export function validateState(session: FeedSession, state: PageState): boolean {
  return (
    RENDERED.has(state.type) && validateTreeLocation(treeSource(session), state)
  );
}
