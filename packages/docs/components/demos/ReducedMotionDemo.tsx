import { Motion } from "@kamod-ch/motion/motion";
import { useReducedMotion } from "@kamod-ch/motion/hooks/use-reduced-motion";
import { slideUp } from "@kamod-ch/motion/presets";
import type { ReducedMotionPolicy } from "@kamod-ch/motion";
import type { JSX } from "preact";
import { useState } from "preact/hooks";

const POLICIES: ReducedMotionPolicy[] = ["user", "always", "never"];

export function ReducedMotionDemo(): JSX.Element {
  const [policy, setPolicy] = useState<ReducedMotionPolicy>("user");
  const reduced = useReducedMotion({ policy });

  return (
    <div class="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <div
        class="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Reduced motion policy"
      >
        {POLICIES.map((entry) => (
          <button
            key={entry}
            type="button"
            class={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              policy === entry
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-pressed={policy === entry}
            onClick={() => setPolicy(entry)}
          >
            {entry}
          </button>
        ))}
      </div>
      <p class="m-0 text-sm text-muted-foreground" data-testid="reduced-motion-status">
        policy: <strong class="text-foreground">{policy}</strong>
        {" · "}
        reduced: <strong class="text-foreground">{reduced ? "yes" : "no"}</strong>
      </p>
      <Motion
        class="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm"
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={slideUp.transition}
        reducedMotion={policy}
        data-testid="reduced-motion-panel"
      >
        {reduced ? "Spatial motion skipped — opacity only" : "Full slide-up animation"}
      </Motion>
    </div>
  );
}

export const reducedMotionDemoCode = `import { useReducedMotion } from "@kamod-ch/motion/hooks/use-reduced-motion";
import { Motion } from "@kamod-ch/motion/motion";
import { slideUp } from "@kamod-ch/motion/presets";

const [policy, setPolicy] = useState<"user" | "always" | "never">("user");
const reduced = useReducedMotion({ policy });

<Motion
  initial={slideUp.initial}
  animate={slideUp.animate}
  transition={slideUp.transition}
  reducedMotion={policy}
>
  {reduced ? "Spatial motion skipped" : "Full slide-up animation"}
</Motion>`;
