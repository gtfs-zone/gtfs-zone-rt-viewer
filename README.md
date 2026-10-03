# gtfs-zone-rt-viewer

A static frontend for visualizing GTFS Realtime feeds. Deployed at
`viz.rt.gtfs.zone`.

A Vite/TypeScript/daisyUI app with MapLibre. It loads a GTFS schedule and
reads the realtime feeds rt-api serves: `https://rt.gtfs.zone` in production,
`http://localhost:8000` (the dev-stack) under `pnpm dev`.

```bash
pnpm install
pnpm dev          # vite on :8080
pnpm check        # typecheck, eslint, knip
pnpm format
pnpm build
pnpm vuln         # osv-scanner vulnerability gate
```

Shared modules come from
[gtfs-zone-web-common](https://github.com/gtfs-zone/gtfs-zone-web-common), a git dependency.

## Releasing

```bash
cz bump        # on main; tags vX.Y.Z
git push origin main --tags
```

CI builds on the tag and publishes `dist/` to GitHub Pages.

## License

AGPL-3.0-or-later, see `LICENSE.txt`.
