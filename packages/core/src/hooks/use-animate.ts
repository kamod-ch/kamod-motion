import { useCallback, useLayoutEffect, useRef } from "preact/hooks";
import { useReducedMotion } from "./use-reduced-motion.js";
import { runMiniAnimation } from "../mini/animate-element.js";
import { createNoopControls } from "../mini/noop-controls.js";
import type {
  KamodAnimationControls,
  KamodKeyframes,
  KamodTransition,
  ReducedMotionPolicy,
} from "../types.js";
import { isBrowser } from "../utils/env.js";

export interface UseAnimateOptions {
  /** @default "stop" */
  onConflict?: "stop" | "none";
  reducedMotion?: ReducedMotionPolicy;
}

export interface UseAnimateResult<T extends HTMLElement | SVGElement = HTMLElement> {
  ref: { readonly current: T | null };
  animate: (keyframes: KamodKeyframes, options?: KamodTransition) => KamodAnimationControls;
}

export function useAnimate<T extends HTMLElement | SVGElement = HTMLElement>(
  options?: UseAnimateOptions,
): UseAnimateResult<T> {
  const onConflict = options?.onConflict ?? "stop";
  const prefersReduced = useReducedMotion({ policy: options?.reducedMotion });
  const ref = useRef<T | null>(null);
  const activeControls = useRef<KamodAnimationControls | null>(null);

  const animate = useCallback(
    (keyframes: KamodKeyframes, transition?: KamodTransition): KamodAnimationControls => {
      if (!isBrowser()) {
        return createNoopControls();
      }

      const element = ref.current;
      if (!element) {
        return createNoopControls();
      }

      if (onConflict === "stop" && activeControls.current) {
        activeControls.current.stop();
        activeControls.current = null;
      }

      const controls = runMiniAnimation(element, keyframes, transition, {
        reducedMotion: prefersReduced,
      });
      activeControls.current = controls;

      void controls.finished.finally(() => {
        if (activeControls.current === controls) {
          activeControls.current = null;
        }
      });

      return controls;
    },
    [onConflict, prefersReduced],
  );

  useLayoutEffect(() => {
    return () => {
      if (activeControls.current) {
        activeControls.current.stop();
        activeControls.current = null;
      }
    };
  }, []);

  return { ref, animate };
}
