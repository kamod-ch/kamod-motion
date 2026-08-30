import { createContext } from "preact";
import { useContext } from "preact/hooks";

export type PresencePhase = "unmounted" | "entering" | "present" | "exiting";

export interface PresenceContextValue {
  phase: PresencePhase;
  isPresent: boolean;
  register: () => () => void;
  notifyEnterComplete: () => void;
  safeToRemove: () => void;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);

export function usePresence(): PresenceContextValue | null {
  return useContext(PresenceContext);
}

export function usePresencePhase(): PresencePhase {
  return usePresence()?.phase ?? "present";
}
