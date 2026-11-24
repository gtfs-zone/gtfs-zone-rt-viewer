import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { CONFIG } from './config';
import type { PageState } from './types/page-state';
import type { MapFocusTarget } from 'gtfs-zone-web-common/map/layer-manager';
import { RtMapController } from 'gtfs-zone-web-common/map/rt-map-controller';
import type { VehiclePosition } from 'gtfs-zone-web-common/gtfs/rt-types';
import {
  tripMatches,
  type TripLocation,
} from 'gtfs-zone-web-common/gtfs/tree-location';

export class MapController extends RtMapController<PageState> {
  constructor() {
    super(
      {
        viewKey: CONFIG.MAP_VIEW_KEY,
        appearanceKey: CONFIG.MAP_APPEARANCE_KEY,
        workerUrl: maplibreWorkerUrl,
      },
      { type: 'home' }
    );
  }

  protected targetState(target: MapFocusTarget): PageState {
    switch (target.kind) {
      case 'stop':
        return { type: 'stop', stop_id: target.id };
      case 'route':
        return { type: 'route', route_id: target.id };
      case 'vehicle':
        return { type: 'vehicle', vehicle_key: target.id };
    }
  }

  /** The trip's vehicle when one is running it, else its route. */
  private focusTrip(loc: TripLocation): void {
    const resolve = (positions: VehiclePosition[]) =>
      positions.find((v) => tripMatches(loc, v));
    if (resolve(this.positions)) {
      this.focusVehicle(resolve);
    } else if (loc.route_id) {
      this.focusRoute(loc.route_id);
    } else {
      this.focusNone();
    }
  }

  protected applyFocus(state: PageState): void {
    switch (state.type) {
      case 'home':
        this.focusHome();
        return;
      // These pages have no geometry of their own; nothing to highlight or fly to.
      case 'alert':
      case 'schedule':
      case 'feed_info':
      case 'agency':
      case 'vehicle_positions':
      case 'trip_updates':
      case 'service_alerts':
        this.focusNone();
        return;
      case 'route':
        this.focusRoute(state.route_id);
        return;
      case 'stop':
        this.focusStop(state.stop_id);
        return;
      case 'trip':
        this.focusTrip(state);
        return;
      case 'vehicle':
        this.focusVehicle(
          (positions) => positions.find((p) => p.key === state.vehicle_key),
          state.vehicle_key
        );
        return;
    }
  }
}
