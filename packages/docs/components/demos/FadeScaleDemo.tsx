import { Motion } from "@kamod-ch/motion/motion";
import { scale } from "@kamod-ch/motion/presets";
import type { JSX } from "preact";
import { useState } from "preact/hooks";

export function FadeScaleDemo(): JSX.Element {
  const [visible, setVisible] = useState(true);

  return (
    <div class="flex flex-col items-center gap-4">
      <button
        type="button"
        class="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? "Hide" : "Show"} panel
      </button>
      {visible ? (
        <Motion
          class="flex h-32 w-48 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-sm font-medium text-foreground shadow-sm"
          initial={scale.initial}
          animate={scale.animate}
          exit={scale.exit}
          transition={scale.transition}
        >
          Fade + scale
        </Motion>
      ) : null}
    </div>
  );
}

export const fadeScaleDemoCode = `import { Motion } from "@kamod-ch/motion/motion";
import { scale } from "@kamod-ch/motion/presets";

<Motion
  initial={scale.initial}
  animate={scale.animate}
  exit={scale.exit}
  transition={scale.transition}
>
  Fade + scale
</Motion>`;
