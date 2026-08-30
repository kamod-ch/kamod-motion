import type { KamodAnimationControls } from "../types.js";
import { isBrowser } from "../utils/env.js";
import { resolveEase } from "./easing.js";
import {
  createMutableValueControls,
  createResolvedValueControls,
} from "./create-value-controls.js";
import type { AnimateNumberOptions } from "./types.js";

const DEFAULT_DURATION = 0.3;
const DEFAULT_SPRING = { stiffness: 180, damping: 24, mass: 1 };

function springStep(
  current: number,
  target: number,
  velocity: number,
  stiffness: number,
  damping: number,
  mass: number,
  delta: number,
) {
  const springForce = -stiffness * (current - target);
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;
  const nextVelocity = velocity + acceleration * delta;
  const nextValue = current + nextVelocity * delta;

  return { value: nextValue, velocity: nextVelocity };
}

function isSpringSettled(current: number, target: number, velocity: number) {
  return Math.abs(target - current) < 0.001 && Math.abs(velocity) < 0.001;
}

/**
 * Imperative numeric animation for counters, ticks, and data labels.
 * Uses a lightweight rAF driver — no hybrid Motion engine required.
 */
export function animateNumber(options: AnimateNumberOptions): KamodAnimationControls {
  const {
    from = 0,
    to,
    duration = DEFAULT_DURATION,
    type = "tween",
    ease,
    spring = DEFAULT_SPRING,
    delay = 0,
    onUpdate,
    onComplete,
    reducedMotion = false,
  } = options;

  if (!isBrowser() || reducedMotion) {
    onUpdate(to);
    onComplete?.();
    return createResolvedValueControls();
  }

  const controls = createMutableValueControls();
  let frameId = 0;
  let delayTimeout: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;

  const cleanup = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (delayTimeout) {
      clearTimeout(delayTimeout);
      delayTimeout = undefined;
    }
  };

  const finish = () => {
    if (cancelled) {
      return;
    }

    cleanup();
    onUpdate(to);
    onComplete?.();
    controls.finish();
  };

  const stop = () => {
    if (cancelled) {
      return;
    }

    cancelled = true;
    cleanup();
    controls.abort();
  };

  controls.stop = stop;
  controls.cancel = stop;

  const runTween = (startTime: number) => {
    const easing = resolveEase(ease);
    const durationMs = Math.max(duration, 0) * 1000;

    const tick = (now: number) => {
      if (cancelled) {
        return;
      }

      const elapsed = now - startTime;
      const progress = durationMs === 0 ? 1 : Math.min(elapsed / durationMs, 1);
      const eased = easing(progress);
      onUpdate(from + (to - from) * eased);

      if (progress >= 1) {
        finish();
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    onUpdate(from);
    frameId = requestAnimationFrame(tick);
  };

  const runSpring = () => {
    const stiffness = spring.stiffness ?? DEFAULT_SPRING.stiffness!;
    const damping = spring.damping ?? DEFAULT_SPRING.damping!;
    const mass = spring.mass ?? DEFAULT_SPRING.mass!;
    let current = from;
    let velocity = 0;
    let previousTime: number | undefined;

    const tick = (now: number) => {
      if (cancelled) {
        return;
      }

      const delta = previousTime === undefined ? 0 : Math.min((now - previousTime) / 1000, 0.064);
      previousTime = now;

      if (delta > 0) {
        const step = springStep(current, to, velocity, stiffness, damping, mass, delta);
        current = step.value;
        velocity = step.velocity;
        onUpdate(current);
      } else {
        onUpdate(from);
      }

      if (isSpringSettled(current, to, velocity)) {
        finish();
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (type === "spring") {
      runSpring();
      return;
    }

    runTween(performance.now());
  };

  if (delay > 0) {
    delayTimeout = setTimeout(start, delay * 1000);
  } else {
    start();
  }

  return controls;
}

/** Alias matching common Motion naming. */
export const animateValueNumber = animateNumber;
