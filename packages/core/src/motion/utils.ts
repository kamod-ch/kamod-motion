import type { KamodKeyframes } from "../types.js";

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

  if (transforms.length > 0) {
    style.transform = transforms.join(" ");
  }

  return style;
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
