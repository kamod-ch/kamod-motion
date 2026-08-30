import { createElement } from "preact";
import { forwardRef } from "preact/compat";
import type { ComponentChildren, JSX, Ref } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { useReducedMotion } from "../hooks/use-reduced-motion.js";
import { finishAnimation, runMiniAnimation } from "../mini/animate-element.js";
import { usePresence } from "../presence/context.js";
import type { KamodKeyframes, KamodTransition, ReducedMotionPolicy } from "../types.js";
import { isMotionElement, type MotionElement } from "./supported-elements.js";
import { keyframesToInlineStyle, mergeRefs } from "./utils.js";

type MotionOwnProps = {
  initial?: KamodKeyframes | false;
  animate?: KamodKeyframes | false;
  exit?: KamodKeyframes | false;
  transition?: KamodTransition;
  reducedMotion?: ReducedMotionPolicy;
  children?: ComponentChildren;
  ref?: Ref<HTMLElement | SVGElement | null>;
  style?: JSX.CSSProperties;
};

export type MotionProps<T extends MotionElement = "div"> = MotionOwnProps & {
  as?: T;
} & Omit<JSX.IntrinsicElements[T], keyof MotionOwnProps | "as">;

interface MotionComponent {
  <T extends MotionElement>(
    props: MotionProps<T> & { as: T; ref?: Ref<HTMLElement | SVGElement | null> },
  ): JSX.Element;
  (props: MotionProps<"div"> & { ref?: Ref<HTMLElement | SVGElement | null> }): JSX.Element;
}

function MotionInner<T extends MotionElement = "div">(
  {
    as = "div" as T,
    initial = false,
    animate = false,
    exit = false,
    transition,
    reducedMotion,
    children,
    style,
    ...rest
  }: MotionProps<T>,
  ref: Ref<HTMLElement | SVGElement | null>,
) {
  const hostTag = isMotionElement(as) ? as : "div";
  const elementRef = useRef<HTMLElement | null>(null);
  const controlsRef = useRef<ReturnType<typeof runMiniAnimation> | null>(null);
  const registeredExitRef = useRef<(() => void) | null>(null);
  const presence = usePresence();
  const prefersReduced = useReducedMotion({ policy: reducedMotion });
  const phase = presence?.phase ?? "present";

  useLayoutEffect(() => {
    registeredExitRef.current?.();
    registeredExitRef.current = presence?.register() ?? null;

    return () => {
      registeredExitRef.current?.();
      registeredExitRef.current = null;
    };
  }, [presence]);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    let cancelled = false;

    const stopCurrent = () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };

    const run = async (keyframes: KamodKeyframes | false, onDone?: () => void) => {
      stopCurrent();

      if (!keyframes) {
        onDone?.();
        return;
      }

      controlsRef.current = runMiniAnimation(element, keyframes, transition, {
        reducedMotion: prefersReduced,
      });

      const activeControls = controlsRef.current;
      await finishAnimation(activeControls);
      if (!cancelled) {
        onDone?.();
      }
    };

    if (phase === "exiting") {
      if (!exit) {
        presence?.safeToRemove();
        return () => {
          cancelled = true;
          stopCurrent();
        };
      }

      void run(exit, () => {
        presence?.safeToRemove();
      });
      return () => {
        cancelled = true;
        stopCurrent();
      };
    }

    if (phase === "entering") {
      if (!animate) {
        presence?.notifyEnterComplete();
        return () => {
          cancelled = true;
          stopCurrent();
        };
      }

      void run(animate, () => {
        presence?.notifyEnterComplete();
      });
      return () => {
        cancelled = true;
        stopCurrent();
      };
    }

    if (phase === "present" && animate) {
      void run(animate);
      return () => {
        cancelled = true;
        stopCurrent();
      };
    }

    return () => {
      cancelled = true;
      stopCurrent();
    };
  }, [phase, animate, exit, transition, prefersReduced, presence]);

  const initialStyle = keyframesToInlineStyle(initial);
  const mergedStyle = { ...initialStyle, ...(style as Record<string, string> | undefined) };

  return createElement(
    hostTag,
    {
      ...rest,
      ref: mergeRefs(elementRef, ref as never),
      style: Object.keys(mergedStyle).length > 0 ? mergedStyle : style,
    },
    children,
  );
}

export const Motion = forwardRef(MotionInner) as unknown as MotionComponent;
