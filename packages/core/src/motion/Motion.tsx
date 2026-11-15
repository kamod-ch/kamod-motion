import { createElement } from "preact";
import type { ComponentChildren, CSSProperties, JSX, Ref } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { useReducedMotion } from "../hooks/use-reduced-motion.js";
import { finishAnimation, runMiniAnimation } from "../mini/animate-element.js";
import { usePresence } from "../presence/context.js";
import type { Preset } from "../presets/index.js";
import type { KamodKeyframes, KamodTransition, ReducedMotionPolicy } from "../types.js";
import { isMotionElement, type MotionElement } from "./supported-elements.js";
import { keyframesToInlineStyle, mergeRefs, playbackKeyFor } from "./utils.js";

type MotionOwnProps = {
  /** Preset bundle. Explicit `initial` / `animate` / `exit` / `transition` override it. */
  preset?: Preset;
  /**
   * Opacity-only (or other) fallback used while reduced motion is active.
   * Spreading a preset such as `{...slideUp}` sets this from `preset.reduced`.
   * Not forwarded to the DOM.
   */
  reduced?: Preset;
  initial?: KamodKeyframes | false;
  animate?: KamodKeyframes | false;
  exit?: KamodKeyframes | false;
  transition?: KamodTransition;
  reducedMotion?: ReducedMotionPolicy;
  children?: ComponentChildren;
  ref?: Ref<HTMLElement | SVGElement | null>;
  style?: CSSProperties;
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

interface ResolvedMotion {
  initial: KamodKeyframes | false;
  animate: KamodKeyframes | false;
  exit: KamodKeyframes | false;
  transition?: KamodTransition;
}

function resolveMotionTarget(
  prefersReduced: boolean,
  preset: Preset | undefined,
  reduced: Preset | undefined,
  initial: KamodKeyframes | false | undefined,
  animate: KamodKeyframes | false | undefined,
  exit: KamodKeyframes | false | undefined,
  transition: KamodTransition | undefined,
): ResolvedMotion {
  const fallback = prefersReduced ? (reduced ?? preset?.reduced) : undefined;
  if (fallback) {
    return {
      initial: fallback.initial ?? false,
      animate: fallback.animate,
      exit: fallback.exit ?? false,
      transition: fallback.transition,
    };
  }

  return {
    initial: initial ?? preset?.initial ?? false,
    animate: animate ?? preset?.animate ?? false,
    exit: exit ?? preset?.exit ?? false,
    transition: transition ?? preset?.transition,
  };
}

function paintKeyframes(
  clientReady: boolean,
  prefersReduced: boolean,
  phase: string,
  motion: ResolvedMotion,
): KamodKeyframes | false {
  if (prefersReduced) {
    if (phase === "exiting" && motion.exit) {
      return motion.exit;
    }
    return motion.animate;
  }

  if (!clientReady) {
    if (motion.initial === false) {
      return motion.animate;
    }
    return motion.initial;
  }

  return false;
}

function MotionInner<T extends MotionElement = "div">(props: MotionProps<T>): JSX.Element {
  const {
    as = "div" as T,
    preset,
    reduced,
    initial: initialProp,
    animate: animateProp,
    exit: exitProp,
    transition: transitionProp,
    reducedMotion,
    children,
    style,
    ref,
    ...rest
  } = props;

  const hostTag = isMotionElement(as) ? as : "div";
  const elementRef = useRef<HTMLElement | SVGElement | null>(null);
  const controlsRef = useRef<ReturnType<typeof runMiniAnimation> | null>(null);
  const registeredExitRef = useRef<(() => void) | null>(null);
  const presence = usePresence();
  const prefersReduced = useReducedMotion({ policy: reducedMotion });
  const phase = presence?.phase ?? "present";
  const [clientReady, setClientReady] = useState(false);

  const motion = resolveMotionTarget(
    prefersReduced,
    preset,
    reduced,
    initialProp,
    animateProp,
    exitProp,
    transitionProp,
  );

  const presenceRef = useRef(presence);
  const phaseRef = useRef(phase);
  const motionRef = useRef(motion);
  const prefersReducedRef = useRef(prefersReduced);
  presenceRef.current = presence;
  phaseRef.current = phase;
  motionRef.current = motion;
  prefersReducedRef.current = prefersReduced;

  const playbackKey = playbackKeyFor({
    tag: hostTag,
    phase,
    animate: motion.animate,
    exit: motion.exit,
    transition: motion.transition,
    prefersReduced,
  });

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

    const run = (keyframes: KamodKeyframes | false, onDone?: () => void) => {
      stopCurrent();

      if (!keyframes) {
        onDone?.();
        return;
      }

      const controls = runMiniAnimation(element, keyframes, motionRef.current.transition, {
        reducedMotion: prefersReducedRef.current,
      });
      controlsRef.current = controls;

      void finishAnimation(controls).then(() => {
        if (!cancelled) {
          onDone?.();
        }
      });
    };

    const currentPhase = phaseRef.current;
    const currentMotion = motionRef.current;

    if (currentPhase === "exiting") {
      run(currentMotion.exit, () => {
        presenceRef.current?.safeToRemove();
      });
    } else if (currentPhase === "entering") {
      run(currentMotion.animate, () => {
        presenceRef.current?.notifyEnterComplete();
      });
    } else if (currentPhase === "present" && currentMotion.animate) {
      run(currentMotion.animate);
    }

    setClientReady(true);

    return () => {
      cancelled = true;
      stopCurrent();
    };
  }, [playbackKey]);

  const painted = keyframesToInlineStyle(
    paintKeyframes(clientReady, prefersReduced, phase, motion),
  );
  const mergedStyle = { ...painted, ...(style as Record<string, string> | undefined) };

  return createElement(
    hostTag,
    {
      ...rest,
      ref: mergeRefs(elementRef, ref),
      style: Object.keys(mergedStyle).length > 0 ? mergedStyle : style,
    },
    children,
  );
}

export const Motion = MotionInner as unknown as MotionComponent;
