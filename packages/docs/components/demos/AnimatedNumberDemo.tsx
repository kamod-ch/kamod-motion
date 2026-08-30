import { useAnimateNumber } from "@kamod-ch/motion/value";
import type { JSX } from "preact";
import { useState } from "preact/hooks";

export function AnimatedNumberDemo(): JSX.Element {
  const [target, setTarget] = useState(1280);
  const value = useAnimateNumber(target, { duration: 0.6 });

  return (
    <div class="flex flex-col items-center gap-4">
      <p
        class="m-0 font-mono text-4xl font-semibold tracking-tight text-foreground tabular-nums"
        data-testid="animated-number"
        aria-live="polite"
      >
        {Math.round(value).toLocaleString()}
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        {[420, 1280, 8640].map((amount) => (
          <button
            key={amount}
            type="button"
            class="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            onClick={() => setTarget(amount)}
          >
            {amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}

export const animatedNumberDemoCode = `import { useAnimateNumber } from "@kamod-ch/motion/value";

const value = useAnimateNumber(target, { duration: 0.6 });

<p aria-live="polite">{Math.round(value).toLocaleString()}</p>`;
