import { animate as animateMini } from "motion/mini";
import { createNoopControls } from "./noop-controls.js";
import type { KamodAnimationControls, KamodKeyframes, KamodTransition } from "../types.js";
import { isBrowser } from "../utils/env.js";

export interface RunMiniAnimationOptions {
  reducedMotion?: boolean;
}

export function runMiniAnimation(
  element: Element,
  keyframes: KamodKeyframes,
  transition?: KamodTransition,
  options?: RunMiniAnimationOptions,
): KamodAnimationControls {
  if (!isBrowser()) {
    return createNoopControls();
  }

  const reduced = options?.reducedMotion ?? false;
  const resolvedTransition: KamodTransition = reduced
    ? { ...transition, duration: 0, delay: 0, skipAnimations: true }
    : (transition ?? {});

  try {
    const controls = animateMini(element, keyframes, resolvedTransition);
    return controls ?? createNoopControls();
  } catch {
    return createNoopControls();
  }
}

export async function finishAnimation(
  controls: KamodAnimationControls | null | undefined,
): Promise<void> {
  if (!controls) {
    return;
  }

  try {
    await controls.finished;
  } catch {
    controls.stop();
  }
}
