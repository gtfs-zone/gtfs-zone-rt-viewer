import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { CONFIG } from './config';
import type { PageState } from './types/page-state';
import type { MapFocusTarget } from 'gtfs-zone-web-common/map/layer-manager';
import { RtMapController } from 'gtfs-zone-web-common/map/rt-map-controller';

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

  protected applyFocus(state: PageState): void {
    switch (state.type) {
      case 'home':
        this.focusHome();
        return;
      // Alerts have no geometry of their own; nothing to highlight or fly to.
      // The other pages here do not validate until they have a page.
      case 'alert':
      case 'schedule':
      case 'feed_info':
      case 'agency':
      case 'trip':
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
      case 'vehicle':
        this.focusVehicle(
          (positions) => positions.find((p) => p.key === state.vehicle_key),
          state.vehicle_key
        );
        return;
    }
  }
}
