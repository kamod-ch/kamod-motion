import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "tsup";

const motionExternals = ["motion", "motion/mini"] as const;

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "mini/index": "src/mini/index.ts",
    "hooks/use-reduced-motion/index": "src/hooks/use-reduced-motion/index.ts",
    "hooks/use-animate/index": "src/hooks/use-animate/index.ts",
    "motion/index": "src/motion/index.ts",
    "presence/index": "src/presence/index.ts",
    "presets/index": "src/presets/index.ts",
    "value/index": "src/value/index.ts",
    "svg/index": "src/svg/index.ts",
    "hybrid/index": "src/hybrid/index.ts",
    "hybrid/value/index": "src/hybrid/value/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: "esnext",
  external: ["preact", "preact/hooks", "preact/jsx-runtime", ...motionExternals],
  async onSuccess() {
    mkdirSync("dist/presets", { recursive: true });
    copyFileSync("src/presets/tokens.css", "dist/presets/tokens.css");
    copyFileSync("src/presets/tokens.css.d.ts", "dist/presets/tokens.css.d.ts");
  },
});
