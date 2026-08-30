import type { EasingFn } from "./easing.js";

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
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
  delay?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
  /** When true, jump to `to` immediately. */
  reducedMotion?: boolean;
}
