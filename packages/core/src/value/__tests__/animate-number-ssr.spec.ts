/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

describe("animateNumber without browser APIs", () => {
  it("returns resolved controls and applies the target value", async () => {
    const { animateNumber } = await import("../animate-number.js");
    const updates: number[] = [];

    const controls = animateNumber({
      from: 1,
      to: 9,
      onUpdate: (value) => updates.push(value),
    });

    expect(updates).toEqual([9]);
    await expect(controls.finished).resolves.toBeUndefined();
  });
});
