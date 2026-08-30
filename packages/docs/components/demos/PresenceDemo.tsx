import { Motion } from "@kamod-ch/motion/motion";
import { Presence } from "@kamod-ch/motion/presence";
import { fade, scale } from "@kamod-ch/motion/presets";
import type { JSX } from "preact";
import { useState } from "preact/hooks";

export function PresenceDemo(): JSX.Element {
  const [open, setOpen] = useState(true);

  const quickReopen = () => {
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  };

  return (
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          class="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Dismiss" : "Show"} toast
        </button>
        <button
          type="button"
          class="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          onClick={quickReopen}
          data-testid="presence-quick-reopen"
        >
          Quick reopen
        </button>
      </div>
      <div class="relative h-24 w-full max-w-sm">
        <Presence show={open}>
          <Motion
            class="absolute inset-x-0 mx-auto flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-md"
            initial={scale.initial}
            animate={scale.animate}
            exit={fade.exit}
            transition={scale.transition}
            role="status"
          >
            <span class="size-2 rounded-full bg-brand" aria-hidden="true" />
            Saved to your workspace
          </Motion>
        </Presence>
      </div>
    </div>
  );
}

export const presenceDemoCode = `import { Motion } from "@kamod-ch/motion/motion";
import { Presence } from "@kamod-ch/motion/presence";
import { fade, scale } from "@kamod-ch/motion/presets";

// Interrupt exit by reopening before onExitComplete fires:
setOpen(false);
requestAnimationFrame(() => setOpen(true));

<Presence show={open}>
  <Motion
    initial={scale.initial}
    animate={scale.animate}
    exit={fade.exit}
    transition={scale.transition}
  >
    Saved to your workspace
  </Motion>
</Presence>`;
