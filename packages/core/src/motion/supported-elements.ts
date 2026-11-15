/** Supported host tags for the polymorphic `Motion` component. */
export const MOTION_ELEMENTS = [
  "a",
  "article",
  "aside",
  "blockquote",
  "button",
  "circle",
  "dialog",
  "div",
  "figcaption",
  "figure",
  "footer",
  "form",
  "g",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "img",
  "input",
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
  "textarea",
  "ul",
] as const;

export type MotionElement = (typeof MOTION_ELEMENTS)[number];

const motionElementSet = new Set<string>(MOTION_ELEMENTS);

export function isMotionElement(value: string): value is MotionElement {
  return motionElementSet.has(value);
}
