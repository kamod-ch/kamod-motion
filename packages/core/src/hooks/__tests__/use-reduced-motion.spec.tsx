import { render, waitFor } from "@testing-library/preact";
import { useEffect } from "preact/hooks";
import { describe, expect, it } from "vitest";
import { prefersReducedMotion, useReducedMotion } from "../use-reduced-motion.js";
import { withMatchMediaMock } from "../../test/match-media-mock.js";

function ReducedMotionProbe({
  policy,
  testId,
  onValue,
}: {
  policy?: "user" | "always" | "never";
  testId: string;
  onValue: (value: boolean) => void;
}) {
  const reduced = useReducedMotion({ policy });

  useEffect(() => {
    onValue(reduced);
  }, [reduced, onValue]);

  return <span data-testid={testId}>{String(reduced)}</span>;
}

describe("useReducedMotion", () => {
  it("starts false for the user policy before matchMedia subscription resolves", () => {
    withMatchMediaMock(true, () => {
      const values: boolean[] = [];
      render(<ReducedMotionProbe testId="reduced" onValue={(value) => values.push(value)} />);
      expect(values[0]).toBe(false);
    });
  });

  it("reflects matchMedia after mount for the user policy", async () => {
    await withMatchMediaMock(true, async () => {
      const { getByTestId } = render(
        <ReducedMotionProbe testId="reduced" policy="user" onValue={() => {}} />,
      );
      await waitFor(() => {
        expect(getByTestId("reduced").textContent).toBe("true");
      });
    });
  });

  it("reacts to matchMedia changes", async () => {
    await withMatchMediaMock(false, async (controller) => {
      const { getByTestId } = render(
        <ReducedMotionProbe testId="reduced" policy="user" onValue={() => {}} />,
      );
      await waitFor(() => {
        expect(getByTestId("reduced").textContent).toBe("false");
      });

      controller.setMatches(true);
      await waitFor(() => {
        expect(getByTestId("reduced").textContent).toBe("true");
      });
    });
  });

  it("cleans up matchMedia listeners on unmount", async () => {
    await withMatchMediaMock(false, async (controller) => {
      const { unmount } = render(
        <ReducedMotionProbe testId="reduced" policy="user" onValue={() => {}} />,
      );
      await waitFor(() => {
        expect(controller.listenerCount()).toBeGreaterThan(0);
      });

      unmount();
      expect(controller.listenerCount()).toBe(0);
    });
  });

  it("supports legacy addListener/removeListener APIs", async () => {
    const legacyListeners = new Set<(this: MediaQueryList, event: MediaQueryListEvent) => void>();
    let matches = false;
    const previous = globalThis.matchMedia;

    globalThis.matchMedia = ((query: string) => {
      if (query !== "(prefers-reduced-motion: reduce)") {
        throw new Error(`Unexpected media query: ${query}`);
      }

      const mediaQuery = {
        get matches() {
          return matches;
        },
        media: query,
        addListener(listener: (this: MediaQueryList, event: MediaQueryListEvent) => void) {
          legacyListeners.add(listener);
        },
        removeListener(listener: (this: MediaQueryList, event: MediaQueryListEvent) => void) {
          legacyListeners.delete(listener);
        },
      } as MediaQueryList;

      return mediaQuery;
    }) as typeof matchMedia;

    try {
      const { getByTestId } = render(
        <ReducedMotionProbe testId="reduced" policy="user" onValue={() => {}} />,
      );
      await waitFor(() => {
        expect(getByTestId("reduced").textContent).toBe("false");
      });

      matches = true;
      const event = { matches: true } as MediaQueryListEvent;
      legacyListeners.forEach((listener) => {
        listener.call(
          globalThis.matchMedia("(prefers-reduced-motion: reduce)") as MediaQueryList,
          event,
        );
      });

      await waitFor(() => {
        expect(getByTestId("reduced").textContent).toBe("true");
      });
    } finally {
      globalThis.matchMedia = previous;
    }
  });

  it("returns false when matchMedia is unavailable", async () => {
    const previous = globalThis.matchMedia;
    globalThis.matchMedia = undefined as unknown as typeof matchMedia;

    try {
      const { getByTestId } = render(
        <ReducedMotionProbe testId="reduced" policy="user" onValue={() => {}} />,
      );
      await waitFor(() => {
        expect(getByTestId("reduced").textContent).toBe("false");
      });
      expect(prefersReducedMotion()).toBe(false);
    } finally {
      globalThis.matchMedia = previous;
    }
  });

  it("honours always and never policies", () => {
    const { getByTestId } = render(
      <>
        <ReducedMotionProbe testId="always" policy="always" onValue={() => {}} />
        <ReducedMotionProbe testId="never" policy="never" onValue={() => {}} />
      </>,
    );

    expect(getByTestId("always").textContent).toBe("true");
    expect(getByTestId("never").textContent).toBe("false");
  });
});
