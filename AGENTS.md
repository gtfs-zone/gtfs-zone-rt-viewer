# AGENTS.md

Static frontend for visualizing GTFS Realtime feeds, deployed to
`viz.rt.gtfs.zone` from `v*` tags.

## Commands

```bash
pnpm vuln         # osv-scanner vulnerability gate
```

## Architecture

### Shared modules (`gtfs-zone-web-common`)

About a third of the app (the scheduled feed parser, the realtime types and live
index, the page furniture and the app shell) lives in the `gtfs-zone-web-common`
package, a git dependency shipping raw TypeScript. Import it as
`gtfs-zone-web-common/{ui,gtfs,map,util}/...`; `tsconfig.json` `paths` and a
`resolve.alias` in `vite.config.js` point at `node_modules/gtfs-zone-web-common/src`.
`src/shell.ts` mounts the shell and `index.ts` must import it first.

A shared change is a commit in gtfs-zone-web-common, a tag, and a bump in each
consumer. It is not edited here. Restart the dev server after a bump: Vite does
not watch `node_modules`, so a stale transform can load two copies of a shared
module (logged as `loaded twice`).

## Conventions

- **Commits**: Conventional Commits, enforced by the `commit-msg` hook. Setup and
  release are in [CONTRIBUTING.md](CONTRIBUTING.md).
- **Verification**: no Playwright or other browser automation. Stop at
  `pnpm typecheck` / `pnpm build` and hand off; the user checks in the browser.
- **UI**: conventions live in gtfs-zone-web-common's `AGENTS.md`.
- **Plans**: write plans to `CURRENT_PLAN.md` at the repo root as a
  checklist (`- [ ]`), ticked off as work lands. It is neither tracked nor
  gitignored: never stage or commit it.
