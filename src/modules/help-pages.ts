/**
 * The help page registry: what pages exist, their grouping, and their copy.
 *
 * Rendering lives in `help-modal.ts`. This module is data only, following
 * gtfs-zone-homepage's `src/content/copy.ts` convention of keeping copy separate
 * from the code that draws it.
 */

import { eyebrow, lede, glyphList } from 'gtfs-zone-web-common/ui/help-modal';
import { type AboutApp } from 'gtfs-zone-web-common/ui/about-links';
import {
  aboutPage,
  shortcutsPage,
  ICON_CHECK,
  ICON_LEG,
  ICON_LOAD,
  ICON_MAP,
  type HelpPage,
} from 'gtfs-zone-web-common/ui/help-pages';
import {
  mapKeyCircle,
  mapKeyLine,
  mapKeyRow,
  renderMapKey,
} from 'gtfs-zone-web-common/gtfs/map-key';

const welcomePage: HelpPage = {
  id: 'welcome',
  label: 'Welcome',
  group: 'Getting Started',
  title: 'Welcome to viz.rt.gtfs.zone',
  showOnce: true,
  render: () =>
    [
      eyebrow('GTFS.zone'),
      lede(
        'viz.rt.gtfs.zone shows a GTFS Realtime feed on a live map. Every feed is fetched and decoded in your browser. Nothing you load is uploaded anywhere.'
      ),
      glyphList([
        {
          icon: ICON_LOAD,
          term: 'Load a feed',
          description:
            'Point it at a scheduled GTFS feed plus its realtime feeds.',
        },
        {
          icon: ICON_MAP,
          term: 'Watch vehicles move',
          description: 'Positions update every few seconds on the map.',
        },
        {
          icon: ICON_LEG,
          term: 'Check predictions',
          description: 'Arrival predictions and how late each trip is running.',
        },
        {
          icon: ICON_CHECK,
          term: 'Spot disruptions',
          description: 'Active service alerts show up alongside the routes.',
        },
      ]),
    ].join(''),
};

// ─── Reference: About, merged in from the old standalone About modal ──────

const ABOUT_APP: AboutApp = {
  name: 'viz.rt.gtfs.zone',
  blurb: [
    'viz.rt.gtfs.zone shows a GTFS Realtime feed on a live map.',
    'GTFS Realtime is what an agency publishes alongside its schedule to say where its vehicles are right now, how late each trip is running, and what is disrupted. Point this at a scheduled GTFS feed plus its realtime feeds and the map draws the rest:',
  ],
  highlights: [
    'Routes and stops from the schedule',
    'Vehicles moving along them, updated every few seconds',
    'Arrival predictions at any stop',
    'Active service alerts',
  ],
  blurbFooter:
    'Every feed is fetched and decoded in your browser. Nothing you load is uploaded anywhere.',
  contactSubject: 'viz.rt.gtfs.zone feedback',
  repo: 'gtfs-zone-rt-viewer',
  sibling: {
    name: 'edit.gtfs.zone',
    href: 'https://edit.gtfs.zone',
    note: 'build and edit a GTFS schedule feed in the browser',
  },
};

// ─── Reference: Map Key ────────────────────────────────────────────────────

function triangle(color: string): string {
  return `<svg width="14" height="14" viewBox="0 0 14 14" style="flex-shrink:0"><polygon points="7,1 12,12 2,12" fill="${color}" stroke="#0f172a" stroke-width="1"/></svg>`;
}

/** The direction chevrons drawn along the selected route. */
function chevronLine(color: string): string {
  const chevron = (x: number) =>
    `<polyline points="${x},4 ${x + 3},7 ${x},10" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg width="20" height="14" viewBox="0 0 20 14" style="flex-shrink:0"><line x1="2" y1="7" x2="18" y2="7" stroke="${color}" stroke-width="4" stroke-linecap="round"/>${chevron(5)}${chevron(11)}</svg>`;
}

const mapKeyPage: HelpPage = {
  id: 'map-key',
  label: 'Map Key',
  group: 'Reference',
  title: 'Map Key',
  render: () =>
    renderMapKey({
      unlocatedLabel: "Inherits its station's location",
      title: 'Routes &amp; Vehicles',
      rows: [
        mapKeyRow(
          mapKeyLine('#3b82f6'),
          "Route (the feed's color, or an assigned one)"
        ),
        mapKeyRow(
          chevronLine('#3b82f6'),
          'Direction of travel, on the selected route'
        ),
        mapKeyRow(mapKeyCircle('#3b82f6', '#0f172a'), 'Vehicle'),
        mapKeyRow(triangle('#3b82f6'), 'Vehicle, with a known heading'),
        mapKeyRow(
          mapKeyCircle('#94a3b8', '#0f172a'),
          "Vehicle, route couldn't be matched"
        ),
      ].join(''),
    }),
};

export const HELP_PAGES: HelpPage[] = [
  welcomePage,
  aboutPage(ABOUT_APP),
  mapKeyPage,
  shortcutsPage,
];
