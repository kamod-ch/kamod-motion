import { useEffect, useState } from "preact/hooks";
import { readReducedMotionPreference, subscribeReducedMotion } from "../mini/match-media.js";
import type { ReducedMotionPolicy } from "../types.js";

export interface UseReducedMotionOptions {
  /** @default "user" */
  policy?: ReducedMotionPolicy;
}

/** Synchronous reduced-motion read; false when `matchMedia` is unavailable. */
export function prefersReducedMotion(): boolean {
  return readReducedMotionPreference();
}

/**
 * Returns whether animations should be suppressed for the active policy.
 * SSR and pre-hydration render always start with `false` for the `"user"` policy.
 */
export function useReducedMotion(options?: UseReducedMotionOptions): boolean {
  const policy = options?.policy ?? "user";
  const [userReduced, setUserReduced] = useState(false);

  useEffect(() => {
    if (policy !== "user") {
      return;
    }

    setUserReduced(readReducedMotionPreference());
    return subscribeReducedMotion(setUserReduced);
  }, [policy]);

  if (policy === "always") {
    return true;
  }

  if (policy === "never") {
    return false;
  }

  return userReduced;
}
