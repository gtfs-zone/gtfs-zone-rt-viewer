/**
 * Application-wide configuration constants.
 * All magic numbers live here — import CONFIG rather than inlining literals.
 */
export const CONFIG = {
  // localStorage keys for map view + appearance (Plan 03 decided these are
  // deliberately *not* in the URL: they are per-device preferences, not part
  // of what a shared link describes).
  MAP_VIEW_KEY: 'tt.map.view',
  MAP_APPEARANCE_KEY: 'tt.map.appearance',

  // Realtime poll interval — a per-device preference like the map view above,
  // deliberately not in the shared URL.
  RT_INTERVAL_KEY: 'tt.rt.interval',
  RT_INTERVAL_DEFAULT_MS: 15000,
  RT_INTERVAL_OPTIONS_MS: [5000, 10000, 15000, 30000, 60000],

  // Prod URL of the schedule editor (gtfs-zone-editor). Hardcoded to prod on
  // purpose: dev editor URLs change often, so a shared/edit link should always
  // point at the stable public editor. It loads a scheduled GTFS via `#load=<url>`.
  EDITOR_BASE: 'https://edit.gtfs.zone',

  // Where a path-only realtime URL resolves to. Dev is
  // gtfs-zone-dev-stack's gtfs-zone-rt-api (`docker-compose.yml`, service `api`); prod is the
  // deployed feed server. Fetching it directly rather than through
  // a vite proxy means gtfs-zone-rt-api's `CORS_ALLOWED_ORIGINS` has to name the dev
  // server's origin — it allows localhost:8080-8089, which covers vite's whole
  // drift range. cors.kcfam.us is a separate whitelist with its own list
  // (home-docker `local.cors_proxy_dev_origins`), covering localhost:8080-8091.
  // Lives here rather than in `gtfs-zone-web-common`'s `feed-url-resolve.ts`
  // because gtfs-zone-editor has no local feed server and wants prod always.
  RT_BASE: import.meta.env.DEV
    ? 'http://localhost:8000'
    : 'https://rt.gtfs.zone',
} as const;
