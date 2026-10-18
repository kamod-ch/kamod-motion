# Release notes — v0.2.0 (draft)

**Status:** QA complete. Version set to `0.2.0` in `packages/core/package.json`.

## Recommendation

**Ship `@kamod-ch/motion@0.2.0`** after `pnpm qa:release` and maintainer review. This is a **minor** bump for the 0.x line because peer ranges moved to Preact 11 and Motion 14.

## Installation

```sh
pnpm add @kamod-ch/motion@0.2.0 preact@^11 motion@^14
```

Peers (required):

```json
{
  "preact": "^11.0.0",
  "motion": "^14.3.0"
}
```

## Breaking / migration

| Consumer                                   | Change                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Preact 10 apps                             | Upgrade to Preact 11. JSX types moved (`CSSProperties`, heading attributes are top-level `preact` exports). |
| Motion 13 apps                             | Upgrade the `motion` peer to 14.x. Mini vs hybrid split is unchanged.                                       |
| `@kamod-ch/ui-motion` / `@kamod-ch/charts` | Bump `@kamod-ch/motion` to `^0.2.0` and align `motion` to 14.x.                                             |

API surface and export map are unchanged from 0.1.0.

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

## Tooling

- TypeScript 7 + `tsc -p tsconfig.build.json` for declarations (tsup emits JS only)
- Vitest 5, tsup 9, PreactPress 3

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
| `preact`    | UI runtime       | yes (`^11.0.0`)              | installed by consumer              |
| `motion`    | Animation engine | yes (`^14.3.0`)              | installed by consumer              |
| `react`     | —                | **no**                       | **not required**                   |
| `react-dom` | —                | **no**                       | **not required**                   |

## Bundle sizes (esbuild minify, gzip, peers external)

Command: `pnpm --filter @kamod-ch/motion size`

| Entry    | Minified |   Gzip | Budget    |
| -------- | -------: | -----: | --------- |
| `mini`   |    102 B |   87 B | —         |
| `value`  |   2.8 KB | 1.4 KB | ≤ 3 KB ✓  |
| `svg`    |   2.7 KB | 1.2 KB | ≤ 4 KB ✓  |
| `hybrid` |    217 B |  155 B | ≤ 20 KB ✓ |
| root     |   6.7 KB | 2.5 KB | ≤ 8 KB ✓  |

`pnpm --filter @kamod-ch/motion size` now fails if gzip budgets are exceeded. Peer baseline (not counted): `motion/mini` and full `motion` stay external.

## Compatibility matrix

| Environment | Version       | Status                      |
| ----------- | ------------- | --------------------------- |
| Node.js     | ≥ 20 (CI: 22) | verified (SSR import tests) |
| Preact      | ^11.0.0       | peer + consumer QA          |
| motion      | ^14.3.0       | peer + contract tests       |
| TypeScript  | 7.x           | strict typecheck            |

## QA commands

```sh
pnpm check
pnpm qa:release
pnpm test:e2e
```

## Known limitations

See README and `.docs/ARCHITECTURE.md` — still deferred: scroll/inView exports, layout animation, SVG `d` morphing, chart orchestration wrappers.

Known peer warning: `@kamod-ch/themes@0.2.1` still declares `preact ^10` until themes is republished.
