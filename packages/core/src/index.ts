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
  PresenceList,
  usePresence,
  usePresencePhase,
  type PresenceListProps,
  type PresenceMode,
  type PresenceProps,
  type PresencePhase,
} from "./presence/index.js";
export {
  fade,
  motionPresets,
  resolvePreset,
  scale,
  slideDown,
  slideLeft,
  slideRight,
  slideUp,
  stagger,
  type Preset,
} from "./presets/index.js";
export type {
  KamodAnimationControls,
  KamodKeyframes,
  KamodTransition,
  ReducedMotionPolicy,
} from "./types.js";
