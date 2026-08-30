import { ThemeProvider, useTheme, type ColorScheme } from "@kamod-ch/themes";
import type { JSX } from "preact";

const SCHEMES: ColorScheme[] = ["light", "dark", "system"];

function schemeLabel(scheme: ColorScheme): string {
  if (scheme === "system") return "System";
  return scheme === "dark" ? "Dark" : "Light";
}

function ThemeToggleButton(): JSX.Element {
  const { scheme, setScheme } = useTheme();

  const next = SCHEMES[(SCHEMES.indexOf(scheme) + 1) % SCHEMES.length] ?? "system";

  return (
    <button
      type="button"
      class="hit-target inline-flex items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      aria-label={`Theme: ${schemeLabel(scheme)}. Switch to ${schemeLabel(next)}.`}
      onClick={() => setScheme(next)}
    >
      {schemeLabel(scheme)}
    </button>
  );
}

export function DocsThemeProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  return <ThemeProvider defaultScheme="system">{children}</ThemeProvider>;
}

export function ThemeToggle(): JSX.Element {
  return <ThemeToggleButton />;
}
