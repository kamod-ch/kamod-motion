import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Motion } from "../../motion/Motion.js";
import { fade } from "../../presets/index.js";
import { createNoopControls } from "../../mini/noop-controls.js";
import { PresenceList } from "../PresenceList.js";

const animateMock = vi.fn();

vi.mock("motion/mini", () => ({
  animate: (...args: unknown[]) => animateMock(...args),
}));

interface Handle {
  resolve: () => void;
  stop: ReturnType<typeof vi.fn>;
}

function createHandle(): Handle {
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });
  const handle: Handle = {
    resolve: resolveFinished,
    stop: vi.fn(),
  };
  animateMock.mockReturnValueOnce({
    ...handle,
    cancel: vi.fn(),
    complete: vi.fn(),
    finished,
    // oxlint-disable-next-line unicorn/no-thenable
    then: (onResolve: () => void) => finished.then(onResolve),
  });
  return handle;
}

function Row({ label }: { label: string }) {
  return (
    <Motion initial={fade.initial} animate={fade.animate} exit={fade.exit}>
      {label}
    </Motion>
  );
}

describe("PresenceList", () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(() => createNoopControls());
  });

  afterEach(() => {
    animateMock.mockReset();
  });

  it("keeps a removed row mounted until its exit finishes in sync mode", async () => {
    createHandle();
    createHandle();
    const exit = createHandle();

    const { rerender, queryByText } = render(
      <PresenceList>
        <Row key="a" label="Alpha" />
        <Row key="b" label="Beta" />
      </PresenceList>,
    );

    expect(queryByText("Alpha")).toBeTruthy();
    expect(queryByText("Beta")).toBeTruthy();

    rerender(
      <PresenceList>
        <Row key="b" label="Beta" />
      </PresenceList>,
    );

    expect(queryByText("Alpha")).toBeTruthy();
    exit.resolve();

    await waitFor(() => {
      expect(queryByText("Alpha")).toBeNull();
    });
    expect(queryByText("Beta")).toBeTruthy();
  });

  it("holds the incoming row in wait mode until the exit finishes", async () => {
    createHandle();
    const exit = createHandle();
    createHandle();
    const onExitComplete = vi.fn();

    const { rerender, queryByText } = render(
      <PresenceList mode="wait" onExitComplete={onExitComplete}>
        <Row key="a" label="Alpha" />
      </PresenceList>,
    );

    rerender(
      <PresenceList mode="wait" onExitComplete={onExitComplete}>
        <Row key="b" label="Beta" />
      </PresenceList>,
    );

    expect(queryByText("Alpha")).toBeTruthy();
    expect(queryByText("Beta")).toBeNull();

    exit.resolve();

    await waitFor(() => {
      expect(queryByText("Alpha")).toBeNull();
      expect(queryByText("Beta")).toBeTruthy();
    });
    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it("shows a new row immediately while another row is still exiting in sync mode", () => {
    createHandle();
    createHandle();

    const { rerender, queryByText } = render(
      <PresenceList mode="sync">
        <Row key="a" label="Alpha" />
      </PresenceList>,
    );

    rerender(
      <PresenceList mode="sync">
        <Row key="a" label="Alpha" />
        <Row key="b" label="Beta" />
      </PresenceList>,
    );

    expect(queryByText("Alpha")).toBeTruthy();
    expect(queryByText("Beta")).toBeTruthy();
  });
});
