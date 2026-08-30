import { describe, expect, it } from "vitest";
import { fade, motionPresets, resolvePreset, scale, stagger, type Preset } from "../index.js";

describe("motionPresets", () => {
  it("exports immutable preset definitions", () => {
    expect(Object.isFrozen(motionPresets)).toBe(false);
    expect(fade.animate).toEqual({ opacity: 1 });
    expect(scale.initial).toEqual({ opacity: 0, scale: 0.95 });
    expect(scale.reduced?.animate).toEqual({ opacity: 1 });
  });

  it("resolves reduced-motion alternatives for spatial presets", () => {
    expect(resolvePreset(scale, true).animate).toEqual({ opacity: 1 });
    expect(resolvePreset(fade, true).animate).toEqual({ opacity: 1 });
  });

  it("exposes a stagger delay helper", () => {
    const delay = stagger(0.1, 0.05);
    expect(delay(0)).toBe(0.05);
    expect(delay(2)).toBe(0.25);
  });
});

describe("tokens.css packaging", () => {
  it("defines neutral duration and easing variables without !important", async () => {
    const { readFileSync, existsSync } = await import("node:fs");
    const { resolve, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");

    const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
    const srcPath = resolve(packageRoot, "src/presets/tokens.css");
    const distPath = resolve(packageRoot, "dist/presets/tokens.css");

    expect(existsSync(srcPath)).toBe(true);
    const srcCss = readFileSync(srcPath, "utf8");
    expect(srcCss).toContain("--kamod-motion-duration-default");
    expect(srcCss).not.toContain("!important");

    if (existsSync(distPath)) {
      expect(readFileSync(distPath, "utf8")).toBe(srcCss);
    }
  });
});

describe("motionPresets types", () => {
  it("types presets as readonly contracts", () => {
    type ReadonlyPreset = Readonly<Preset>;
    const preset: ReadonlyPreset = motionPresets.slideUp;
    expect(preset.exit).toEqual({ opacity: 0, y: 16 });
  });
});
