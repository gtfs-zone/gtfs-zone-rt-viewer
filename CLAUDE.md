# gtfs-zone-rt-viewer - Claude Guide

## Project Overview

A static frontend for visualizing GTFS realtime feeds

## Commands

```bash
pnpm dev
pnpm typecheck    # the gate before any commit
pnpm build
pnpm vendor:check # diff vendored files against their source repo, per VENDORED.md

git config core.hooksPath .githooks   # once per clone; runs vendor:check pre-commit
```

## Shared modules (`gtfs-zone-web-common`)

A third of `src/` is no longer in this repo. The files that have moved out of
the apps live in the `gtfs-zone-web-common` package, a git dependency shipping raw
TypeScript with no build step. The scheduled feed parser is one of them, as
`gtfs-zone-web-common/gtfs/scheduled`, along with the feed clock, the load modal, the
curated examples, and the realtime half: the payload types, the live index, the
alert lookups and the page furniture the object pages render through, and the
app shell: its markup (mounted by `src/shell.ts`, which `index.ts` must import
first), its stylesheet (`@import`ed by `src/styles/main.css`), the page-state
manager, the focus controller and the panel host. Import them as `gtfs-zone-web-common/ui/...`,
`gtfs-zone-web-common/gtfs/...`, `gtfs-zone-web-common/map/...` and `gtfs-zone-web-common/util/...`;
`tsconfig.json` `paths` and a `resolve.alias` in `vite.config.js` both point at
`node_modules/gtfs-zone-web-common/src`.

A shared change is a commit in gtfs-zone-web-common, a tag, and a bump in each of the
three consumers. It is not edited here and `vendor:check` does not cover it.

Restart the dev server after a bump. The alias resolves through a pnpm symlink
into the store, and Vite does not watch `node_modules`, so files whose transform
is still cached keep importing the old store path: the page then holds two
copies of a shared module, each with its own module-level state. gtfs-zone-web-common's
`util/module-state` keeps that from corrupting anything and logs `loaded twice`.

What is still hand-copied is in `VENDORED.md`, and for that half the one-way
flow rule still holds: gtfs-zone-editor -> rt-viewer -> rt-manager.

## Rules

- Do NOT use Playwright (or any browser automation) to verify changes. The user does
  visual/browser verification themselves. Stop at `pnpm typecheck` / `pnpm build` and
  hand off.
- UI conventions live in gtfs-zone-web-common's `CLAUDE.md`: no `cursor-help`, `toggle` not `checkbox` for on/off settings, `SELECTED_ROW_CLASS` for picked list rows.

## Related Repos

| Repo | Description | URL |
|---|---|---|
| rt-api | GTFS-RT HTTP API serving real-time feeds | https://github.com/gtfs-zone/gtfs-zone-rt-api |
| rt-traccar-receiver | Worker that tracks and posts vehicle positions | https://github.com/gtfs-zone/gtfs-zone-rt-traccar-receiver |
| rt-delay-estimator | Worker that generates trip update predictions | https://github.com/gtfs-zone/gtfs-zone-rt-delay-estimator |
| static-importer | Worker that ingests and processes GTFS schedule data | https://github.com/gtfs-zone/gtfs-zone-static-importer |
| gtfs-zone-db-models | Shared Python library for GTFS types and utilities | https://github.com/gtfs-zone/gtfs-zone-db-models |
| dev-stack | Orchestration repo for deployments and infra | https://github.com/gtfs-zone/gtfs-zone-dev-stack |
| homepage | Static marketing/status site | https://github.com/gtfs-zone/gtfs-zone-homepage |

