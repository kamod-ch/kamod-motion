import { describe, expectTypeOf, it } from "vitest";
import type {
  AnimationOptions,
  AnimationPlaybackControlsWithThen,
  DOMKeyframesDefinition,
  ElementOrSelector,
  MotionValue,
  Transition,
} from "motion";

describe("motion@13.1.1 type contracts used by @kamod-ch/motion v0.1", () => {
  it("DOMKeyframesDefinition covers CSS, variables, and SVG path props", () => {
    const css: DOMKeyframesDefinition = {
      opacity: [0, 1],
      x: ["0%", "100%"],
      "--progress": [0, 1],
    };
    const svg: DOMKeyframesDefinition = {
      pathLength: [0, 1],
      pathOffset: [0, 0.5],
      fill: ["#000", "#fff"],
    };

    expectTypeOf(css).toMatchTypeOf<DOMKeyframesDefinition>();
    expectTypeOf(svg).toMatchTypeOf<DOMKeyframesDefinition>();
  });

  it("AnimationOptions accepts reduceMotion and lifecycle callbacks", () => {
    const options: AnimationOptions = {
      duration: 0.2,
      ease: "easeOut",
      delay: 0,
      reduceMotion: true,
      onComplete: () => {},
      onStop: () => {},
    };

    expectTypeOf(options).toMatchTypeOf<AnimationOptions>();
  });

  it("Transition supports spring type on the hybrid engine", () => {
    const spring: Transition = {
      type: "spring",
      stiffness: 300,
      damping: 30,
    };

    expectTypeOf(spring).toMatchTypeOf<Transition>();
  });

  it("animate return type exposes playback controls", () => {
    expectTypeOf({} as AnimationPlaybackControlsWithThen)
      .toHaveProperty("stop")
      .toBeFunction();
    expectTypeOf({} as AnimationPlaybackControlsWithThen)
      .toHaveProperty("cancel")
      .toBeFunction();
    expectTypeOf({} as AnimationPlaybackControlsWithThen)
      .toHaveProperty("complete")
      .toBeFunction();
    expectTypeOf({} as AnimationPlaybackControlsWithThen).toHaveProperty("finished");
  });

  it("ElementOrSelector matches DOM and selector forms", () => {
    expectTypeOf<ElementOrSelector>().toEqualTypeOf<
      Element | Element[] | NodeListOf<Element> | string | null | undefined
    >();
  });

  it("MotionValue is generic over string and number", () => {
    expectTypeOf(motionValueStub(0)).toMatchTypeOf<MotionValue<number>>();
    expectTypeOf(motionValueStub("0%")).toMatchTypeOf<MotionValue<string>>();
  });
});

function motionValueStub<V>(_value: V): MotionValue<V> {
  return {} as MotionValue<V>;
}
