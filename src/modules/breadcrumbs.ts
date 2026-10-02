import type { PageState } from '../types/page-state';
import type { BreadcrumbItem } from 'gtfs-zone-web-common/ui/breadcrumb-trail';
import {
  alertParentCrumb,
  routeCrumb,
  rtAlertHeader,
  rtAlertParent,
  stopCrumbs,
  truncateCrumb,
} from 'gtfs-zone-web-common/gtfs/breadcrumbs';
import { feedByUrl } from 'gtfs-zone-web-common/gtfs/feed-catalog';
import type { FeedSelection } from 'gtfs-zone-web-common/gtfs/feed-selection';
import { describeSelection } from 'gtfs-zone-web-common/gtfs/feed-selection';
import type { FeedSession } from './feed-session';
import { vehicleDisplayName } from 'gtfs-zone-web-common/gtfs/entity-render';
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
function feedName(session: FeedSession): string | null {
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

export function vehicleLabel(session: FeedSession, vehicleId: string): string {
  const vehicle = session.vehicles.get(vehicleId);
  return vehicle
    ? vehicleDisplayName(session.scheduledFeed, vehicle)
    : vehicleId;
}

export function alertLabel(session: FeedSession, alertId: string): string {
  // The crumb's eyebrow already says "Service alert", so the fallback is the
  // bare id rather than a second "Alert".
  return rtAlertHeader(session.alerts, alertId) ?? alertId;
}

/**
 * The route a vehicle is on: its trip's route when the trip resolves against
 * the schedule, otherwise whatever `route_id` the feed asserted.
 */
function vehicleRouteId(
  session: FeedSession,
  vehicleId: string
): string | null {
  const vehicle = session.vehicles.get(vehicleId);
  if (!vehicle) {
    return null;
  }
  const fromTrip = vehicle.tripId
    ? session.scheduledFeed?.trips.get(vehicle.tripId)?.route_id
    : undefined;
  return fromTrip ?? vehicle.routeId ?? null;
}

export function buildBreadcrumbs(
  session: FeedSession,
  state: PageState
): BreadcrumbItem<PageState>[] {
  const feed = session.scheduledFeed;
  switch (state.type) {
    case 'home':
      return [];

    case 'route':
      return [home(session), routeCrumb(feed, state.route_id)];

    case 'stop':
      return [home(session), ...stopCrumbs(feed, state.stop_id)];

    case 'vehicle': {
      const routeId = vehicleRouteId(session, state.vehicle_id);
      return [
        home(session),
        ...(routeId ? [routeCrumb(feed, routeId)] : []),
        {
          typeLabel: t('crumb.vehicle'),
          label: truncateCrumb(vehicleLabel(session, state.vehicle_id)),
          pageState: state,
        },
      ];
    }

    case 'alert': {
      const parent = rtAlertParent(session.alerts, state.alert_id);
      return [
        home(session),
        ...(parent ? [alertParentCrumb(feed, parent)] : []),
        {
          typeLabel: t('crumb.alert'),
          label: truncateCrumb(alertLabel(session, state.alert_id)),
          pageState: state,
        },
      ];
    }
  }
}

/**
 * Whether a focus still names something in the loaded feed.
 *
 * Vehicles and alerts are checked against the last poll, so a focus can go
 * invalid without anything changing on our side — that is the point, and the
 * caller reports it rather than hiding it.
 */
export function validateState(session: FeedSession, state: PageState): boolean {
  switch (state.type) {
    case 'home':
      return true;
    case 'route':
      return session.scheduledFeed?.routes.has(state.route_id) ?? false;
    case 'stop':
      return session.scheduledFeed?.stops.has(state.stop_id) ?? false;
    case 'vehicle':
      return session.vehicles.has(state.vehicle_id);
    case 'alert':
      return session.alerts.has(state.alert_id);
  }
}
