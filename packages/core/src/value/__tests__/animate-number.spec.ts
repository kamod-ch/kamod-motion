/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { animateNumber } from "../animate-number.js";
import { easeOutCubic } from "../easing.js";

describe("animateNumber", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal("cancelAnimationFrame", (handle: number) => {
      clearTimeout(handle);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("animates toward the target value", () => {
    const updates: number[] = [];

    animateNumber({
      from: 0,
      to: 100,
      duration: 0.2,
      ease: easeOutCubic,
      onUpdate: (value) => updates.push(value),
    });

    vi.runAllTimers();

    expect(updates.length).toBeGreaterThan(1);
    expect(updates.at(-1)).toBeCloseTo(100, 1);
  });

  it("applies reduced motion immediately", async () => {
    const updates: number[] = [];
    let completed = false;

    const controls = animateNumber({
      from: 0,
      to: 42,
      reducedMotion: true,
      onUpdate: (value) => updates.push(value),
      onComplete: () => {
        completed = true;
      },
    });

    expect(updates).toEqual([42]);
    expect(completed).toBe(true);
    await expect(controls.finished).resolves.toBeUndefined();
  });

  it("cleans up before completion when stopped", async () => {
    const updates: number[] = [];

    const controls = animateNumber({
      from: 0,
      to: 100,
      duration: 1,
      onUpdate: (value) => updates.push(value),
      onComplete: () => {
        throw new Error("onComplete must not run after stop");
      },
    });

    vi.advanceTimersByTime(50);
    controls.stop();
    const beforeStop = updates.length;
    vi.runAllTimers();
    expect(updates.length).toBe(beforeStop);
    await expect(controls.finished).rejects.toThrow("animation stopped");
  });
});
