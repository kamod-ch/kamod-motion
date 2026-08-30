import { execSync } from "node:child_process";
import { gzipSync } from "node:zlib";

const externals = [
  "--external:preact",
  "--external:preact/hooks",
  "--external:preact/jsx-runtime",
  "--external:preact/compat",
  "--external:motion",
  "--external:motion/mini",
].join(" ");

const entries = [
  { name: "root", path: "dist/index.js" },
  { name: "mini", path: "dist/mini/index.js" },
  { name: "motion", path: "dist/motion/index.js" },
  { name: "presence", path: "dist/presence/index.js" },
  { name: "presets", path: "dist/presets/index.js" },
  { name: "value", path: "dist/value/index.js" },
  { name: "svg", path: "dist/svg/index.js" },
  { name: "hooks/use-reduced-motion", path: "dist/hooks/use-reduced-motion/index.js" },
  { name: "hooks/use-animate", path: "dist/hooks/use-animate/index.js" },
  { name: "hybrid", path: "dist/hybrid/index.js" },
  { name: "hybrid/value", path: "dist/hybrid/value/index.js" },
];

console.log("Bundle sizes (esbuild --bundle --minify, gzip, peers external):\n");
console.log("| Entry | Minified | Gzip |");
console.log("| --- | ---: | ---: |");

for (const entry of entries) {
  const bundle = execSync(
    `pnpm exec esbuild ${entry.path} --bundle --minify --format=esm --platform=browser ${externals}`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  );

  const gzipBytes = gzipSync(Buffer.from(bundle)).length;
  console.log(`| ${entry.name} | ${bundle.length} B | ${gzipBytes} B |`);
}
