import type { KamodKeyframes, KamodTransition } from "../types.js";

const firstKeyframe = (
  value: KamodKeyframes[keyof KamodKeyframes] | undefined,
): string | number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return Array.isArray(value) ? (value[0] ?? undefined) : value;
};

/** Maps a small set of Motion keyframes to inline styles for SSR-safe initial paint. */
export function keyframesToInlineStyle(keyframes?: KamodKeyframes | false): Record<string, string> {
  if (!keyframes) {
    return {};
  }

  const style: Record<string, string> = {};
  const opacity = firstKeyframe(keyframes.opacity);
  const x = firstKeyframe(keyframes.x);
  const y = firstKeyframe(keyframes.y);
  const scale = firstKeyframe(keyframes.scale);
  const scaleX = firstKeyframe(keyframes.scaleX);
  const scaleY = firstKeyframe(keyframes.scaleY);

  if (opacity !== undefined) {
    style.opacity = String(opacity);
  }

  const transforms: string[] = [];
  if (x !== undefined) {
    transforms.push(`translateX(${typeof x === "number" ? `${x}px` : x})`);
  }
  if (y !== undefined) {
    transforms.push(`translateY(${typeof y === "number" ? `${y}px` : y})`);
  }
  const rotate = firstKeyframe(keyframes.rotate);

  if (scale !== undefined) {
    transforms.push(`scale(${scale})`);
  } else {
    if (scaleX !== undefined) {
      transforms.push(`scaleX(${scaleX})`);
    }
    if (scaleY !== undefined) {
      transforms.push(`scaleY(${scaleY})`);
    }
  }
  if (rotate !== undefined) {
    transforms.push(`rotate(${typeof rotate === "number" ? `${rotate}deg` : rotate})`);
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(" ");
  }

  return style;
}

/** Stable identity for keyframes and transitions so inline objects do not restart animations. */
export function serializeAnimation(value: unknown): string {
  if (typeof value === "function") {
    return value.toString();
  }

  if (typeof value !== "object" || value === null) {
    return JSON.stringify(value) ?? "undefined";
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => serializeAnimation(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  // Fresh array from Object.keys. ES2022 has no Array#toSorted.
  // oxlint-disable-next-line unicorn/no-array-sort
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${key}:${serializeAnimation(record[key])}`).join(",")}}`;
}

export function playbackKeyFor(input: {
  tag: string;
  phase: string;
  animate: KamodKeyframes | false;
  exit: KamodKeyframes | false;
  transition?: KamodTransition;
  prefersReduced: boolean;
}): string {
  const mode = input.phase === "exiting" ? "exit" : "show";
  const keyframes = mode === "exit" ? input.exit : input.animate;
  return [
    input.tag,
    mode,
    serializeAnimation(keyframes),
    serializeAnimation(input.transition),
    input.prefersReduced ? "1" : "0",
  ].join(":");
}

export function mergeRefs<T>(
  ...refs: Array<((value: T | null) => void) | { current: T | null } | null | undefined>
) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === "function") {
        ref(value);
        continue;
      }

      ref.current = value;
    }
  };
}
