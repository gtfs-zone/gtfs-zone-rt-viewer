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
  OCCUPANCY_LABELS,
  TRIP_SCHEDULE_RELATIONSHIP_LABELS,
  VEHICLE_STATUS_LABELS,
  entityLink,
  escHtml,
  pageHeader,
  predictionCells,
  predictionHeaders,
  prop,
  propList,
  renderRawJson,
  routeBadge,
  section,
  stopSequenceMark,
  timestampWithAge,
  tripRelationshipMark,
  vehicleDisplayName,
} from 'gtfs-zone-web-common/gtfs/entity-render';
import { localClock } from 'gtfs-zone-web-common/gtfs/feed-time';
import { formatNumber } from 'gtfs-zone-web-common/i18n/fmt';
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
const ADDED_LIKE_RELATIONSHIPS = new Set([1, 2, 4, 5]);

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
      prop(
        'schedule_relationship',
        vehicle.scheduleRelationship === undefined
          ? `<span class="opacity-40">${t('vehicle.notReported')}</span>`
          : escHtml(
              TRIP_SCHEDULE_RELATIONSHIP_LABELS[vehicle.scheduleRelationship] ??
                String(vehicle.scheduleRelationship)
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
  if (!vehicle.tripId) {
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
    `<table class="table table-xs table-fixed">
      <colgroup>
        <col style="width: 9%" />
        <col style="width: 37%" />
        <col style="width: 18%" />
        <col style="width: 18%" />
        <col style="width: 18%" />
      </colgroup>
      <thead><tr>
        <th class="text-right">${t('vehicle.seq')}</th><th>${t('vehicle.stop')}</th>
        ${predictionHeaders()}
      </tr></thead>
      <tbody>${predictions
        .map((p) => {
          const stop = feed?.stops.get(p.stop_id);
          const isCurrent =
            current !== undefined && p.stop_sequence === current.sequence;
          const skipped = p.scheduleRelationship === 1;
          return `<tr class="${isCurrent ? 'bg-base-200' : ''}">
            <td class="text-right tabular-nums opacity-60 align-top">${escHtml(String(p.stop_sequence ?? '—'))}</td>
            <td class="max-w-0 truncate align-top${skipped ? ' opacity-50 line-through' : ''}">${
              stop
                ? entityLink(
                    ctx,
                    { type: 'stop', stop_id: stop.id },
                    stop.name || stop.id
                  )
                : escHtml(p.stop_id)
            }</td>
            ${predictionCells(p)}
          </tr>`;
        })
        .join('')}</tbody>
    </table>`
  );
}

export function renderVehiclePage(
  ctx: RenderContext,
  rt: RtIndex,
  state: Extract<PageState, { type: 'vehicle' }>
): string {
  const live = ctx.session.vehicles.get(state.vehicle_id);
  if (live) {
    lastSeen.set(state.vehicle_id, { vehicle: live, at: Date.now() });
  }

  const remembered = lastSeen.get(state.vehicle_id);
  if (!live && !remembered) {
    return `<p class="text-sm opacity-60">${t('vehicle.missing', { id: escHtml(state.vehicle_id) })}</p>`;
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
         ${t('vehicle.gone', { time: escHtml(localClock(remembered!.at)) })}
       </div>`;

  return `
    <div class="space-y-4">
      ${goneBanner}
      ${sharedIdBanner}
      ${pageHeader(
        vehicleDisplayName(feed, vehicle),
        // The feed's own name for it, falling back to the entity that carried
        // it — the Identity props below keep the two apart.
        vehicle.vehicleId || vehicle.entityId,
        `${route ? routeBadge(ctx, route) : ''} ${tripRelationshipMark(vehicle.scheduleRelationship)}`.trim()
      )}

      ${section(
        t('vehicle.live'),
        propList([
          prop(
            t('vehicle.position'),
            escHtml(`${vehicle.lat.toFixed(5)}, ${vehicle.lon.toFixed(5)}`)
          ),
          prop(
            t('vehicle.bearing'),
            vehicle.bearing === undefined
              ? `<span class="opacity-40">${t('vehicle.notReported')}</span>`
              : `${escHtml(vehicle.bearing.toFixed(0))}°`
          ),
          prop(
            t('vehicle.speed'),
            vehicle.speed === undefined
              ? `<span class="opacity-40">${t('vehicle.notReported')}</span>`
              : t('vehicle.speedValue', {
                  speed: formatNumber(vehicle.speed, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  }),
                })
          ),
          prop(
            t('vehicle.status'),
            vehicle.currentStatus === undefined
              ? `<span class="opacity-40">${t('vehicle.notReported')}</span>`
              : escHtml(
                  VEHICLE_STATUS_LABELS[vehicle.currentStatus] ??
                    String(vehicle.currentStatus)
                )
          ),
          // This region reports the wire, so an omitted field still reads as
          // omitted; the derived value is stated next to it, not in place of it.
          prop('current_stop_sequence', renderStopSequenceValue(rt, vehicle)),
          prop(
            t('vehicle.occupancy'),
            vehicle.occupancyStatus === undefined
              ? `<span class="opacity-40">${t('vehicle.notReported')}</span>`
              : escHtml(
                  OCCUPANCY_LABELS[vehicle.occupancyStatus] ??
                    String(vehicle.occupancyStatus)
                )
          ),
          prop(t('vehicle.timestamp'), timestampWithAge(vehicle.timestamp)),
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

      ${renderRawJson(t('vehicle.raw'), vehicle.raw)}
    </div>`;
}
