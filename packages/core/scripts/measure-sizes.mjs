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
  { name: "root", path: "dist/index.js", gzipBudget: 8 * 1024 },
  { name: "mini", path: "dist/mini/index.js" },
  { name: "motion", path: "dist/motion/index.js" },
  { name: "presence", path: "dist/presence/index.js" },
  { name: "presets", path: "dist/presets/index.js" },
  { name: "value", path: "dist/value/index.js", gzipBudget: 3 * 1024 },
  { name: "svg", path: "dist/svg/index.js", gzipBudget: 4 * 1024 },
  { name: "hooks/use-reduced-motion", path: "dist/hooks/use-reduced-motion/index.js" },
  { name: "hooks/use-animate", path: "dist/hooks/use-animate/index.js" },
  { name: "hybrid", path: "dist/hybrid/index.js", gzipBudget: 20 * 1024 },
  { name: "hybrid/value", path: "dist/hybrid/value/index.js" },
];

function formatBytes(bytes) {
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

console.log("Bundle sizes (esbuild --bundle --minify, gzip, peers external):\n");
console.log("| Entry | Minified | Gzip | Budget |");
console.log("| --- | ---: | ---: | --- |");

const violations = [];

for (const entry of entries) {
  const bundle = execSync(
    `pnpm exec esbuild ${entry.path} --bundle --minify --format=esm --platform=browser ${externals}`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  );

  const gzipBytes = gzipSync(Buffer.from(bundle)).length;
  const budget = entry.gzipBudget
    ? `≤ ${formatBytes(entry.gzipBudget)}${gzipBytes <= entry.gzipBudget ? " ✓" : " ✗"}`
    : "—";

  if (entry.gzipBudget && gzipBytes > entry.gzipBudget) {
    violations.push(
      `${entry.name}: ${formatBytes(gzipBytes)} gzip exceeds ${formatBytes(entry.gzipBudget)}`,
    );
  }

  console.log(
    `| ${entry.name} | ${formatBytes(bundle.length)} | ${formatBytes(gzipBytes)} | ${budget} |`,
  );
}

if (violations.length > 0) {
  console.error("\nBundle budget exceeded:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}
