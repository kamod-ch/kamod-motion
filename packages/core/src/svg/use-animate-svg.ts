import { useCallback, useLayoutEffect, useRef } from "preact/hooks";
import { useReducedMotion } from "../hooks/use-reduced-motion.js";
import { finishAnimation, runMiniAnimation } from "../mini/animate-element.js";
import { createNoopControls } from "../mini/noop-controls.js";
import type { KamodAnimationControls, KamodTransition, ReducedMotionPolicy } from "../types.js";
import { isBrowser } from "../utils/env.js";
import type { SvgKeyframes } from "./types.js";

export interface UseAnimateSvgOptions {
  reducedMotion?: ReducedMotionPolicy;
  onConflict?: "stop" | "none";
}

export interface UseAnimateSvgResult<T extends SVGElement = SVGElement> {
  ref: { readonly current: T | null };
  animate: (keyframes: SvgKeyframes, options?: KamodTransition) => KamodAnimationControls;
}

/** Scoped mini-engine SVG animation bound to a ref (charts, icons, illustrations). */
export function useAnimateSvg<T extends SVGElement = SVGElement>(
  options?: UseAnimateSvgOptions,
): UseAnimateSvgResult<T> {
  const onConflict = options?.onConflict ?? "stop";
  const prefersReduced = useReducedMotion({ policy: options?.reducedMotion });
  const ref = useRef<T | null>(null);
  const activeControls = useRef<KamodAnimationControls | null>(null);

  const animate = useCallback(
    (keyframes: SvgKeyframes, transition?: KamodTransition): KamodAnimationControls => {
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

      void finishAnimation(controls).finally(() => {
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
