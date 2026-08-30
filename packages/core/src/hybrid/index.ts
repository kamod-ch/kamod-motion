/** Opt-in hybrid Motion engine entry surface for `@kamod-ch/motion/hybrid`. */
export const MOTION_ENGINE = "hybrid" as const;

export { animateValue, followValue, motionValue, stagger, spring } from "motion";

export type { MotionValue, SpringOptions, ValueAnimationTransition } from "motion";
