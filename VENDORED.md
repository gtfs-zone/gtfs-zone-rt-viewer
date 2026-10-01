# Vendored files

## The shared half is mostly a dependency now

The files that have moved out of the apps live in **`gtfs-zone-web-common`**, a
git dependency shipping raw TypeScript with no build step. They are imported as
`gtfs-zone-web-common/ui/...`, `gtfs-zone-web-common/gtfs/...`, `gtfs-zone-web-common/map/...` and
`gtfs-zone-web-common/util/...`, resolved by `tsconfig.json` `paths` and a
`resolve.alias` in `vite.config.js`, both pointing at
`node_modules/gtfs-zone-web-common/src`.

They are **not in the table below and not checked by `vendor:check`**: a package
version is the contract. A shared change there is a commit in gtfs-zone-web-common, a
tag, and a bump in each of the three consumers. It is not edited here.

## What is still vendored

Everything below is still a hand-copied file. Each is marked with a banner as the
very first lines of the file:

```ts
/* @vendored-from gtfs-zone-editor:src/modules/load-modal.ts
   @sha 67c1168
   @status verbatim */
```

Every row names its own `Source repo` and resolves against that sibling checkout
next to this one. That is `gtfs-zone-editor` for every vendored row but
`scripts/vendor-check.ts`, which came from `gtfs-zone-rt-manager`.

`@status` is one of:
- `verbatim`: byte-identical apart from the banner. Re-sync = overwrite + re-add
  banner.
- `modified`: adapted. Must be followed by an `@changes` line listing what
  diverged, one bullet per change, so a re-sync knows what to re-apply.
- `adopted`: this repo's file now. The banner records where it came from and
  nothing is checked, neither drift nor staleness. A file moves here when feature
  work has taken it over far enough that re-syncing has stopped being meaningful.
- `origin`: not vendored at all, but the canonical copy another repo vendors
  *from*. Carries no banner, no source repo and no SHA; listed so the table is
  the whole map of what is shared.

`adopted` exists so `verbatim` stays a contract that is actually enforced. A file
the features own will drift by design: promote it to `adopted` rather than
contorting the app to keep a row green.

**Flow is one-way: gtfs-zone-editor -> gtfs-zone-rt-viewer -> gtfs-zone-rt-manager**, for what is
left. Anything still vendored that this repo wrote goes upstream first and is
vendored back down. The rule no longer covers the shared half that moved to
`gtfs-zone-web-common`, which is edited there and reaches all three repos as a version
bump; gtfs-zone-editor is not its upstream any more. The other exception is
`origin`, which is a file gtfs-zone-rt-manager vendors straight from here because
gtfs-zone-editor has no counterpart to put it in.

**Why the realtime half is `origin` rather than vendored.** gtfs-zone-editor is an
editor: it reads no `.pb`, has no poller, and owns no vehicle, trip update or
service alert. A realtime module hosted there would have no caller, and its
`knip` gate would delete it on the next cleanup. The one-way rule is about where
a file is edited, not an obligation on one repo to host every shared file, so
the realtime set stayed canonical here. Most of it has since moved on to
`gtfs-zone-web-common` — `rt-types`, `feed-session`, `rt-index`, `alerts` and
`entity-render`, the last of which is this repo's old `render-utils.ts` — and
what is left under `origin` is the half that is this app's own: the decoder and
poller, the session that drives them, and the four page renderers and panel
dispatcher, which render GTFS-RT beside the schedule on a screen gtfs-zone-editor
does not have.

**What is deliberately absent.** `src/index.ts` (this app's boot order),
`src/config.ts` and `src/env.d.ts` (build and deployment constants),
`src/modules/feed-url.ts` (the `?scheduled=`/`?realtime=` query contract, which
only this app has), `src/modules/last-feed.ts` (a localStorage note of the last
feed loaded here), `src/shell.ts` (this app's options to the shared shell
markup: its brand, the refresh-rate dropdown and its three dock buttons), `src/modules/status-page.ts` (the boot and feed-health
screen, written against this app's session) and the two descriptor lists the
shared renderers are parameterized over, `src/modules/navbar-action-list.ts` and
`src/modules/shortcut-list.ts`, are the app itself. No sibling
vendors them and none should; they are named here so the table is a complete
map of `src/` rather than only its shared half.

This table is the single place to look when diffing against a newer source repo.
Run `pnpm vendor:check` to diff every `verbatim` entry below against its recorded
SHA (rows whose sibling repo isn't checked out are skipped).

| Local path | Source repo | Source path | SHA | Status | Note |
|---|---|---|---|---|---|
| `src/modules/layer-manager.ts` | `gtfs-zone-editor` | `src/modules/layer-manager.ts` | a8e7afd | adopted | Promoted from `modified` in Phase 8, once the shared half of the file became `layer-specs.ts` and `stop-layer-style.ts`, now both in `gtfs-zone-web-common`. What is left is this app's own half: the three sources (`routes`, `stops`, `vehicles`), what fills them from `GTFSScheduled` and the poller, the feature-state sync with its `sourcedata` retry, the realtime vehicle layer stack, and the single map-level hit test. Upstream's remaining manager is the editor's, on `GTFSParser` / IndexedDB with pathways, levels, flex zones, transfers and the editing affordances, so re-syncing against it has stopped being meaningful and the two spec files carry the contract instead, as package modules. The banner lists what was taken (`aff09db`, `7e77889`, `dc1d421`'s stop half, `767ac02`, `cef96c7`) and what was not, with reasons |
| `src/types/page-state.ts` | `gtfs-zone-editor` | `src/types/page-state.ts` | 9e5ff9c | modified | The page-state union, `MODAL_TYPES` and the two type guards. Five variants only; `vehicle`/`alert` added, `direction_id` on route. `1c16f14`'s modal dimension is taken as of Phase 12, with this repo's own `MODAL_TYPES` (`alerts`, `help`) in place of upstream's editor modals, and no `TimetableModalState`/`PaneModalState` split because neither modal needs more than one optional selector. `modal_page` names the guide page the modal opens on, not the one showing: `gtfs-zone-web-common`'s `sidebar-modal.ts` has no pane-change hook. What is generic over the union (`NavigationEvent`, `StateValidator`, `pageStatesEqual`, `sameLocation`) is `gtfs-zone-web-common`'s `ui/page-state-manager.ts`
| `src/modules/page-state-manager.ts` | `gtfs-zone-editor` | `src/modules/page-state-manager.ts` | 58d4030 | adopted | This app's hash codec and the factory for the one manager `AppState` owns. The class itself is `gtfs-zone-web-common`'s `ui/page-state-manager.ts` now, generic over the union, so re-syncing against upstream's class has stopped being meaningful; what is left is `toParams` / `fromParams` for the five variants and the `modal` / `modal_page` params, namespaced so they cannot collide with the feed params the manager merges into the same hash
| `src/modules/breadcrumbs.ts` | — | — | — | origin | Not vendored: this repo's own crumb build (the variant switch, the label lookups, `stopAncestors`, `vehicleRouteId`, `alertParent`, `validateState`), consuming `breadcrumb-trail.ts`. Listed because gtfs-zone-rt-manager vendors *this* file, so a diff against gtfs-zone-rt-manager starts here rather than upstream |
| `scripts/vendor-check.ts` | `gtfs-zone-rt-manager` | `scripts/vendor-check.ts` | b6a8da6 | modified | The two-pass drift and staleness checker behind `pnpm vendor:check`. The one row where the flow runs backwards: gtfs-zone-rt-manager wrote the five-column, `Source repo`-aware form and this repo adopted it in Phase 1. Only the doc comment differs |
| `src/gtfs-rt.ts` | — | — | — | origin | Not vendored: the GTFS-RT decoder and poller, and the `present` guard the decoder reads a payload field through. The types it used to declare — `TripUpdate`, `ServiceAlert`, `AlertRecord`, `VehiclePosition` — and `presentNumber` are `gtfs-zone-web-common`'s `gtfs/rt-types.ts` now, so what is left is this app's own fetching half. Nothing vendors it; listed so the map of `src/` stays complete |
| `src/modules/feed-session.ts` | — | — | — | origin | Not vendored: the live session, meaning the scheduled feed, the poller, and the vehicle, alert and trip-update maps. The four members the shared modules read are `gtfs-zone-web-common`'s `gtfs/feed-session.ts` interface, which this class satisfies structurally; gtfs-zone-rt-manager's own session satisfies the same interface from the API and its SSE channel |
| `src/modules/app-state.ts` | — | — | — | origin | Not vendored: feed selection and the boot sequence, on top of `gtfs-zone-web-common`'s `ui/focus-controller.ts`, which owns `setFocus`, the `onFocusChange` / `onStateChange` split and the hrefs. gtfs-zone-rt-manager vendors it `modified`, since a feed there is an API row rather than a `FeedSelection` of URLs
| `src/map-controller.ts` | — | — | — | origin | Not vendored: MapLibre setup, camera moves, focus and vehicle follow. gtfs-zone-editor has a file of this name but it is the editor's, three times the size and built on a different model, so neither is the other's source. gtfs-zone-rt-manager vendors this one `modified` |
| `src/modules/panel-renderer.ts` | — | — | — | origin | Not vendored: the page dispatcher, the realtime index and the route-strip hover, on top of `gtfs-zone-web-common`'s `ui/panel-host.ts`, which owns the `data-nav` dispatch, the breadcrumb header, the scroll and `<details>` restore and the ticker. gtfs-zone-rt-manager vendors it `modified`
| `src/modules/search-entries.ts` | — | — | — | origin | Not vendored: builds `SearchController` entries from the session. gtfs-zone-editor has its own, over the editor's tables; the interface between them is the vendored `search-controller.ts`, not this file. gtfs-zone-rt-manager vendors this one `modified` |
| `src/modules/pages/route-page.ts` | — | — | — | origin | Not vendored: the route strip page. gtfs-zone-rt-manager vendors it `modified` |
| `src/modules/pages/stop-page.ts` | — | — | — | origin | Not vendored: the stop and station page, departures included. gtfs-zone-rt-manager vendors it `modified` |
| `src/modules/pages/alert-page.ts` | — | — | — | origin | Not vendored: `renderAlertList`, embedded by the route, stop and trip pages, plus the alert page itself. gtfs-zone-rt-manager vendors it `modified` |
| `src/modules/alerts-modal.ts` | — | — | — | origin | Not vendored and not vendored *from*: the service alerts modal, an index into the alert pages. Built on `showModal` rather than a static `<dialog>` so it joins the modal stack and `modal-router.ts` can close it. Bound to this app's page states and its navbar and dock badge ids; gtfs-zone-rt-manager lists alerts on a page instead |
| `src/modules/pages/vehicle-page.ts` | — | — | — | origin | Not vendored and not vendored *from*: gtfs-zone-rt-manager's equivalent screen is a tracker page against its own managed objects, not a copy of this one. Listed so the page set is complete |
