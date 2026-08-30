/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from "@testing-library/preact";
import { useRef } from "preact/hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { animateSvg } from "../animate-svg.js";
import { useAnimateSvg } from "../use-animate-svg.js";
import { createNoopControls } from "../../mini/noop-controls.js";

const animateMock = vi.fn();

vi.mock("motion/mini", () => ({
  animate: (...args: unknown[]) => animateMock(...args),
}));

function createControls(options?: { immediate?: boolean }) {
  const stop = vi.fn();
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  if (options?.immediate) {
    resolveFinished();
  }

  const controls = { stop, cancel: vi.fn(), complete: vi.fn(), finished, resolveFinished };
  animateMock.mockReturnValueOnce(controls);
  return controls;
}

describe("animateSvg", () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(() => createNoopControls());
  });

  afterEach(() => {
    animateMock.mockReset();
  });

  it("animates an SVGElement ref target", async () => {
    createControls({ immediate: true });
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    document.body.appendChild(circle);

    animateSvg(circle, { opacity: 1, r: 8 });

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalledWith(circle, { opacity: 1, r: 8 }, expect.any(Object));
    });

    circle.remove();
  });

  it("supports pathLength when provided on paths", async () => {
    createControls({ immediate: true });
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,0 L10,10");
    document.body.appendChild(path);

    animateSvg(path, { pathLength: [0, 1] });

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalledWith(path, { pathLength: [0, 1] }, expect.any(Object));
    });

    path.remove();
  });
});

function SvgHost({ onReady }: { onReady: (api: ReturnType<typeof useAnimateSvg>) => void }) {
  const api = useAnimateSvg();
  const reported = useRef(false);

  if (!reported.current) {
    reported.current = true;
    onReady(api);
  }

  return (
    <svg ref={api.ref as never} data-testid="svg-host">
      <circle r="4" />
    </svg>
  );
}

describe("useAnimateSvg", () => {
  beforeEach(() => {
    animateMock.mockReset();
  });

  it("binds animation to the SVGElement ref", async () => {
    createControls({ immediate: true });
    let api: ReturnType<typeof useAnimateSvg> | null = null;

    render(<SvgHost onReady={(value) => (api = value)} />);

    await waitFor(() => {
      expect(api?.ref.current).toBeInstanceOf(SVGSVGElement);
    });

    api!.animate({ opacity: [0, 1] });

    expect(animateMock).toHaveBeenCalledWith(api!.ref.current, { opacity: [0, 1] }, {});
  });
});
