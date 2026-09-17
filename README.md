<p align="center">
  <img src=".github/assets/logo-kamod-motion-dark.svg#gh-light-mode-only" alt="Kamod Motion" width="280" />
  <img src=".github/assets/logo-kamod-motion-light.svg#gh-dark-mode-only" alt="Kamod Motion" width="280" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kamod-ch/motion"><img src="https://img.shields.io/npm/v/%40kamod-ch%2Fmotion" alt="npm version" /></a>
  <a href="https://github.com/kamod-ch/kamod-motion/stargazers"><img src="https://img.shields.io/github/stars/kamod-ch/kamod-motion?style=social" alt="GitHub stars" /></a>
  <a href="https://github.com/kamod-ch/kamod-motion/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
</p>

<p align="center">
  <strong><a href="https://www.npmjs.com/package/@kamod-ch/motion">npm</a></strong> ·
  <strong><a href="https://github.com/kamod-ch/kamod-motion">GitHub</a></strong> ·
  <strong><a href="https://github.com/kamod-ch/kamod-motion/issues">Issues</a></strong>
</p>

> If Kamod Motion saves you time, **[star the repo](https://github.com/kamod-ch/kamod-motion)** — it helps others discover the project.

# Kamod Motion

Preact-first animation primitives built on [Vanilla Motion](https://motion.dev/docs/quick-start). The default entry uses the lightweight `motion/mini` engine; the full hybrid engine is available via a separate opt-in import.

```tsx
import { Motion } from '@kamod-ch/motion/motion'
import { Presence } from '@kamod-ch/motion/presence'
import { fade } from '@kamod-ch/motion/presets'
import '@kamod-ch/motion/presets/tokens.css'

function Panel({ open }: { open: boolean }) {
  return (
    <Presence>
      {open ? <Motion {...fade.in} /> : null}
    </Presence>
  )
}
```

No `motion/react`, `react`, or `react-dom`. `preact` and `motion` are peer dependencies.
