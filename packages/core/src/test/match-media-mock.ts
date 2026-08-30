export interface MatchMediaMockController {
  readonly mediaQuery: MediaQueryList;
  setMatches(matches: boolean): void;
  listenerCount(): number;
}

export function installMatchMediaMock(initialMatches = false): MatchMediaMockController {
  const changeListeners = new Set<(event: MediaQueryListEvent) => void>();
  const legacyListeners = new Set<(this: MediaQueryList, event: MediaQueryListEvent) => void>();
  let matches = initialMatches;

  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
      if (type === "change") {
        changeListeners.add(listener);
      }
    },
    removeEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
      if (type === "change") {
        changeListeners.delete(listener);
      }
    },
    addListener(listener: (this: MediaQueryList, event: MediaQueryListEvent) => void) {
      legacyListeners.add(listener);
    },
    removeListener(listener: (this: MediaQueryList, event: MediaQueryListEvent) => void) {
      legacyListeners.delete(listener);
    },
    dispatchEvent() {
      return true;
    },
  } as MediaQueryList;

  return {
    mediaQuery,
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      changeListeners.forEach((listener) => listener(event));
      legacyListeners.forEach((listener) => listener.call(mediaQuery, event));
    },
    listenerCount() {
      return changeListeners.size + legacyListeners.size;
    },
  };
}

export function withMatchMediaMock(
  initialMatches: boolean,
  run: (controller: MatchMediaMockController) => void | Promise<void>,
): void | Promise<void> {
  const controller = installMatchMediaMock(initialMatches);
  const previous = globalThis.matchMedia;

  globalThis.matchMedia = ((query: string) => {
    if (query !== "(prefers-reduced-motion: reduce)") {
      throw new Error(`Unexpected media query: ${query}`);
    }
    return controller.mediaQuery;
  }) as typeof matchMedia;

  try {
    return run(controller);
  } finally {
    globalThis.matchMedia = previous;
  }
}
