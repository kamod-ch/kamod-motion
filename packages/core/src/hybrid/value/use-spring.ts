import { useLayoutEffect, useRef } from "preact/hooks";
import { followValue, motionValue, type MotionValue, type SpringOptions } from "motion";
import { isBrowser } from "../../utils/env.js";

/**
 * Returns a derived `MotionValue` that follows `source` with a spring transition.
 * Requires the hybrid engine (`motion` full bundle).
 */
export function useSpring(
  source: MotionValue<number>,
  config?: SpringOptions,
): MotionValue<number> {
  const followerRef = useRef<MotionValue<number> | null>(null);

  if (!followerRef.current) {
    followerRef.current = isBrowser()
      ? followValue(source, { type: "spring", ...config })
      : motionValue(source.get());
  }

  useLayoutEffect(() => {
    if (!isBrowser()) {
      return;
    }

    followerRef.current?.stop();
    followerRef.current = followValue(source, { type: "spring", ...config });

    return () => {
      followerRef.current?.stop();
    };
  }, [
    source,
    config?.stiffness,
    config?.damping,
    config?.mass,
    config?.restDelta,
    config?.restSpeed,
  ]);

  return followerRef.current;
}
