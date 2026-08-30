import type { KamodAnimationControls } from "../types.js";

const noop = () => {};

export function createNoopControls(): KamodAnimationControls {
  const finished = Promise.resolve(undefined);

  const controls = {
    time: 0,
    speed: 1,
    startTime: null,
    state: "finished" as const,
    duration: 0,
    iterationDuration: 0,
    play: noop,
    pause: noop,
    stop: noop,
    cancel: noop,
    complete: noop,
    attachTimeline: () => noop,
    finished,
  };

  return Object.assign(controls, {
    // Motion's GroupAnimationWithThen exposes a thenable surface by design.
    // oxlint-disable-next-line unicorn/no-thenable
    then: (onResolve: VoidFunction, onReject?: VoidFunction) => finished.then(onResolve, onReject),
  }) as KamodAnimationControls;
}
