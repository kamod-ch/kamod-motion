import type { KamodAnimationControls } from "../types.js";

const noop = () => {};

export interface MutableValueControls extends KamodAnimationControls {
  finish: () => void;
  abort: () => void;
}

export function createMutableValueControls(): MutableValueControls {
  let resolveFinished: () => void = noop;
  let rejectFinished: (error?: Error) => void = noop;

  const finished = new Promise<void>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = () => reject(new Error("animation stopped"));
  });

  const controls: MutableValueControls = {
    time: 0,
    speed: 1,
    startTime: null,
    state: "running",
    duration: 0,
    iterationDuration: 0,
    play: noop,
    pause: noop,
    stop: noop,
    cancel: noop,
    complete: noop,
    attachTimeline: () => noop,
    finished,
    finish: () => {
      controls.state = "finished";
      resolveFinished();
    },
    abort: () => {
      controls.state = "finished";
      rejectFinished();
    },
    // oxlint-disable-next-line unicorn/no-thenable
    then: (onResolve, onReject) => finished.then(onResolve, onReject),
  };

  return controls;
}

export function createResolvedValueControls(): KamodAnimationControls {
  const controls = createMutableValueControls();
  controls.finish();
  return controls;
}
