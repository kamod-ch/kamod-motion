import type { KamodKeyframes, KamodTransition } from "../types.js";

export interface Preset {
  readonly initial?: KamodKeyframes;
  readonly animate: KamodKeyframes;
  readonly exit?: KamodKeyframes;
  readonly transition?: KamodTransition;
  /** Spatial fallback when prefers-reduced-motion is active. */
  readonly reduced?: Preset;
}

const defaultTransition: KamodTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

const exitTransition: KamodTransition = {
  duration: 0.2,
  ease: [0.4, 0, 1, 1],
};

const fadeOnly: Preset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: defaultTransition,
} as const;

export const fade: Preset = fadeOnly;

export const scale: Preset = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: defaultTransition,
  reduced: fadeOnly,
} as const;

export const slideUp: Preset = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: defaultTransition,
  reduced: fadeOnly,
} as const;

export const slideDown: Preset = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: defaultTransition,
  reduced: fadeOnly,
} as const;

export const slideLeft: Preset = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: defaultTransition,
  reduced: fadeOnly,
} as const;

export const slideRight: Preset = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: defaultTransition,
  reduced: fadeOnly,
} as const;

/** Returns a transition delay function for mini-engine staggered sequences. */
export function stagger(interval = 0.05, startDelay = 0) {
  return (index: number) => startDelay + index * interval;
}

export function resolvePreset(preset: Preset, reducedMotion: boolean): Preset {
  if (reducedMotion && preset.reduced) {
    return preset.reduced;
  }

  return preset;
}

export const motionPresets = {
  fade,
  scale,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  stagger,
  resolvePreset,
} as const;

/** @deprecated Use named exports or `motionPresets`. Kept for ARCHITECTURE.md aliases. */
export const fadeIn = fade;
/** @deprecated Use `fade` with exit keyframes configured manually. */
export const fadeOut: Preset = {
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: exitTransition,
} as const;

export const slideInFromTop = slideDown;
export const slideInFromBottom = slideUp;
export const slideInFromLeft = slideRight;
export const slideInFromRight = slideLeft;

export const zoomIn95 = scale;
export const zoomOut95: Preset = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: defaultTransition,
  reduced: fadeOnly,
} as const;
