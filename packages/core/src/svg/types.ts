import type { KamodKeyframes } from "../types.js";

/** SVG-friendly keyframes supported by the mini WAAPI engine. */
export type SvgKeyframes = Pick<
  KamodKeyframes,
  | "pathLength"
  | "pathOffset"
  | "pathSpacing"
  | "attrX"
  | "attrY"
  | "attrScale"
  | "opacity"
  | "fill"
  | "stroke"
  | "strokeWidth"
  | "r"
  | "cx"
  | "cy"
  | "x"
  | "y"
  | "rotate"
  | "scale"
  | "scaleX"
  | "scaleY"
  | "transform"
>;

export type SvgAnimationTarget =
  | SVGElement
  | readonly SVGElement[]
  | NodeListOf<SVGElement>
  | { current: SVGElement | null };

export const SVG_PATH_METRICS = [
  "pathLength",
  "pathOffset",
  "pathSpacing",
] as const satisfies ReadonlyArray<keyof SvgKeyframes>;
