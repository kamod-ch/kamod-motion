import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const distRoot = join(packageRoot, "dist");

const externals = [
  "--external:preact",
  "--external:preact/hooks",
  "--external:preact/jsx-runtime",
  "--external:preact/compat",
  "--external:motion",
  "--external:motion/mini",
].join(" ");

const miniEntries = [
  "dist/index.js",
  "dist/mini/index.js",
  "dist/motion/index.js",
  "dist/presence/index.js",
  "dist/presets/index.js",
  "dist/value/index.js",
  "dist/svg/index.js",
  "dist/hooks/use-reduced-motion/index.js",
  "dist/hooks/use-animate/index.js",
];

function collectDistJsFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (entry === "hybrid") {
        continue;
      }
      files.push(...collectDistJsFiles(fullPath));
      continue;
    }
    if (fullPath.endsWith(".js") && !fullPath.endsWith(".js.map")) {
      files.push(fullPath);
    }
  }
  return files;
}

console.log("Import graph analysis (@kamod-ch/motion dist)\n");

let failed = false;

console.log("## Mini subgraph dist files must not reference hybrid or full motion\n");
for (const file of collectDistJsFiles(distRoot)) {
  const source = readFileSync(file, "utf8");
  const relative = file.replace(`${distRoot}/`, "dist/");
  if (/from ["']motion["']/.test(source)) {
    console.log(`FAIL ${relative}: imports full 'motion'`);
    failed = true;
  }
  if (/from ["']@kamod-ch\/motion\/hybrid/.test(source) || /dist\/hybrid\//.test(source)) {
    console.log(`FAIL ${relative}: references hybrid subgraph`);
    failed = true;
  }
}
if (!failed) {
  console.log("OK — no hybrid or full motion imports in mini dist files\n");
}

console.log("## esbuild bundles (mini entries) must externalize motion, not inline hybrid\n");
for (const entry of miniEntries) {
  const bundle = execSync(
    `pnpm exec esbuild ${entry} --bundle --minify --format=esm --platform=browser ${externals}`,
    { cwd: packageRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  );

  if (/from ["']motion["']/.test(bundle) && !/from ["']motion\/mini["']/.test(bundle)) {
    console.log(`FAIL ${entry}: bundled output references full motion`);
    failed = true;
  }
  if (bundle.includes("hybrid/index") || bundle.includes("/hybrid/")) {
    console.log(`FAIL ${entry}: bundled output inlines hybrid subgraph`);
    failed = true;
  }
  console.log(`OK ${entry}`);
}

console.log("\n## Hybrid entry must reference full motion (external)\n");
const hybridSource = readFileSync(join(distRoot, "hybrid/index.js"), "utf8");
if (!/from ["']motion["']/.test(hybridSource)) {
  console.log("FAIL dist/hybrid/index.js: expected external import from 'motion'");
  failed = true;
} else {
  console.log("OK dist/hybrid/index.js imports 'motion'");
}

if (failed) {
  process.exit(1);
}

console.log("\nImport graph checks passed.");
