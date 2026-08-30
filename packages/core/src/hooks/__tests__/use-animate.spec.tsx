import { render, waitFor } from "@testing-library/preact";
import { useEffect } from "preact/hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAnimate } from "../use-animate.js";

const animateMock = vi.fn();

vi.mock("motion/mini", () => ({
  animate: (...args: unknown[]) => animateMock(...args),
}));

function createControls() {
  const stop = vi.fn();
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  const controls = {
    stop,
    cancel: vi.fn(),
    complete: vi.fn(),
    finished,
    resolveFinished,
    // oxlint-disable-next-line unicorn/no-thenable
    then: (onResolve: () => void) => finished.then(onResolve),
  };

  animateMock.mockReturnValueOnce(controls);
  return controls;
}

function AnimateHost({
  tag = "div",
  onReady,
}: {
  tag?: "div" | "svg";
  onReady: (api: ReturnType<typeof useAnimate>) => void;
}) {
  const api = useAnimate();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  if (tag === "svg") {
    return (
      <svg ref={api.ref as { current: SVGSVGElement | null }} data-testid="scope">
        <circle data-testid="target" />
      </svg>
    );
  }

  return (
    <div>
      <div ref={api.ref as { current: HTMLDivElement | null }} data-testid="scope" />
      <div data-testid="outside" />
    </div>
  );
}

function UnscopedHost() {
  const { animate } = useAnimate();
  useEffect(() => {
    animate({ opacity: [0, 1] });
  }, [animate]);
  return null;
}

describe("useAnimate", () => {
  beforeEach(() => {
    animateMock.mockReset();
  });

  afterEach(() => {
    animateMock.mockReset();
  });

  it("returns no-op controls when the ref is unset", () => {
    render(<UnscopedHost />);
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("animates only the scoped HTMLElement ref", async () => {
    createControls();

    await new Promise<void>((resolve) => {
      render(
        <AnimateHost
          onReady={(api) => {
            api.animate({ opacity: [0, 1] });
            resolve();
          }}
        />,
      );
    });

    expect(animateMock).toHaveBeenCalledTimes(1);
    const [element, keyframes] = animateMock.mock.calls[0] ?? [];
    expect(element).toBe(document.querySelector('[data-testid="scope"]'));
    expect(element).not.toBe(document.querySelector('[data-testid="outside"]'));
    expect(keyframes).toEqual({ opacity: [0, 1] });
  });

  it("animates scoped SVGElement refs", async () => {
    createControls();

    await new Promise<void>((resolve) => {
      render(
        <AnimateHost
          tag="svg"
          onReady={(api) => {
            api.animate({ opacity: [0, 1] });
            resolve();
          }}
        />,
      );
    });

    const [element] = animateMock.mock.calls[0] ?? [];
    expect(element).toBeInstanceOf(window.SVGSVGElement);
  });

  it("stops the previous animation by default on rapid changes", async () => {
    const first = createControls();
    const second = createControls();

    await new Promise<void>((resolve) => {
      render(
        <AnimateHost
          onReady={(api) => {
            api.animate({ opacity: [0, 1] });
            api.animate({ x: [0, 100] });
            resolve();
          }}
        />,
      );
    });

    expect(first.stop).toHaveBeenCalledTimes(1);
    expect(second.stop).not.toHaveBeenCalled();
    expect(animateMock).toHaveBeenCalledTimes(2);
  });

  it("cleans up active animations on unmount", async () => {
    const controls = createControls();

    const { unmount } = render(<AnimateHost onReady={(api) => api.animate({ opacity: [0, 1] })} />);

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalled();
    });

    unmount();
    expect(controls.stop).toHaveBeenCalledTimes(1);
  });
});
