/**
 * Turns the loaded session into search entries for `SearchController`.
 *
 * The payload is a `PageState`, so a selected result goes through `setFocus`
 * like any other navigation and the panel, map and hash all follow.
 *
 * Vehicles come from the session's live map, so they are as fresh as the last
 * poll — entries are rebuilt per query, which is what makes that free.
 */

import { VEHICLE_UNMATCHED_COLOR } from 'gtfs-zone-web-common/map/layer-manager';
import type { PageState } from '../types/page-state';
import type { FeedSession } from './feed-session';
import {
  vehicleDisplayName,
  vehicleRouteId,
} from 'gtfs-zone-web-common/gtfs/entity-render';
import {
  scheduleSearchEntries,
  searchHaystack,
} from 'gtfs-zone-web-common/gtfs/search-entries';
import {
  dotMarker,
  type SearchEntry,
} from 'gtfs-zone-web-common/ui/search-controller';

export function buildSearchEntries(
  session: FeedSession
): SearchEntry<PageState>[] {
  const feed = session.scheduledFeed;
  // Stations outrank routes, which outrank plain stops/vehicles.
  const entries: SearchEntry<PageState>[] = scheduleSearchEntries(feed, {
    station: 0,
    route: 1,
    stop: 2,
  });

  for (const vehicle of session.vehicles.values()) {
    // Same color the map paints it: the vehicle's route, or the unmatched grey.
    const routeId = vehicleRouteId(feed, vehicle);
    const color =
      (routeId ? feed?.routes.get(routeId)?.color : undefined) ??
      VEHICLE_UNMATCHED_COLOR;
    entries.push({
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
      priority: 2,
    });
  }

  return entries;
}
