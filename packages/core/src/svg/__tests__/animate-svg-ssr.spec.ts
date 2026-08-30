/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

describe("animateSvg without browser APIs", () => {
  it("does not touch document before mount", async () => {
    const { animateSvg } = await import("../animate-svg.js");
    const controls = animateSvg("#missing", { opacity: 0 });
    await expect(controls.finished).resolves.toBeUndefined();
  });
});
