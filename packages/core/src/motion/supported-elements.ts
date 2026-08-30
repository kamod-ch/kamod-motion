/** Supported host tags for the polymorphic `Motion` component. */
export const MOTION_ELEMENTS = [
  "a",
  "article",
  "aside",
  "button",
  "circle",
  "div",
  "footer",
  "form",
  "g",
  "header",
  "label",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "path",
  "section",
  "span",
  "svg",
  "ul",
] as const;

export type MotionElement = (typeof MOTION_ELEMENTS)[number];

const motionElementSet = new Set<string>(MOTION_ELEMENTS);

export function isMotionElement(value: string): value is MotionElement {
  return motionElementSet.has(value);
}
