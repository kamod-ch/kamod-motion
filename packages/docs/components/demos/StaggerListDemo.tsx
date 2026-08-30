import { Motion } from "@kamod-ch/motion/motion";
import { stagger } from "@kamod-ch/motion/presets";
import type { JSX } from "preact";
import { useMemo } from "preact/hooks";

const ITEMS = ["Design tokens", "Motion presets", "Presence API", "Reduced motion"];

export function StaggerListDemo(): JSX.Element {
  const delay = useMemo(() => stagger(0.08, 0.05), []);

  return (
    <ul class="m-0 flex w-full max-w-md list-none flex-col gap-2 p-0">
      {ITEMS.map((label, index) => (
        <Motion
          as="li"
          key={label}
          class="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: delay(index) }}
        >
          {label}
        </Motion>
      ))}
    </ul>
  );
}

export const staggerListDemoCode = `import { Motion } from "@kamod-ch/motion/motion";
import { stagger } from "@kamod-ch/motion/presets";

const delay = stagger(0.08, 0.05);

items.map((label, index) => (
  <Motion
    key={label}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: delay(index) }}
  >
    {label}
  </Motion>
));`;
