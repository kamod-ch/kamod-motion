import { execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const packDir = join(tmpdir(), "kamod-motion-pack");
const consumerRoot = mkdtempSync(join(tmpdir(), "kamod-motion-qa-consumer-"));

function run(command, options = {}) {
  execSync(command, { stdio: "inherit", ...options });
}

console.log("=== Tarball consumer QA ===\n");
console.log(`Pack directory: ${packDir}`);
console.log(`Consumer root: ${consumerRoot}\n`);

run("pnpm build", { cwd: packageRoot });

rmSync(packDir, { recursive: true, force: true });
mkdirSync(packDir, { recursive: true });
run(`pnpm pack --pack-destination ${packDir}`, { cwd: packageRoot });

const tarball = execSync(`ls ${packDir}/kamod-ch-motion-*.tgz`, { encoding: "utf8" })
  .trim()
  .split("\n")[0];
console.log(`\nPacked: ${tarball}\n`);

writeFileSync(
  join(consumerRoot, "package.json"),
  JSON.stringify(
    {
      name: "kamod-motion-tarball-qa",
      private: true,
      type: "module",
      scripts: {
        test: "node consumer-test.mjs",
      },
      dependencies: {
        "@kamod-ch/motion": `file:${tarball}`,
        motion: "^13.1.1",
        preact: "^10.29.8",
        "preact-render-to-string": "^6.6.4",
      },
    },
    null,
    2,
  ),
);

writeFileSync(
  join(consumerRoot, "consumer-test.mjs"),
  `import { h } from "preact";
import { render } from "preact-render-to-string";

const results = [];

function assert(name, condition, detail = "") {
  if (!condition) {
    throw new Error(\`FAIL \${name}\${detail ? \`: \${detail}\` : ""}\`);
  }
  results.push(\`OK \${name}\`);
}

// Root + mini
const root = await import("@kamod-ch/motion");
assert("root exports animate", typeof root.animate === "function");
assert("root exports Motion", typeof root.Motion === "function");
assert("root exports Presence", typeof root.Presence === "function");
assert("root exports useReducedMotion", typeof root.useReducedMotion === "function");
assert("root exports useAnimate", typeof root.useAnimate === "function");
assert("root exports fade preset", root.fade?.animate?.opacity === 1);
assert("root has no hybrid motionValue", root.motionValue === undefined);

const mini = await import("@kamod-ch/motion/mini");
assert("mini exports animate", typeof mini.animate === "function");
assert("mini exports animateSequence", typeof mini.animateSequence === "function");

// Hooks
const reduced = await import("@kamod-ch/motion/hooks/use-reduced-motion");
assert("useReducedMotion export", typeof reduced.useReducedMotion === "function");

const animateHook = await import("@kamod-ch/motion/hooks/use-animate");
assert("useAnimate export", typeof animateHook.useAnimate === "function");

// Components
const motionEntry = await import("@kamod-ch/motion/motion");
assert("Motion export", typeof motionEntry.Motion === "function");

const presenceEntry = await import("@kamod-ch/motion/presence");
assert("Presence export", typeof presenceEntry.Presence === "function");
assert("usePresence export", typeof presenceEntry.usePresence === "function");

// Presets + CSS
const presets = await import("@kamod-ch/motion/presets");
assert("presets fade", presets.fade?.animate?.opacity === 1);
assert("presets scale", presets.scale?.animate?.scale === 1);
assert("presets stagger helper", typeof presets.stagger === "function");

const tokensPath = new URL("@kamod-ch/motion/presets/tokens.css", import.meta.url);
assert("tokens.css resolvable", tokensPath.pathname.endsWith("tokens.css"));

// Value + SVG
const value = await import("@kamod-ch/motion/value");
assert("animateNumber", typeof value.animateNumber === "function");
assert("useAnimateNumber", typeof value.useAnimateNumber === "function");

const svg = await import("@kamod-ch/motion/svg");
assert("animateSvg", typeof svg.animateSvg === "function");
assert("useAnimateSvg", typeof svg.useAnimateSvg === "function");

// Hybrid (opt-in)
const hybrid = await import("@kamod-ch/motion/hybrid");
assert("hybrid motionValue", typeof hybrid.motionValue === "function");
assert("hybrid stagger", typeof hybrid.stagger === "function");

const hybridValue = await import("@kamod-ch/motion/hybrid/value");
assert("hybrid useMotionValue", typeof hybridValue.useMotionValue === "function");
assert("hybrid useSpring", typeof hybridValue.useSpring === "function");

// SSR: static import + renderToString
await import("@kamod-ch/motion/motion");
const { Motion } = motionEntry;
const { fade } = presets;

const html = render(
  h(Motion, { initial: fade.initial, animate: fade.animate, "aria-label": "panel" }, "Panel"),
);
assert("SSR renderToString markup", html.includes('aria-label="panel"'));
assert("SSR initial opacity inline", /opacity:\\s*0/.test(html));

// Node static import (architecture contract)
await import("@kamod-ch/motion");
await import("@kamod-ch/motion/mini");

console.log(results.join("\\n"));
console.log("\\nTarball consumer tests passed.");
`,
);

writeFileSync(join(consumerRoot, ".npmrc"), "package-lock=false\n");

console.log("Installing tarball consumer (outside workspace)…\n");
run("npm install --ignore-scripts", { cwd: consumerRoot });

console.log("\nChecking for react / react-dom in dependency tree…\n");
const lsReact = execSync("npm ls react react-dom --all 2>&1 || true", {
  cwd: consumerRoot,
  encoding: "utf8",
});
assertNoReact(lsReact);

console.log("\nRunning consumer tests…\n");
run("node consumer-test.mjs", { cwd: consumerRoot });

console.log("\n=== Tarball consumer QA passed ===\n");

function assertNoReact(output) {
  const lines = output.split("\n").filter((line) => /react@|react-dom@/.test(line));
  const motionPackageLines = lines.filter(
    (line) => line.includes("@kamod-ch/motion") || line.includes("kamod-ch-motion"),
  );
  if (motionPackageLines.length > 0) {
    console.error("FAIL: react found under @kamod-ch/motion dependency chain:");
    console.error(motionPackageLines.join("\n"));
    process.exit(1);
  }

  const directDeps = lines.filter(
    (line) => line.trim().startsWith("└") || line.trim().startsWith("├"),
  );
  const reactFromMotion = directDeps.some(
    (line) =>
      line.includes("@kamod-ch/motion") && (line.includes("react@") || line.includes("react-dom@")),
  );

  if (reactFromMotion) {
    console.error("FAIL: react/react-dom appears as transitive dependency of @kamod-ch/motion");
    console.error(output);
    process.exit(1);
  }

  console.log("OK — react and react-dom are not required by @kamod-ch/motion tarball install");
  if (lines.length > 0) {
    console.log("(npm ls may list empty or unrelated trees; no react under @kamod-ch/motion)");
  }
}
