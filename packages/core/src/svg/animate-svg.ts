import { runMiniAnimation, finishAnimation } from "../mini/animate-element.js";
import { createNoopControls } from "../mini/noop-controls.js";
import type { KamodAnimationControls, KamodTransition } from "../types.js";
import { isBrowser } from "../utils/env.js";
import { resolveSvgTarget } from "./resolve-target.js";
import type { SvgAnimationTarget, SvgKeyframes } from "./types.js";

export type AnimateSvgOptions = KamodTransition & {
  reducedMotion?: boolean;
};

/**
 * Animate existing SVG attributes or styles via the mini engine.
 * Does not query the DOM until invoked on the client.
 */
export function animateSvg(
  target: SvgAnimationTarget | string,
  keyframes: SvgKeyframes,
  options?: AnimateSvgOptions,
): KamodAnimationControls {
  if (!isBrowser()) {
    return createNoopControls();
  }

  const resolved =
    typeof target === "string"
      ? (() => {
          const node = document.querySelector(target);
          return node instanceof SVGElement ? node : null;
        })()
      : resolveSvgTarget(target);
  if (!resolved) {
    return createNoopControls();
  }

  const elements = Array.isArray(resolved) ? resolved : [resolved];
  if (elements.length === 0) {
    return createNoopControls();
  }

  const { reducedMotion = false, ...transition } = options ?? {};
  const activeControls: KamodAnimationControls[] = [];

  for (const element of elements) {
    activeControls.push(
      runMiniAnimation(element, keyframes, transition, {
        reducedMotion,
      }),
    );
  }

  if (activeControls.length === 1) {
    return activeControls[0]!;
  }

  const finished = Promise.all(activeControls.map((controls) => finishAnimation(controls))).then(
    () => undefined,
  );

  const stopAll = () => {
    for (const controls of activeControls) {
      controls.stop();
    }
  };

  return {
    time: 0,
    speed: 1,
    startTime: null,
    state: "running",
    duration: 0,
    iterationDuration: 0,
    play: () => activeControls.forEach((controls) => controls.play()),
    pause: () => activeControls.forEach((controls) => controls.pause()),
    stop: stopAll,
    cancel: () => activeControls.forEach((controls) => controls.cancel()),
    complete: () => activeControls.forEach((controls) => controls.complete()),
    attachTimeline: (timeline) => {
      const cleanups = activeControls.map((controls) => controls.attachTimeline(timeline));
      return () => cleanups.forEach((cleanup) => cleanup());
    },
    finished,
    // oxlint-disable-next-line unicorn/no-thenable
    then: (onResolve, onReject) => finished.then(onResolve, onReject),
  };
}

/** @deprecated Use `animateSvg`. Kept for ARCHITECTURE.md naming. */
export const animateSVG = animateSvg;
