/**
 * Turns the loaded session into search groups for `SearchController`.
 *
 * The payload is a `PageState`, so a selected result goes through `setFocus`
 * like any other navigation and the panel, map and hash all follow.
 *
 * Stops and routes are built once per scheduled feed, so the controller's
 * haystack cache hits on every keystroke. Vehicles come from the session's
 * live map and are rebuilt per query, so they are as fresh as the last poll.
 */

import { VEHICLE_UNMATCHED_COLOR } from 'gtfs-zone-web-common/map/layer-manager';
import type { GTFSScheduled } from 'gtfs-zone-web-common/gtfs/scheduled';
import type { PageState } from '../types/page-state';
import type { FeedSession } from './feed-session';
import {
  vehicleDisplayName,
  vehicleRouteId,
} from 'gtfs-zone-web-common/gtfs/entity-render';
import {
  scheduleSearchGroups,
  searchHaystack,
  type ScheduleSearchGroups,
} from 'gtfs-zone-web-common/gtfs/search-entries';
import {
  dotMarker,
  type SearchEntry,
  type SearchGroup,
} from 'gtfs-zone-web-common/ui/search-controller';
import { t } from '../i18n/messages';

let memo: {
  feed: GTFSScheduled | null;
  groups: ScheduleSearchGroups;
} | null = null;

/** Stops and routes of `feed`, rebuilt only when the scheduled feed changes. */
function scheduleGroups(feed: GTFSScheduled | null): ScheduleSearchGroups {
  if (memo?.feed !== feed) {
    console.log('[SearchEntries] building schedule search groups');
    memo = { feed, groups: scheduleSearchGroups(feed) };
  }
  return memo.groups;
}

export function buildSearchGroups(
  session: FeedSession
): SearchGroup<PageState>[] {
  const feed = session.scheduledFeed;
  const { stops, routes } = scheduleGroups(feed);

  const vehicles: SearchEntry<PageState>[] = [];
  for (const vehicle of session.vehicles.values()) {
    // Same color the map paints it: the vehicle's route, or the unmatched grey.
    const routeId = vehicleRouteId(feed, vehicle);
    const color =
      (routeId ? feed?.routes.get(routeId)?.color : undefined) ??
      VEHICLE_UNMATCHED_COLOR;
    vehicles.push({
      payload: { type: 'vehicle', vehicle_id: vehicle.key },
      icon: dotMarker(color),
      primary: vehicleDisplayName(feed, vehicle),
      secondary: vehicle.vehicleId || vehicle.key,
      haystack: searchHaystack(
        vehicleDisplayName(feed, vehicle),
        vehicle.vehicleId,
        vehicle.label,
        vehicle.tripId,
        routeId
      ),
    });
  }

  return [stops, routes, { label: t('search.vehicles'), entries: vehicles }];
}
