import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  Motion,
  Presence,
  fade,
  motionPresets,
  animate,
  animateSequence,
  useAnimate,
  useReducedMotion,
} from "../index.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === "hybrid" || entry === "__tests__") {
        continue;
      }
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("@kamod-ch/motion mini entry", () => {
  it("exports mini hooks, animate helpers, and declarative components", () => {
    expect(typeof useReducedMotion).toBe("function");
    expect(typeof useAnimate).toBe("function");
    expect(typeof animate).toBe("function");
    expect(typeof animateSequence).toBe("function");
    expect(typeof Motion).toBe("function");
    expect(typeof Presence).toBe("function");
    expect(motionPresets.fade).toBe(fade);
  });

  it("does not statically import react, react-dom, or full motion in mini source files", () => {
    const miniSources = collectSourceFiles(resolve(packageRoot, "src")).filter(
      (file) => !file.includes("/hybrid/") && !file.endsWith("/types.ts"),
    );

    for (const file of miniSources) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/from ["']react["']/);
      expect(source, file).not.toMatch(/from ["']react-dom["']/);
      expect(source, file).not.toMatch(/from ["']motion["']/);
    }
  });
});
