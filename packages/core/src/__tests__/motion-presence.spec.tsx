import { render, waitFor } from "@testing-library/preact";
import { useRef } from "preact/hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Motion } from "../motion/Motion.js";
import { Presence } from "../presence/Presence.js";
import { fade, slideUp } from "../presets/index.js";
import { createNoopControls } from "../mini/noop-controls.js";
import { withMatchMediaMock } from "../test/match-media-mock.js";

const animateMock = vi.fn();

vi.mock("motion/mini", () => ({
  animate: (...args: unknown[]) => animateMock(...args),
}));

function createControls(options?: { immediate?: boolean }) {
  const stop = vi.fn();

  let resolveFinished: () => void = () => {};
  let rejectFinished: (error?: Error) => void = () => {};
  const finished = new Promise<void>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = (error = new Error("animation cancelled")) => reject(error);
  });

  if (options?.immediate) {
    resolveFinished();
  }

  const controls = {
    stop,
    cancel: vi.fn(),
    complete: vi.fn(),
    finished,
    resolveFinished,
    rejectFinished,
  };

  animateMock.mockReturnValueOnce(controls);
  return controls;
}

describe("Motion", () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(() => createNoopControls());
  });

  afterEach(() => {
    animateMock.mockReset();
  });

  it("forwards ref, class, and aria attributes", async () => {
    const ref = { current: null as HTMLDivElement | null };
    createControls({ immediate: true });

    render(
      <Motion
        ref={ref}
        class="panel"
        aria-label="dialog panel"
        role="region"
        initial={fade.initial}
        animate={fade.animate}
      >
        Content
      </Motion>,
    );

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    expect(ref.current?.className).toBe("panel");
    expect(ref.current?.getAttribute("aria-label")).toBe("dialog panel");
    expect(ref.current?.getAttribute("role")).toBe("region");
  });

  it("supports a limited polymorphic as prop", () => {
    createControls({ immediate: true });

    render(
      <Motion as="button" type="button" animate={fade.animate}>
        Action
      </Motion>,
    );

    expect(document.querySelector("button[type='button']")).toBeTruthy();
  });

  it("applies reduced-motion fallbacks with skipAnimations", async () => {
    withMatchMediaMock(true, () => {
      render(
        <Motion
          initial={slideUp.initial}
          animate={slideUp.animate}
          transition={slideUp.transition}
        />,
      );
    });

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalled();
    });

    const [, , options] = animateMock.mock.calls.at(-1) ?? [];
    expect(options).toMatchObject({ skipAnimations: true, duration: 0 });
  });
});

describe("Presence", () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(() => createNoopControls());
  });

  it("keeps content mounted until exit finishes", async () => {
    createControls({ immediate: true });
    const exitControls = createControls();
    const onExitComplete = vi.fn();

    const { rerender, queryByText } = render(
      <Presence show initial={false} onExitComplete={onExitComplete}>
        <Motion initial={fade.initial} animate={fade.animate} exit={fade.exit}>
          Visible
        </Motion>
      </Presence>,
    );

    expect(queryByText("Visible")).toBeTruthy();
    rerender(
      <Presence show={false} initial={false} onExitComplete={onExitComplete}>
        <Motion initial={fade.initial} animate={fade.animate} exit={fade.exit}>
          Visible
        </Motion>
      </Presence>,
    );

    expect(queryByText("Visible")).toBeTruthy();
    exitControls.resolveFinished();

    await waitFor(() => {
      expect(queryByText("Visible")).toBeNull();
      expect(onExitComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("interrupts exit when show flips true again", async () => {
    createControls({ immediate: true });
    createControls();
    createControls({ immediate: true });

    const { rerender, queryByText } = render(
      <Presence show initial={false}>
        <Motion initial={fade.initial} animate={fade.animate} exit={fade.exit}>
          Panel
        </Motion>
      </Presence>,
    );

    rerender(
      <Presence show={false} initial={false}>
        <Motion initial={fade.initial} animate={fade.animate} exit={fade.exit}>
          Panel
        </Motion>
      </Presence>,
    );

    expect(queryByText("Panel")).toBeTruthy();

    rerender(
      <Presence show initial={false}>
        <Motion initial={fade.initial} animate={fade.animate} exit={fade.exit}>
          Panel
        </Motion>
      </Presence>,
    );

    await waitFor(() => {
      expect(queryByText("Panel")).toBeTruthy();
    });
  });

  it("handles rapid show toggles without duplicate onExitComplete calls", async () => {
    const onExitComplete = vi.fn();
    for (let index = 0; index < 6; index += 1) {
      createControls({ immediate: true });
    }

    const { rerender } = render(
      <Presence show initial={false} onExitComplete={onExitComplete}>
        <Motion animate={fade.animate} exit={fade.exit}>
          Item
        </Motion>
      </Presence>,
    );

    rerender(
      <Presence show={false} initial={false} onExitComplete={onExitComplete}>
        <Motion animate={fade.animate} exit={fade.exit}>
          Item
        </Motion>
      </Presence>,
    );
    rerender(
      <Presence show initial={false} onExitComplete={onExitComplete}>
        <Motion animate={fade.animate} exit={fade.exit}>
          Item
        </Motion>
      </Presence>,
    );
    rerender(
      <Presence show={false} initial={false} onExitComplete={onExitComplete}>
        <Motion animate={fade.animate} exit={fade.exit}>
          Item
        </Motion>
      </Presence>,
    );

    await waitFor(() => {
      expect(onExitComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("recovers from animation rejection without leaving stale nodes", async () => {
    createControls({ immediate: true });
    const exitControls = createControls();
    const onExitComplete = vi.fn();

    const { rerender, queryByText } = render(
      <Presence show initial={false} onExitComplete={onExitComplete}>
        <Motion animate={fade.animate} exit={fade.exit}>
          Stale
        </Motion>
      </Presence>,
    );

    rerender(
      <Presence show={false} initial={false} onExitComplete={onExitComplete}>
        <Motion animate={fade.animate} exit={fade.exit}>
          Stale
        </Motion>
      </Presence>,
    );

    exitControls.rejectFinished();

    await waitFor(() => {
      expect(queryByText("Stale")).toBeNull();
      expect(onExitComplete).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Motion cleanup", () => {
  beforeEach(() => {
    animateMock.mockReset();
  });

  it("stops active animations on unmount", async () => {
    const controls = createControls();

    const { unmount } = render(<Motion animate={fade.animate}>Leave</Motion>);

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalled();
    });

    unmount();
    expect(controls.stop).toHaveBeenCalled();
  });
});

function RefProbe({ onRef }: { onRef: (node: HTMLDivElement | null) => void }) {
  useRef(false);

  return (
    <Motion
      ref={(node) => onRef(node as HTMLDivElement | null)}
      animate={fade.animate}
      data-testid="ref-target"
    />
  );
}

describe("Motion ref forwarding", () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(() => createNoopControls());
  });

  it("exposes the underlying element via ref callback", async () => {
    createControls({ immediate: true });
    let latest: HTMLDivElement | null = null;

    render(<RefProbe onRef={(node) => (latest = node)} />);

    await waitFor(() => {
      expect(latest).toBeInstanceOf(HTMLDivElement);
    });
  });
});
