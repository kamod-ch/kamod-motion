import { useAnimateSvg } from "@kamod-ch/motion/svg";
import type { JSX } from "preact";
import { useEffect } from "preact/hooks";

export function SvgPathDemo(): JSX.Element {
  const { ref, animate } = useAnimateSvg<SVGPathElement>();

  useEffect(() => {
    const controls = animate(
      { pathLength: [0, 1], opacity: [0.3, 1] },
      { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
    );
    return () => controls.stop();
  }, [animate]);

  return (
    <svg
      viewBox="0 0 240 80"
      class="h-24 w-full max-w-md text-brand"
      aria-label="Animated path draw demo"
      role="img"
    >
      <path
        ref={ref}
        d="M 8 56 C 48 8, 96 72, 136 32 S 208 64, 232 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        pathLength="1"
        data-testid="svg-path"
      />
    </svg>
  );
}

export const svgPathDemoCode = `import { useAnimateSvg } from "@kamod-ch/motion/svg";

const { ref, animate } = useAnimateSvg<SVGPathElement>();

useEffect(() => {
  const controls = animate(
    { pathLength: [0, 1], opacity: [0.3, 1] },
    { duration: 1.2 },
  );
  return () => controls.stop();
}, [animate]);

<path ref={ref} pathLength="1" ... />`;
