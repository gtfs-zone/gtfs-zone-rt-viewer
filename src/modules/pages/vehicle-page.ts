/**
 * The vehicle page: where it is, what it says about itself, and what its trip
 * is predicted to do.
 */

import type { VehiclePosition } from 'gtfs-zone-web-common/gtfs/rt-types';
import type { GTFSScheduled } from 'gtfs-zone-web-common/gtfs/scheduled';
import type { PageState } from '../../types/page-state';
import { alertsForTrip } from 'gtfs-zone-web-common/gtfs/alerts';
import type { RtIndex } from 'gtfs-zone-web-common/gtfs/rt-index';
import type { RenderContext } from '../render-context';
import {
  TRIP_SCHEDULE_RELATIONSHIP_LABELS,
  VEHICLE_STATUS_LABELS,
  entityLink,
  escHtml,
  pageHeader,
  prop,
  propList,
  renderRawJson,
  routeBadge,
  section,
  stopSequenceMark,
  tripRelationshipMark,
  vehicleDisplayName,
} from 'gtfs-zone-web-common/gtfs/entity-render';
import { localClock } from 'gtfs-zone-web-common/gtfs/feed-time';
import { renderPredictionTable } from 'gtfs-zone-web-common/gtfs/prediction-table';
import { vehicleProps } from 'gtfs-zone-web-common/gtfs/vehicle-props';
import { renderAlertList } from 'gtfs-zone-web-common/gtfs/alert-page';
import { t } from '../../i18n/messages';

/**
 * Last-known state for every vehicle the page has rendered.
 *
 * A vehicle disappearing from the feed is a fact worth reporting, not a reason
 * to blank the page — the last poll that contained it is often the most
 * interesting thing about it.
 */
const lastSeen = new Map<string, { vehicle: VehiclePosition; at: number }>();

/** Relationship values under which a trip legitimately has no static-schedule entry. */
const ADDED_LIKE_RELATIONSHIPS = new Set([1, 2, 5, 6, 8]);

/**
 * The `current_stop_sequence` row of the raw property region: exactly what the
 * feed sent, and — when it sent nothing — where the value in use came from
 * instead. The "not reported" half never goes away; this region reports the
 * wire.
 */
function renderStopSequenceValue(
  rt: RtIndex,
  vehicle: VehiclePosition
): string {
  if (vehicle.currentStopSequence !== undefined) {
    return `<span class="tabular-nums">${vehicle.currentStopSequence}</span>`;
  }

  const absent = `<span class="opacity-40">${t('vehicle.notReported')}</span>`;
  const current = rt.stopSequenceFor(vehicle);
  if (!current) {
    return absent;
  }

  const note =
    current.source === 'stop_id'
      ? t('vehicle.seqFromStopId', {
          stop: escHtml(vehicle.stopId ?? ''),
          sequence: `<span class="tabular-nums">${current.sequence}</span>`,
        })
      : t('vehicle.seqDerived', {
          sequence: `<span class="tabular-nums">${current.sequence}</span>`,
        });
  return `${absent} <span class="opacity-60">— ${note}</span>`;
}

/**
 * The Route row when the trip is not in the static schedule. When the feed
 * explained why (ADDED / UNSCHEDULED / REPLACEMENT / DUPLICATED), say so and
 * still surface `vehicle.routeId` rather than dimming the row into a gap.
 */
function renderAddedTripRoute(
  ctx: RenderContext,
  feed: GTFSScheduled | null | undefined,
  vehicle: VehiclePosition
): string {
  const rel = vehicle.scheduleRelationship;
  if (rel === undefined || !ADDED_LIKE_RELATIONSHIPS.has(rel)) {
    return prop(
      t('vehicle.route'),
      `<span class="opacity-50">${t('vehicle.notInSchedule')}</span>`
    );
  }
  const route = vehicle.routeId ? feed?.routes.get(vehicle.routeId) : undefined;
  const routeHtml = !vehicle.routeId
    ? `<span class="opacity-50">${t('vehicle.noRouteId')}</span>`
    : route
      ? entityLink(
          ctx,
          { type: 'route', route_id: route.id },
          route.short_name || route.long_name || route.id
        )
      : `<span class="font-mono">${escHtml(vehicle.routeId)}</span>`;
  return prop(t('vehicle.route'), `${routeHtml} ${tripRelationshipMark(rel)}`);
}

function renderTripSection(
  ctx: RenderContext,
  rt: RtIndex,
  vehicle: VehiclePosition
): string {
  const feed = ctx.session.scheduledFeed;
  const trip = vehicle.tripId ? feed?.trips.get(vehicle.tripId) : undefined;
  if (!vehicle.tripId) {
    return section(
      t('vehicle.trip'),
      `<p class="text-xs opacity-60">${t('vehicle.noTripId')}</p>`
    );
  }

  // The panel re-renders on the feed's `dataloaded` once the stops arrive.
  if (trip && feed && !feed.tripTimesLoaded(trip.trip_id)) {
    feed.loadTripTimes(trip.trip_id).catch((err) => {
      console.error(`[VehiclePage] loading trip ${trip.trip_id} failed`, err);
    });
    return section(
      t('vehicle.trip'),
      `<div class="flex items-center gap-2 text-xs opacity-70">
        <span class="loading loading-spinner loading-xs"></span>
        ${t('vehicle.loadingStops')}
      </div>`
    );
  }

  const times = trip ? (feed?.stopTimesByTrip.get(trip.trip_id) ?? []) : [];
  const current = rt.stopSequenceFor(vehicle);
  const currentIndex = current
    ? times.findIndex((t) => t.stop_sequence === current.sequence)
    : -1;
  const currentStop =
    currentIndex >= 0
      ? feed?.stops.get(times[currentIndex].stop_id)
      : undefined;
  const statusWord =
    vehicle.currentStatus === undefined
      ? t('vehicle.at')
      : (VEHICLE_STATUS_LABELS[vehicle.currentStatus] ?? t('vehicle.at'));
  // The whole section hangs off the stop, so the mark rides with the value.
  const mark = current ? ` ${stopSequenceMark(vehicle, current)}` : '';

  const routeProp = trip
    ? prop(
        t('vehicle.route'),
        entityLink(
          ctx,
          { type: 'route', route_id: trip.route_id },
          feed?.routes.get(trip.route_id)?.short_name || trip.route_id
        )
      )
    : renderAddedTripRoute(ctx, feed, vehicle);

  return section(
    t('vehicle.trip'),
    propList([
      prop(
        'trip_id',
        `<span class="font-mono">${escHtml(vehicle.tripId)}</span>`
      ),
      routeProp,
      vehicle.scheduled
        ? ''
        : prop(
            'schedule_relationship',
            vehicle.scheduleRelationship === undefined
              ? `<span class="opacity-40">${t('vehicle.notReported')}</span>`
              : escHtml(
                  TRIP_SCHEDULE_RELATIONSHIP_LABELS[
                    vehicle.scheduleRelationship
                  ] ?? String(vehicle.scheduleRelationship)
                )
          ),
      trip?.headsign ? prop(t('vehicle.headsign'), escHtml(trip.headsign)) : '',
      currentStop
        ? prop(
            t('vehicle.currently', { status: escHtml(statusWord) }),
            `${entityLink(ctx, { type: 'stop', stop_id: currentStop.id }, currentStop.name || currentStop.id)}${mark}`
          )
        : '',
      currentIndex >= 0
        ? prop(
            t('vehicle.progress'),
            `<span class="tabular-nums">${t('vehicle.progressValue', { n: currentIndex + 1, total: times.length })}</span>${mark}`
          )
        : '',
      vehicle.startDate || vehicle.startTime
        ? prop(
            t('vehicle.tripStart'),
            escHtml(
              `${vehicle.startDate ?? ''} ${vehicle.startTime ?? ''}`.trim()
            )
          )
        : '',
    ])
  );
}

/** Every stop-time prediction for this vehicle's trip, in sequence order. */
function renderPredictions(
  ctx: RenderContext,
  rt: RtIndex,
  vehicle: VehiclePosition
): string {
  if (!vehicle.tripId || vehicle.scheduled) {
    return '';
  }
  const predictions = rt.predictionsByTrip.get(vehicle.tripId);
  if (!predictions?.length) {
    return section(
      t('vehicle.predictions'),
      `<p class="text-xs opacity-60">${t('vehicle.noPredictions')}</p>`
    );
  }
  const feed = ctx.session.scheduledFeed;
  const current = rt.stopSequenceFor(vehicle);

  return section(
    t('vehicle.predictions'),
    renderPredictionTable(
      predictions.map((p) => {
        const stop = feed?.stops.get(p.stop_id);
        return {
          sequence: p.stop_sequence,
          stopHtml: stop
            ? entityLink(
                ctx,
                { type: 'stop', stop_id: stop.id },
                stop.name || stop.id
              )
            : escHtml(p.stop_id),
          prediction: p,
          current:
            current !== undefined && p.stop_sequence === current.sequence,
        };
      })
    )
  );
}

/** A simulated vehicle has no wire fields to report: where it is and what it is doing. */
function renderScheduledProps(vehicle: VehiclePosition): string {
  return propList([
    ...vehicleProps(vehicle),
    vehicle.currentStopSequence === undefined
      ? ''
      : prop(
          'stop_sequence',
          `<span class="tabular-nums">${vehicle.currentStopSequence}</span>`
        ),
  ]);
}

export function renderVehiclePage(
  ctx: RenderContext,
  rt: RtIndex,
  state: Extract<PageState, { type: 'vehicle' }>
): string {
  const live = ctx.session.vehicles.get(state.vehicle_key);
  if (live) {
    lastSeen.set(state.vehicle_key, { vehicle: live, at: Date.now() });
  }

  const remembered = lastSeen.get(state.vehicle_key);
  if (!live && !remembered) {
    return `<p class="text-sm opacity-60">${t('vehicle.missing', { id: escHtml(state.vehicle_key) })}</p>`;
  }

  const vehicle = live ?? remembered!.vehicle;
  const feed = ctx.session.scheduledFeed;
  const trip = vehicle.tripId ? feed?.trips.get(vehicle.tripId) : undefined;
  const route = feed?.routes.get(trip?.route_id ?? vehicle.routeId ?? '');

  // Every vehicle sharing this feed's `vehicle.id`. More than one is a GTFS-RT
  // spec violation — VehicleDescriptor.id "should be unique per vehicle" — that
  // gtfs-zone-rt-viewer reports rather than hides (Plan 06 Root cause D).
  const sharing = vehicle.vehicleId
    ? [...ctx.session.vehicles.values()].filter(
        (v) => v.vehicleId === vehicle.vehicleId
      )
    : [vehicle];
  const sharedIdBanner =
    sharing.length > 1
      ? `<div class="rounded-lg border border-warning/50 bg-warning/10 p-3 text-xs space-y-1">
           <p>${t('vehicle.sharedId', {
             field: '<span class="font-mono">vehicle.id</span>',
             id: `<span class="font-mono">${escHtml(vehicle.vehicleId)}</span>`,
             count: sharing.length,
             descriptor: '<span class="font-mono">VehicleDescriptor.id</span>',
           })}</p>
           ${
             vehicle.tripId
               ? `<p>${
                   vehicle.startDate
                     ? t('vehicle.sharedIdTripDate', {
                         trip: `<span class="font-mono">${escHtml(vehicle.tripId)}</span>`,
                         date: `<span class="font-mono">${escHtml(vehicle.startDate)}</span>`,
                       })
                     : t('vehicle.sharedIdTrip', {
                         trip: `<span class="font-mono">${escHtml(vehicle.tripId)}</span>`,
                       })
                 }</p>`
               : ''
           }
         </div>`
      : '';

  const goneBanner = live
    ? ''
    : `<div class="rounded-lg border border-warning/50 bg-warning/10 p-3 text-xs">
         ${t(vehicle.scheduled ? 'vehicle.scheduledGone' : 'vehicle.gone', { time: escHtml(localClock(remembered!.at)) })}
       </div>`;
  const scheduledBanner = vehicle.scheduled
    ? `<div class="rounded-lg border border-info/50 bg-info/10 p-3 text-xs">
         ${t('vehicle.scheduledBanner')}
       </div>`
    : '';

  return `
    <div class="space-y-4">
      ${goneBanner}
      ${scheduledBanner}
      ${sharedIdBanner}
      ${pageHeader(
        vehicleDisplayName(feed, vehicle),
        // The feed's own name for it, falling back to the entity that carried
        // it — the Identity props below keep the two apart.
        vehicle.scheduled
          ? (vehicle.tripId ?? '')
          : vehicle.vehicleId || vehicle.entityId,
        `${route ? routeBadge(ctx, route) : ''} ${tripRelationshipMark(vehicle.scheduleRelationship)}`.trim()
      )}

      ${section(
        t(vehicle.scheduled ? 'vehicle.scheduled' : 'vehicle.live'),
        vehicle.scheduled
          ? renderScheduledProps(vehicle)
          : propList([
              ...vehicleProps(vehicle, { showMissing: true }),
              // This region reports the wire, so an omitted field still reads as
              // omitted; the derived value is stated next to it, not in place of it.
              prop(
                'current_stop_sequence',
                renderStopSequenceValue(rt, vehicle)
              ),
              prop(
                'vehicle.id',
                vehicle.vehicleId
                  ? `<span class="font-mono">${escHtml(vehicle.vehicleId)}</span>`
                  : `<span class="opacity-40">${t('vehicle.emptyId')}</span>`
              ),
              prop(
                t('vehicle.entityId'),
                `<span class="font-mono">${escHtml(vehicle.entityId)}</span>`
              ),
            ])
      )}

      ${renderTripSection(ctx, rt, vehicle)}
      ${renderPredictions(ctx, rt, vehicle)}
      ${renderAlertList(
        ctx,
        vehicle.tripId
          ? alertsForTrip(
              ctx.session,
              vehicle.tripId,
              trip?.route_id ?? vehicle.routeId
            )
          : [],
        t('vehicle.alerts')
      )}

      ${renderRawJson(t(vehicle.scheduled ? 'vehicle.rawScheduled' : 'vehicle.raw'), vehicle.raw)}
    </div>`;
}
