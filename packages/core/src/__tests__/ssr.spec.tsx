/**
 * @vitest-environment node
 */
import { h } from "preact";
import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("allows static import of the mini root entry in Node", async () => {
    await expect(import("../index.js")).resolves.toBeDefined();
  });

  it("renderToString does not touch matchMedia or animate", async () => {
    const { render } = await import("preact-render-to-string");
    const { useReducedMotion } = await import("../hooks/use-reduced-motion.js");
    const { useAnimate } = await import("../hooks/use-animate.js");

    const previousMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = (() => {
      throw new Error("matchMedia must not run during SSR");
    }) as typeof matchMedia;

    function SSRComponent() {
      const reduced = useReducedMotion();
      const { animate } = useAnimate();
      animate({ opacity: [0, 1] });
      return h("div", null, String(reduced));
    }

    try {
      expect(render(h(SSRComponent, null))).toBe("<div>false</div>");
    } finally {
      globalThis.matchMedia = previousMatchMedia;
    }
  });
});
