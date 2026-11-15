import { useLayoutEffect, useRef } from "preact/hooks";
import { attachFollow, motionValue, type MotionValue, type SpringOptions } from "motion";
import { isBrowser } from "../../utils/env.js";

/**
 * Returns a stable `MotionValue` that follows `source` with a spring transition.
 * The follow subscription starts in an effect, so a discarded render does not leak one.
 */
export function useSpring(
  source: MotionValue<number>,
  config?: SpringOptions,
): MotionValue<number> {
  const valueRef = useRef<MotionValue<number> | null>(null);

  if (!valueRef.current) {
    valueRef.current = motionValue(source.get());
  }

  useLayoutEffect(() => {
    const value = valueRef.current;
    if (!value || !isBrowser()) {
      return;
    }

    return attachFollow(value, source, {
      ...config,
      type: "spring",
    });
  }, [
    source,
    config?.stiffness,
    config?.damping,
    config?.mass,
    config?.restDelta,
    config?.restSpeed,
    config?.duration,
    config?.visualDuration,
    config?.velocity,
  ]);

  return valueRef.current;
}
