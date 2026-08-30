# @kamod-ch/motion

Preact-first animation primitives for Kamod applications, built on [Vanilla Motion](https://motion.dev/docs/quick-start). The default entry uses the lightweight `motion/mini` engine; the full hybrid engine is available via a separate opt-in import.

**We do not use or support `motion/react`, `react`, or `react-dom`.**

## Installation

```sh
pnpm add @kamod-ch/motion preact motion
```

npm:

```sh
npm install @kamod-ch/motion preact motion
```

### Peer dependencies

| Package  | Version    | Required |
| -------- | ---------- | -------- |
| `preact` | `^10.29.8` | yes      |
| `motion` | `^13.1.1`  | yes      |

`react` and `react-dom` are **not** peers and are **not** pulled in transitively by `@kamod-ch/motion`.

### Node.js

Requires **Node ≥ 20** (CI validates on Node 22 LTS).

## Quick start

```tsx
import { Motion } from "@kamod-ch/motion/motion";
import { Presence } from "@kamod-ch/motion/presence";
import { fade, scale } from "@kamod-ch/motion/presets";
import "@kamod-ch/motion/presets/tokens.css";
```

Root barrel (mini subgraph only — no hybrid symbols):

```tsx
import { Motion, Presence, fade, useReducedMotion } from "@kamod-ch/motion";
```

Hybrid engine (opt-in):

```tsx
import { motionValue, stagger } from "@kamod-ch/motion/hybrid";
import { useSpring } from "@kamod-ch/motion/hybrid/value";
```

## Export map

| Subpath                                     | Purpose                                     |
| ------------------------------------------- | ------------------------------------------- |
| `@kamod-ch/motion`                          | Mini-engine barrel (no hybrid symbols)      |
| `@kamod-ch/motion/mini`                     | `animate`, `animateSequence`                |
| `@kamod-ch/motion/motion`                   | `Motion` component                          |
| `@kamod-ch/motion/presence`                 | `Presence`, `usePresence`                   |
| `@kamod-ch/motion/presets`                  | Keyframe presets + `stagger` delay helper   |
| `@kamod-ch/motion/presets/tokens.css`       | Optional CSS duration/easing tokens         |
| `@kamod-ch/motion/hooks/use-reduced-motion` | `useReducedMotion`                          |
| `@kamod-ch/motion/hooks/use-animate`        | `useAnimate`                                |
| `@kamod-ch/motion/value`                    | `animateNumber`, `useAnimateNumber`         |
| `@kamod-ch/motion/svg`                      | `animateSvg`, `useAnimateSvg`               |
| `@kamod-ch/motion/hybrid`                   | `motionValue`, `animateValue`, `stagger`, … |
| `@kamod-ch/motion/hybrid/value`             | `useMotionValue`, `useSpring`, …            |

See [`.docs/ARCHITECTURE.md`](.docs/ARCHITECTURE.md) for API contracts, SSR rules, and bundle budgets.

## Bundle sizes

Measured with `pnpm --filter @kamod-ch/motion size` (esbuild minify + gzip; peers external). Latest v0.1.0 measurements:

| Entry       |   Gzip |
| ----------- | -----: |
| `mini`      |   87 B |
| `value`     | 1.4 KB |
| `svg`       | 1.2 KB |
| `hybrid`    |  155 B |
| root barrel | 2.6 KB |

Mini subgraph imports never statically pull the hybrid engine.

## Documentation

Interactive docs and playground (private monorepo package):

```sh
pnpm --filter @kamod-ch/motion-docs dev
```

Published docs (when deployed): `https://kamod-ch.github.io/kamod-motion/`

## Repository layout

| Path                   | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `packages/core`        | Published npm package `@kamod-ch/motion`    |
| `packages/docs`        | Private PreactPress documentation           |
| `examples/preact-vite` | Minimal consumer app + tarball QA reference |

## Development

```sh
pnpm install
pnpm check          # typecheck, format, lint, test, build
pnpm qa:release     # publint, attw, sizes, import graph, tarball consumer
pnpm test:e2e       # docs Playwright suite
```

## Known limitations (v0.1)

- No `motion/react` bindings — Preact-only wrappers.
- Mini engine: WAAPI-only DOM/SVG; springs degrade to eased tweens.
- No SVG `d` path morphing, scroll-linked animation, layout projection, or gestures.
- Hybrid APIs (`motionValue`, `stagger`, …) require explicit `@kamod-ch/motion/hybrid` import.

## License

MIT — see [LICENSE](LICENSE).
