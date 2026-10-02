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
import { t } from '../i18n/messages';

const welcomePage: HelpPage = {
  id: 'welcome',
  label: t('help.welcome.label'),
  group: 'Getting Started',
  title: t('help.welcome.title'),
  showOnce: true,
  render: () =>
    [
      eyebrow('GTFS.zone'),
      lede(t('help.welcome.lede')),
      glyphList([
        {
          icon: ICON_LOAD,
          term: t('help.welcome.load'),
          description: t('help.welcome.loadText'),
        },
        {
          icon: ICON_MAP,
          term: t('help.welcome.watch'),
          description: t('help.welcome.watchText'),
        },
        {
          icon: ICON_LEG,
          term: t('help.welcome.predict'),
          description: t('help.welcome.predictText'),
        },
        {
          icon: ICON_CHECK,
          term: t('help.welcome.disrupt'),
          description: t('help.welcome.disruptText'),
        },
      ]),
    ].join(''),
};

// ─── Reference: About, merged in from the old standalone About modal ──────

const ABOUT_APP: AboutApp = {
  name: 'viz.rt.gtfs.zone',
  blurb: [t('help.about.blurb'), t('help.about.blurb2')],
  highlights: [
    t('help.about.routes'),
    t('help.about.vehicles'),
    t('help.about.predictions'),
    t('help.about.alerts'),
  ],
  blurbFooter: t('help.about.footer'),
  contactSubject: t('help.about.subject'),
  repo: 'gtfs-zone-rt-viewer',
  sibling: {
    name: 'edit.gtfs.zone',
    href: 'https://edit.gtfs.zone',
    note: t('help.about.sibling'),
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
  label: t('help.mapKey.label'),
  group: 'Reference',
  title: t('help.mapKey.title'),
  render: () =>
    renderMapKey({
      unlocatedLabel: t('help.mapKey.unlocated'),
      title: t('help.mapKey.routes'),
      rows: [
        mapKeyRow(mapKeyLine('#3b82f6'), t('help.mapKey.route')),
        mapKeyRow(chevronLine('#3b82f6'), t('help.mapKey.direction')),
        mapKeyRow(mapKeyCircle('#3b82f6', '#0f172a'), t('help.mapKey.vehicle')),
        mapKeyRow(triangle('#3b82f6'), t('help.mapKey.heading')),
        mapKeyRow(
          mapKeyCircle('#94a3b8', '#0f172a'),
          t('help.mapKey.unmatched')
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
