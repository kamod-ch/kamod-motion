import type { ComponentChildren, JSX } from "preact";
import { useState } from "preact/hooks";
import { CodePreview } from "./CodePreview";

type ExampleFrameProps = {
  title?: string;
  description?: string;
  badges?: string[];
  preview: ComponentChildren;
  code: string;
  class?: string;
  id?: string;
};

export function ExampleFrame({
  title,
  description,
  badges = [],
  preview,
  code,
  class: className = "",
  id,
}: ExampleFrameProps): JSX.Element {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <section
      id={id}
      class={`scroll-mt-[calc(var(--docs-header-height)+1rem)] overflow-visible rounded-xl border border-border bg-card ${className}`}
    >
      {(title || description || badges.length > 0) && (
        <header class="space-y-2 border-b border-border px-4 py-4 sm:px-5">
          {title ? <h3 class="text-base font-semibold text-foreground">{title}</h3> : null}
          {description ? <p class="text-sm text-muted-foreground">{description}</p> : null}
          {badges.length > 0 ? (
            <div class="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  class="inline-flex rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </header>
      )}
      <div class="border-b border-border px-3">
        <div class="flex gap-1" role="tablist" aria-label="Example view">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            class={`min-h-10 border-b-2 px-3 text-sm font-medium transition-colors ${
              tab === "preview"
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "code"}
            class={`min-h-10 border-b-2 px-3 text-sm font-medium transition-colors ${
              tab === "code"
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("code")}
          >
            Code
          </button>
        </div>
      </div>
      {tab === "preview" ? (
        <div class="docs-demo-frame m-0 overflow-visible p-4 sm:p-5" role="tabpanel">
          {preview}
        </div>
      ) : (
        <div role="tabpanel">
          <CodePreview code={code} class="rounded-none border-0" />
        </div>
      )}
    </section>
  );
}
