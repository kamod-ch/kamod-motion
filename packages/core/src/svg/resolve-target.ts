import type { SvgAnimationTarget } from "./types.js";
import { isBrowser } from "../utils/env.js";

export function resolveSvgTarget(
  target: SvgAnimationTarget,
): SVGElement | readonly SVGElement[] | null {
  if (!isBrowser()) {
    return null;
  }

  if ("current" in target) {
    return target.current;
  }

  if (target instanceof NodeList) {
    return Array.from(target);
  }

  if (Array.isArray(target)) {
    return [...target];
  }

  return target;
}
