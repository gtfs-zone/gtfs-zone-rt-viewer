# gtfs-zone-rt-viewer

[![CI](https://img.shields.io/github/actions/workflow/status/gtfs-zone/gtfs-zone-rt-viewer/check.yml?branch=main&label=CI)](https://github.com/gtfs-zone/gtfs-zone-rt-viewer/actions/workflows/check.yml?query=branch%3Amain) [![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue)](LICENSE.txt) [![viz.rt.gtfs.zone](https://img.shields.io/website?url=https%3A%2F%2Fviz.rt.gtfs.zone&label=viz.rt.gtfs.zone)](https://viz.rt.gtfs.zone)

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
