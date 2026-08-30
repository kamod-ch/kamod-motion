import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { useReducedMotion } from "../hooks/use-reduced-motion.js";
import type { ReducedMotionPolicy } from "../types.js";
import { animateNumber } from "./animate-number.js";
import type { AnimateNumberOptions, SpringConfig } from "./types.js";

export interface UseAnimateNumberOptions {
  from?: number;
  duration?: number;
  type?: AnimateNumberOptions["type"];
  ease?: AnimateNumberOptions["ease"];
  spring?: SpringConfig;
  delay?: number;
  reducedMotion?: ReducedMotionPolicy;
}

/**
 * Preact hook for animated numeric display (counters, KPI tiles, tick labels).
 * Stops cleanly on unmount without scheduling further state updates.
 */
export function useAnimateNumber(target: number, options?: UseAnimateNumberOptions): number {
  const prefersReduced = useReducedMotion({ policy: options?.reducedMotion });
  const mounted = useRef(true);
  const currentRef = useRef(options?.from ?? target);
  const [displayValue, setDisplayValue] = useState(currentRef.current);

  useLayoutEffect(() => {
    mounted.current = true;

    const controls = animateNumber({
      from: currentRef.current,
      to: target,
      duration: options?.duration,
      type: options?.type,
      ease: options?.ease,
      spring: options?.spring,
      delay: options?.delay,
      reducedMotion: prefersReduced,
      onUpdate: (value) => {
        currentRef.current = value;
        if (mounted.current) {
          setDisplayValue(value);
        }
      },
      onComplete: () => {
        currentRef.current = target;
      },
    });

    return () => {
      mounted.current = false;
      controls.stop();
    };
  }, [
    target,
    prefersReduced,
    options?.duration,
    options?.type,
    options?.delay,
    options?.from,
    options?.ease,
    options?.spring,
  ]);

  return displayValue;
}
