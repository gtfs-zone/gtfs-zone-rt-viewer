# Test Track

A static frontend for visualizing GTFS Realtime feeds. Deployed at
`viz.rt.gtfs.zone`.

A Vite/TypeScript/daisyUI app with MapLibre. It loads a GTFS schedule and
reads the realtime feeds cafe-car serves: `https://rt.gtfs.zone` in production,
`http://localhost:8000` (the music-student stack) under `pnpm dev`.

```bash
pnpm install
pnpm dev          # vite on :8080
pnpm typecheck
pnpm build
pnpm vendor:check # diff vendored files against their source repo, per VENDORED.md
pnpm vuln         # osv-scanner vulnerability gate

git config core.hooksPath .githooks   # once per clone; runs vendor:check pre-commit
```

Shared modules come from
[gtfs-zone-web-common](https://github.com/gtfs-zone/gtfs-zone-web-common), a git dependency.
What is still hand-copied from other repos is listed in `VENDORED.md`.

## Releasing

```bash
cz bump        # on main; tags vX.Y.Z
git push origin main --tags
```

CI builds on the tag and publishes `dist/` to GitHub Pages.

## License

AGPL-3.0-or-later, see `LICENSE.txt`.
