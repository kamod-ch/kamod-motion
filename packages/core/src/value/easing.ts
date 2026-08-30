/** Normalized 0–1 easing helpers for tween animations. */
export type EasingFn = (t: number) => number;

export const linear: EasingFn = (t) => t;

export const easeOutCubic: EasingFn = (t) => 1 - (1 - t) ** 3;

export function resolveEase(ease: EasingFn | EasingFn[] | undefined): EasingFn {
  if (!ease) {
    return easeOutCubic;
  }

  return Array.isArray(ease) ? (ease[0] ?? easeOutCubic) : ease;
}
