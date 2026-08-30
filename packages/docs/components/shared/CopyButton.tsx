import type { JSX } from "preact";
import { useState } from "preact/hooks";

type CopyButtonProps = {
  value: string;
  class?: string;
  label?: string;
};

export function CopyButton({
  value,
  class: className = "",
  label = "Copy",
}: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      class={`inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted ${className}`}
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
