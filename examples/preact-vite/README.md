# Preact + Vite consumer example

Minimal real-world app that imports `@kamod-ch/motion` only from **published entry points** (`/motion`, `/presence`, `/presets`, `/presets/tokens.css`). No Vite aliases to monorepo source.

## Monorepo development

```bash
pnpm install
pnpm --filter kamod-motion-preact-vite-example dev
```

## Package QA (packed tarball)

Verify the published package shape without workspace symlinks:

```bash
# From repository root
pnpm --filter @kamod-ch/motion build
pnpm --filter @kamod-ch/motion pack --pack-destination /tmp/kamod-motion-pack

cd examples/preact-vite
rm -rf node_modules
pnpm install --ignore-workspace
pnpm add file:/tmp/kamod-motion-pack/kamod-ch-motion-*.tgz motion preact
pnpm build
```

The app should build and run against the packed tarball exactly as an external consumer would.
