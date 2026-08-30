import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

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

describe("hybrid import boundary", () => {
  it("keeps mini subgraph sources free of hybrid and full motion imports", () => {
    const miniSources = collectSourceFiles(resolve(packageRoot, "src")).filter(
      (file) => !file.includes("/hybrid/") && !file.endsWith("/types.ts"),
    );

    for (const file of miniSources) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/from ["']@kamod-ch\/motion\/hybrid["']/);
      expect(source, file).not.toMatch(/from ["']\.\/hybrid/);
      expect(source, file).not.toMatch(/from ["']react["']/);
      expect(source, file).not.toMatch(/from ["']react-dom["']/);
      expect(source, file).not.toMatch(/from ["']motion["']/);
    }
  });

  it("includes the full motion engine only in hybrid entry sources", () => {
    const hybridFiles = [
      resolve(packageRoot, "src/hybrid/index.ts"),
      resolve(packageRoot, "src/hybrid/value/index.ts"),
      resolve(packageRoot, "src/hybrid/value/use-motion-value.ts"),
      resolve(packageRoot, "src/hybrid/value/use-spring.ts"),
    ];

    for (const file of hybridFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, file).toMatch(/from ["']motion["']/);
    }
  });

  it("ships a hybrid bundle graph that references motion when built", () => {
    const hybridDist = resolve(packageRoot, "dist/hybrid/index.js");
    const miniDist = resolve(packageRoot, "dist/mini/index.js");

    if (!existsSync(hybridDist) || !existsSync(miniDist)) {
      return;
    }

    const hybridSource = readFileSync(hybridDist, "utf8");
    expect(hybridSource).toMatch(/from ["']motion["']/);

    const miniEngineChunk = readFileSync(resolve(packageRoot, "dist/chunk-JVLGJ32D.js"), "utf8");
    expect(miniEngineChunk).toMatch(/from ["']motion\/mini["']/);
    expect(hybridSource).not.toMatch(/from ["']motion\/mini["']/);
  });
});

describe("@kamod-ch/motion/hybrid exports", () => {
  it("exposes hybrid-only utilities", async () => {
    const hybrid = await import("../index.js");
    expect(hybrid.MOTION_ENGINE).toBe("hybrid");
    expect(typeof hybrid.motionValue).toBe("function");
    expect(typeof hybrid.animateValue).toBe("function");
    expect(typeof hybrid.stagger).toBe("function");
    expect(typeof hybrid.followValue).toBe("function");
  });
});

describe("@kamod-ch/motion/hybrid/value exports", () => {
  it("exposes motion value hooks", async () => {
    const value = await import("../value/index.js");
    expect(typeof value.useMotionValue).toBe("function");
    expect(typeof value.useSpring).toBe("function");
    expect(typeof value.animateHybridValue).toBe("function");
  });
});
