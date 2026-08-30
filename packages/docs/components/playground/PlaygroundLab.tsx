import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { AnimatedNumberDemo, animatedNumberDemoCode } from "../demos/AnimatedNumberDemo";
import { FadeScaleDemo, fadeScaleDemoCode } from "../demos/FadeScaleDemo";
import { PresenceDemo, presenceDemoCode } from "../demos/PresenceDemo";
import { ReducedMotionDemo, reducedMotionDemoCode } from "../demos/ReducedMotionDemo";
import { StaggerListDemo, staggerListDemoCode } from "../demos/StaggerListDemo";
import { SvgPathDemo, svgPathDemoCode } from "../demos/SvgPathDemo";
import { ExampleFrame } from "../shared/ExampleFrame";

const DEMOS = [
  { id: "fade-scale", label: "Fade + scale", preview: <FadeScaleDemo />, code: fadeScaleDemoCode },
  { id: "presence", label: "Presence", preview: <PresenceDemo />, code: presenceDemoCode },
  { id: "stagger", label: "Stagger list", preview: <StaggerListDemo />, code: staggerListDemoCode },
  {
    id: "reduced-motion",
    label: "Reduced motion",
    preview: <ReducedMotionDemo />,
    code: reducedMotionDemoCode,
  },
  {
    id: "animated-number",
    label: "Animated number",
    preview: <AnimatedNumberDemo />,
    code: animatedNumberDemoCode,
  },
  { id: "svg-path", label: "SVG path", preview: <SvgPathDemo />, code: svgPathDemoCode },
] as const;

export function PlaygroundLab(): JSX.Element {
  const [active, setActive] = useState<(typeof DEMOS)[number]["id"]>("fade-scale");
  const demo = DEMOS.find((entry) => entry.id === active) ?? DEMOS[0];

  return (
    <div class="mx-auto max-w-[var(--docs-content-max)] px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 space-y-2">
        <p class="text-sm text-muted-foreground">Interactive</p>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Playground</h1>
        <p class="max-w-2xl text-base text-muted-foreground">
          Try live demos powered by published @kamod-ch/motion entry points — mini engine by
          default.
        </p>
      </header>

      <div class="mb-6 flex flex-wrap gap-2">
        {DEMOS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            class={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active === entry.id
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-pressed={active === entry.id}
            onClick={() => setActive(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <ExampleFrame
        title={demo.label}
        preview={demo.preview}
        code={demo.code}
        badges={["@kamod-ch/motion", "mini engine"]}
      />
    </div>
  );
}
