import type { EasingFn } from "./easing.js";

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Snap when the value is at least this close to the target. @default 0.001 */
  restDelta?: number;
  /** Snap when absolute velocity drops below this (units/second). @default 0.01 */
  restSpeed?: number;
}

export interface AnimateNumberOptions {
  from?: number;
  to: number;
  /** Tween duration in seconds. @default 0.3 */
  duration?: number;
  /** @default "tween" */
  type?: "tween" | "spring";
  ease?: EasingFn | EasingFn[];
  spring?: SpringConfig;
  /** Starting velocity in units per second. Used when retargeting a spring. @default 0 */
  velocity?: number;
  delay?: number;
  /** `velocity` is units per second and is `0` for tweens. */
  onUpdate: (value: number, velocity?: number) => void;
  onComplete?: () => void;
  /** When true, jump to `to` immediately. */
  reducedMotion?: boolean;
}
