# Release notes — v0.1.0 (draft)

**Status:** QA complete, **not published**. Version set to `0.1.0` in `packages/core/package.json` for release preparation only.

## Recommendation

**Ship `@kamod-ch/motion@0.1.0`** after maintainer review. All automated gates pass locally; tarball consumer smoke, import-graph boundary, publint, and attw verified.

## Installation

```sh
pnpm add @kamod-ch/motion@0.1.0 preact motion
```

Peers (required):

```json
{
  "preact": "^10.29.8",
  "motion": "^13.1.1"
}
```

## What's included

### Mini engine (default)

- `animate`, `animateSequence` via `@kamod-ch/motion/mini`
- `Motion`, `Presence`, presets, `useAnimate`, `useReducedMotion`
- `animateNumber` / `useAnimateNumber` (rAF driver, no full motion import)
- `animateSvg` / `useAnimateSvg` (WAAPI via `motion/mini`)

### Hybrid engine (opt-in)

- `@kamod-ch/motion/hybrid` — `motionValue`, `animateValue`, `followValue`, `stagger`, `spring`
- `@kamod-ch/motion/hybrid/value` — `useMotionValue`, `useSpring`, `animateHybridValue`

### Explicitly excluded

- `motion/react`, `react`, `react-dom`
- Scroll, layout, drag/gesture wrappers
- SVG path `d` morphing

## Export map (published)

```json
{
  ".": "./dist/index.js",
  "./mini": "./dist/mini/index.js",
  "./hooks/use-reduced-motion": "./dist/hooks/use-reduced-motion/index.js",
  "./hooks/use-animate": "./dist/hooks/use-animate/index.js",
  "./motion": "./dist/motion/index.js",
  "./presence": "./dist/presence/index.js",
  "./presets": "./dist/presets/index.js",
  "./presets/tokens.css": "./dist/presets/tokens.css",
  "./value": "./dist/value/index.js",
  "./svg": "./dist/svg/index.js",
  "./hybrid": "./dist/hybrid/index.js",
  "./hybrid/value": "./dist/hybrid/value/index.js"
}
```

## Peer dependency matrix

| Package     | Role             | In `@kamod-ch/motion` peers? | Transitive runtime via tarball QA? |
| ----------- | ---------------- | ---------------------------- | ---------------------------------- |
| `preact`    | UI runtime       | yes                          | installed by consumer              |
| `motion`    | Animation engine | yes                          | installed by consumer              |
| `react`     | —                | **no**                       | **not required**                   |
| `react-dom` | —                | **no**                       | **not required**                   |

## Bundle sizes (esbuild minify, gzip, peers external)

Command: `pnpm --filter @kamod-ch/motion size`

| Entry    | Minified |   Gzip | Budget    |
| -------- | -------: | -----: | --------- |
| `mini`   |    102 B |   87 B | —         |
| `value`  |   2.9 KB | 1.4 KB | ≤ 3 KB ✓  |
| `svg`    |   2.7 KB | 1.2 KB | ≤ 4 KB ✓  |
| `hybrid` |    217 B |  155 B | ≤ 20 KB ✓ |
| root     |   6.9 KB | 2.6 KB | ≤ 8 KB ✓  |

Peer baseline (not counted): `motion/mini` ~3.1 KB gzip, full `motion` ~22.8 KB gzip.

## Import graph (verified)

Command: `pnpm --filter @kamod-ch/motion qa:import-graph`

- Mini dist files do **not** import `motion` (full) or `./hybrid`
- esbuild bundles of mini entry points do **not** inline hybrid subgraph
- `dist/hybrid/index.js` externally imports `motion` (full)

## Tarball consumer QA (verified)

Command: `pnpm --filter @kamod-ch/motion qa:tarball`

- `pnpm pack` → install in temp directory **outside** workspace resolution (`npm install`, no workspace link)
- All published entry points import successfully
- `presets/tokens.css` resolves
- SSR: `preact-render-to-string` + `Motion` renders initial inline styles without calling `animate`
- Node static import of root and mini entries succeeds
- `npm ls react react-dom` shows no react under `@kamod-ch/motion` dependency chain

## SSR / hydration contract (verified in core tests)

- No `window` / `matchMedia` / `animate()` at module scope
- `useReducedMotion` returns `false` on server
- `Motion` SSR markup uses `initial` inline styles; `animate()` deferred to client `useLayoutEffect`
- `useAnimate` returns no-op controls during SSR

## Compatibility matrix

| Environment | Version       | Status                      |
| ----------- | ------------- | --------------------------- |
| Node.js     | ≥ 20 (CI: 22) | verified (SSR import tests) |
| Preact      | ^10.29.8      | peer + consumer QA          |
| motion      | ^13.1.1       | peer + contract tests       |
| TypeScript  | 6.x           | strict typecheck            |

## QA commands run

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm qa:publint
pnpm qa:attw
pnpm qa:size
pnpm qa:import-graph
pnpm qa:tarball
pnpm test:e2e
git diff --check
```

## Known limitations

See README and `.docs/ARCHITECTURE.md` — deferred: scroll/inView exports, layout animation, SVG `d` morphing, chart orchestration wrappers.
