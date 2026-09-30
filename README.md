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
[interlocking](https://github.com/gtfs-zone/interlocking), a git dependency.
What is still hand-copied from other repos is listed in `VENDORED.md`.

## Releasing

```bash
cz bump        # on main; tags vX.Y.Z
git push origin main --tags
git push github main --tags
```

CI builds on the tag, pushes the image by digest and records that digest in
`deploy-gtfs-rt/sites/kustomization.yaml`; ArgoCD rolls it out.

## License

AGPL-3.0-or-later, see `LICENSE.txt`.
