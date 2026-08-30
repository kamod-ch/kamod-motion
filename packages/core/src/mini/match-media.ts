export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function readReducedMotionPreference(): boolean {
  if (typeof globalThis.matchMedia !== "function") {
    return false;
  }

  return globalThis.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function subscribeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof globalThis.matchMedia !== "function") {
    return () => {};
  }

  const media = globalThis.matchMedia(REDUCED_MOTION_QUERY);
  const handler = () => onChange(media.matches);

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }

  if (typeof media.addListener === "function") {
    media.addListener(handler);
    return () => media.removeListener(handler);
  }

  return () => {};
}
