/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from "vitest";
import { fade } from "../presets/index.js";

const animateMock = vi.fn();

vi.mock("motion/mini", () => ({
  animate: (...args: unknown[]) => animateMock(...args),
}));

describe("Motion SSR markup", () => {
  it("renders initial inline styles without invoking animate", async () => {
    const { render: renderToString } = await import("preact-render-to-string");
    const { Motion } = await import("../motion/Motion.js");

    const html = renderToString(
      <Motion initial={fade.initial} animate={fade.animate} aria-label="panel">
        Panel
      </Motion>,
    );

    expect(html).toContain('aria-label="panel"');
    expect(html).toMatch(/style="opacity:\s*0;?"/);
    expect(html).toContain("Panel");
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("renders animate styles when initial is false", async () => {
    const { render: renderToString } = await import("preact-render-to-string");
    const { Motion } = await import("../motion/Motion.js");

    const html = renderToString(<Motion initial={false} animate={{ opacity: 1, y: 8 }} />);

    expect(html).toMatch(/opacity:\s*1/);
    expect(html).toContain("translateY(8px)");
    expect(animateMock).not.toHaveBeenCalled();
  });
});
