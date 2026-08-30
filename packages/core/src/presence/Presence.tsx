import { createElement } from "preact";
import type { ComponentChildren } from "preact";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { useReducedMotion } from "../hooks/use-reduced-motion.js";
import type { ReducedMotionPolicy } from "../types.js";
import { PresenceContext, type PresenceContextValue, type PresencePhase } from "./context.js";

export interface PresenceProps {
  show: boolean;
  initial?: boolean;
  reducedMotion?: ReducedMotionPolicy;
  onExitComplete?: () => void;
  id?: string | number;
  children: ComponentChildren | ((phase: PresencePhase) => ComponentChildren);
}

function resolveInitialPhase(show: boolean, initial: boolean): PresencePhase {
  if (!show) {
    return "unmounted";
  }

  return initial ? "entering" : "present";
}

export function Presence({
  show,
  initial = true,
  reducedMotion,
  onExitComplete,
  children,
}: PresenceProps) {
  const prefersReduced = useReducedMotion({ policy: reducedMotion });
  const [phase, setPhase] = useState<PresencePhase>(() => resolveInitialPhase(show, initial));
  const [visible, setVisible] = useState(show);
  const exitCompleteCalled = useRef(false);
  const registeredNodes = useRef(0);
  const completedEnterNodes = useRef(0);
  const completedExitNodes = useRef(0);

  const resetExitTracking = useCallback(() => {
    exitCompleteCalled.current = false;
    completedExitNodes.current = 0;
  }, []);

  const resetEnterTracking = useCallback(() => {
    completedEnterNodes.current = 0;
  }, []);

  useLayoutEffect(() => {
    if (show) {
      if (phase === "unmounted") {
        resetEnterTracking();
        resetExitTracking();
        setVisible(true);
        setPhase(initial ? "entering" : "present");
        return;
      }

      if (phase === "exiting") {
        resetEnterTracking();
        resetExitTracking();
        setVisible(true);
        setPhase("entering");
      }

      return;
    }

    if (phase === "present" || phase === "entering") {
      resetExitTracking();
      setPhase("exiting");
    }
  }, [show, phase, initial, resetEnterTracking, resetExitTracking]);

  useLayoutEffect(() => {
    if (!prefersReduced) {
      return;
    }

    if (phase === "entering") {
      setPhase("present");
      return;
    }

    if (phase === "exiting") {
      setPhase("unmounted");
      setVisible(false);
      if (!exitCompleteCalled.current) {
        exitCompleteCalled.current = true;
        onExitComplete?.();
      }
    }
  }, [phase, prefersReduced, onExitComplete]);

  const register = useCallback(() => {
    registeredNodes.current += 1;
    return () => {
      registeredNodes.current = Math.max(0, registeredNodes.current - 1);
    };
  }, []);

  const notifyEnterComplete = useCallback(() => {
    if (phase !== "entering") {
      return;
    }

    completedEnterNodes.current += 1;
    if (registeredNodes.current === 0 || completedEnterNodes.current >= registeredNodes.current) {
      setPhase("present");
    }
  }, [phase]);

  const safeToRemove = useCallback(() => {
    if (phase !== "exiting") {
      return;
    }

    completedExitNodes.current += 1;
    if (registeredNodes.current === 0 || completedExitNodes.current >= registeredNodes.current) {
      setPhase("unmounted");
      setVisible(false);
      if (!exitCompleteCalled.current) {
        exitCompleteCalled.current = true;
        onExitComplete?.();
      }
    }
  }, [phase, onExitComplete]);

  useLayoutEffect(() => {
    if (phase !== "entering" || prefersReduced) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (registeredNodes.current === 0) {
        setPhase("present");
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [phase, prefersReduced]);

  useLayoutEffect(() => {
    if (phase !== "exiting" || prefersReduced) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (registeredNodes.current === 0) {
        safeToRemove();
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [phase, prefersReduced, safeToRemove]);

  const contextValue = useMemo<PresenceContextValue>(
    () => ({
      phase,
      isPresent: phase !== "unmounted" && phase !== "exiting",
      register,
      notifyEnterComplete,
      safeToRemove,
    }),
    [phase, register, notifyEnterComplete, safeToRemove],
  );

  if (!visible) {
    return null;
  }

  const renderedChildren = typeof children === "function" ? children(phase) : children;

  return createElement(PresenceContext.Provider, {
    value: contextValue,
    children: renderedChildren,
  });
}
