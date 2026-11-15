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
  const generation = useRef(0);
  const currentRef = useRef(options?.from ?? target);
  const velocityRef = useRef(0);
  const [displayValue, setDisplayValue] = useState(currentRef.current);
  const spring = options?.spring;
  const ease = options?.ease;

  useLayoutEffect(() => {
    const current = ++generation.current;

    const controls = animateNumber({
      from: currentRef.current,
      to: target,
      duration: options?.duration,
      type: options?.type,
      ease,
      spring,
      velocity: velocityRef.current,
      delay: options?.delay,
      reducedMotion: prefersReduced,
      onUpdate: (value, velocity = 0) => {
        currentRef.current = value;
        velocityRef.current = velocity;
        if (generation.current === current) {
          setDisplayValue(value);
        }
      },
      onComplete: () => {
        currentRef.current = target;
        velocityRef.current = 0;
      },
    });

    return () => {
      generation.current += 1;
      controls.stop();
    };
  }, [
    target,
    prefersReduced,
    options?.duration,
    options?.type,
    options?.delay,
    options?.from,
    ease,
    spring?.stiffness,
    spring?.damping,
    spring?.mass,
    spring?.restDelta,
    spring?.restSpeed,
  ]);

  return displayValue;
}
