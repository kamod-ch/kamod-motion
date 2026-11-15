export function isBrowser(): boolean {
  return typeof document !== "undefined";
}

/** True for local dev and tests. Production bundles swallow animation engine failures. */
export function isDevRuntime(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}
