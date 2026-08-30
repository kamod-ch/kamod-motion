import type { JSX } from "preact";
import { CopyButton } from "./CopyButton";

type CodePreviewProps = {
  code: string;
  language?: string;
  class?: string;
  title?: string;
};

export function CodePreview({
  code,
  language = "tsx",
  class: className = "",
  title,
}: CodePreviewProps): JSX.Element {
  return (
    <div
      class={`overflow-hidden rounded-xl border border-border bg-card text-card-foreground ${className}`}
    >
      <div class="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div class="flex items-center gap-2">
          {title ? <span class="text-sm font-medium">{title}</span> : null}
          <span class="rounded-md bg-muted px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {language}
          </span>
        </div>
        <CopyButton value={code} />
      </div>
      <pre class="m-0 overflow-x-auto p-4 text-[0.8125rem] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
