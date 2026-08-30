import { describe, expect, it } from "vitest";
import { animate, animateSequence } from "motion/mini";

describe("motion@13.1.1 / motion/mini exports", () => {
  it("exposes animate (WAAPI animateMini alias)", () => {
    expect(typeof animate).toBe("function");
  });

  it("exposes animateSequence (WAAPI timeline builder)", () => {
    expect(typeof animateSequence).toBe("function");
  });

  it("does not expose hybrid-only helpers on the mini entry", async () => {
    const mini = await import("motion/mini");
    expect(mini).not.toHaveProperty("motionValue");
    expect(mini).not.toHaveProperty("stagger");
    expect(mini).not.toHaveProperty("scroll");
    expect(mini).not.toHaveProperty("inView");
  });
});

describe("motion/mini animate controls (null element)", () => {
  it("returns GroupAnimationWithThen-compatible controls for null elements", async () => {
    const controls = animate(null, { opacity: [0, 1] });

    expect("animations" in controls && controls.animations).toEqual([]);
    expect(typeof controls.stop).toBe("function");
    expect(typeof controls.cancel).toBe("function");
    expect(typeof controls.complete).toBe("function");
    expect(typeof controls.then).toBe("function");
    await expect(controls.finished).resolves.toBeDefined();
  });
});
