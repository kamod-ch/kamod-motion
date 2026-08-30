import { describe, expect, it } from "vitest";
import { animate, animateMini, animateValue, inView, motionValue, scroll, stagger } from "motion";

describe("motion@13.1.1 / motion (dom) exports", () => {
  it("exposes the hybrid animate overload surface", () => {
    expect(typeof animate).toBe("function");
    expect(typeof animateMini).toBe("function");
  });

  it("exposes MotionValue and stagger utilities", () => {
    expect(typeof motionValue).toBe("function");
    expect(typeof animateValue).toBe("function");
    expect(typeof stagger).toBe("function");
  });

  it("exposes viewport and scroll helpers", () => {
    expect(typeof scroll).toBe("function");
    expect(typeof inView).toBe("function");
  });
});

describe("motion import in Node (SSR smoke)", () => {
  it("allows static import without throwing", async () => {
    await expect(import("motion")).resolves.toBeDefined();
    await expect(import("motion/mini")).resolves.toBeDefined();
  });
});
