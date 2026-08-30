export { animate, animateSequence } from "./mini/index.js";
export {
  prefersReducedMotion,
  useReducedMotion,
  type UseReducedMotionOptions,
} from "./hooks/use-reduced-motion/index.js";
export {
  useAnimate,
  type UseAnimateOptions,
  type UseAnimateResult,
} from "./hooks/use-animate/index.js";
export { Motion, type MotionProps, MOTION_ELEMENTS, type MotionElement } from "./motion/index.js";
export {
  Presence,
  usePresence,
  usePresencePhase,
  type PresenceProps,
  type PresencePhase,
} from "./presence/index.js";
export {
  fade,
  fadeIn,
  fadeOut,
  motionPresets,
  resolvePreset,
  scale,
  slideDown,
  slideInFromBottom,
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
  slideLeft,
  slideRight,
  slideUp,
  stagger,
  zoomIn95,
  zoomOut95,
  type Preset,
} from "./presets/index.js";
export type {
  KamodAnimationControls,
  KamodKeyframes,
  KamodTransition,
  ReducedMotionPolicy,
} from "./types.js";
