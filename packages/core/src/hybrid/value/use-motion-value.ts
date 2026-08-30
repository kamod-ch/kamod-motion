import { useRef } from "preact/hooks";
import { motionValue, type MotionValue } from "motion";

/** Creates a stable hybrid `MotionValue` instance for the component lifetime. */
export function useMotionValue<T extends number | string>(initial: T): MotionValue<T> {
  const valueRef = useRef<MotionValue<T> | null>(null);

  if (!valueRef.current) {
    valueRef.current = motionValue(initial);
  }

  return valueRef.current;
}

/** @deprecated Use `useMotionValue`. Alias from ARCHITECTURE.md. */
export const createMotionValue = motionValue;
