import {
  animateValue as motionAnimateValue,
  motionValue,
  type MotionValue,
  type ValueAnimationTransition,
} from "motion";
import { isBrowser } from "../../utils/env.js";
import type { KamodAnimationControls } from "../../types.js";
import { createNoopControls } from "../../mini/noop-controls.js";

export interface HybridAnimateValueOptions<T extends number | string = number> extends Omit<
  ValueAnimationTransition,
  "keyframes"
> {
  from?: T;
  to: T;
  motionValue?: MotionValue<T>;
  reducedMotion?: boolean;
}

/**
 * Hybrid-engine value animation with spring/tween generators.
 * Use when `./value` tween/spring approximations are insufficient.
 */
export function animateHybridValue<T extends number | string = number>(
  options: HybridAnimateValueOptions<T>,
): KamodAnimationControls {
  const { from, to, motionValue: existingValue, reducedMotion = false, ...transition } = options;

  if (!isBrowser() || reducedMotion) {
    const target = existingValue ?? motionValue(from ?? to);
    target.set(to);
    transition.onUpdate?.(to);
    transition.onComplete?.();
    return createNoopControls();
  }

  const value = existingValue ?? motionValue((from ?? to) as T);
  const keyframes = from === undefined ? ([to] as T[]) : ([from, to] as T[]);

  return motionAnimateValue({
    motionValue: value,
    keyframes,
    ...transition,
  }) as KamodAnimationControls;
}

export { motionValue as createMotionValue, motionValue, animateValue } from "motion";
export { useMotionValue } from "./use-motion-value.js";
export { useSpring } from "./use-spring.js";
