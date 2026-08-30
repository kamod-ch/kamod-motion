import type { LayoutProps } from "@kamod-ch/preactpress/client";
import { syncThemeFromStorage } from "@kamod-ch/themes";
import type { ComponentChildren, FunctionalComponent, JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { PlaygroundLab } from "../../components/playground/PlaygroundLab";
import { BrandLogo } from "../../components/shared/BrandLogo";
import { DocsThemeProvider, ThemeToggle } from "../../components/shared/ThemeToggle";
import "../../styles/index.css";

if (typeof window !== "undefined") {
  syncThemeFromStorage();
}

type NavItem = { text: string; link: string };
type SidebarGroup = { text: string; items: NavItem[] };

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function withBase(base: string, link: string): string {
  if (/^https?:\/\//.test(link)) return link;
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  const l = link.startsWith("/") ? link : `/${link}`;
  return `${b}${l}`;
}

function normalizeLink(link: string): string {
  const clean = link.split(/[?#]/, 1)[0] || "/";
  const prefixed = clean.startsWith("/") ? clean : `/${clean}`;
  return prefixed.replace(/\/$/, "") || "/";
}

function isActive(routePath: string, link: string): boolean {
  const route = normalizeLink(routePath);
  const target = normalizeLink(link);
  return route === target || (target !== "/" && route.startsWith(`${target}/`));
}

function childText(children: ComponentChildren): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childText).join("");
  if (typeof children === "object" && "props" in children) {
    return childText((children as { props: { children?: ComponentChildren } }).props.children);
  }
  return "";
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

function createMdxHeadingComponents() {
  const used = new Map<string, number>();
  const heading =
    (Tag: "h2" | "h3") =>
    ({ children, ...props }: JSX.HTMLAttributes<HTMLHeadingElement>) => {
      const base = slugify(childText(children));
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      return (
        <Tag
          {...props}
          id={id}
          class={cn("scroll-mt-24", typeof props.class === "string" ? props.class : undefined)}
        >
          {children}
        </Tag>
      );
    };

  return {
    h2: heading("h2"),
    h3: heading("h3"),
  };
}

function SidebarNav({
  groups,
  routePath,
  base,
  onNavigate,
}: {
  groups: SidebarGroup[];
  routePath: string;
  base: string;
  onNavigate?: () => void;
}): JSX.Element {
  return (
    <nav aria-label="Documentation" class="space-y-6">
      {groups.map((group) => (
        <div key={group.text} class="space-y-2">
          <p class="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.text}
          </p>
          <ul class="m-0 list-none space-y-1 p-0">
            {group.items.map((item) => {
              const active = isActive(routePath, item.link);
              return (
                <li key={item.link}>
                  <a
                    href={withBase(base, item.link)}
                    class={cn(
                      "flex min-h-11 items-center rounded-md border-l-2 px-3 text-sm transition-colors",
                      active
                        ? "border-brand bg-brand/10 font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const Layout: FunctionalComponent<LayoutProps> = ({ site, themeConfig, routePath, page }) => {
  const title = page?.title ? `${page.title} | ${site.title}` : site.title;
  const nav = (themeConfig.nav ?? []) as NavItem[];
  const sidebar = (themeConfig.sidebar ?? []) as SidebarGroup[];
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | undefined>();

  const isPlayground = normalizeLink(routePath) === "/playground";
  const showDocsChrome = !isPlayground;
  const showOutline =
    showDocsChrome && themeConfig.outline !== false && Boolean(page?.headings?.length);

  const visibleSidebar = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sidebar;
    return sidebar
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.text.toLowerCase().includes(normalized)),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, sidebar]);

  const MdxComponent = page?.kind === "mdx" ? page.Component : undefined;
  const mdxComponents = createMdxHeadingComponents();

  useEffect(() => {
    setQuery("");
    setMenuOpen(false);
  }, [routePath]);

  useEffect(() => {
    if (!page?.headings?.length) {
      setActiveHeading(undefined);
      return;
    }
    const update = () => {
      const visible = page.headings
        .map((heading) => document.getElementById(heading.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .filter((el) => el.getBoundingClientRect().top <= 96);
      setActiveHeading(visible.at(-1)?.id ?? page.headings[0]?.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [page?.headings]);

  const content = (() => {
    if (isPlayground) return <PlaygroundLab />;
    if (MdxComponent) {
      return (
        <div class="docs-prose">
          <MdxComponent components={mdxComponents} />
        </div>
      );
    }
    return (
      <main
        class="docs-prose"
        dangerouslySetInnerHTML={{ __html: page?.kind === "markdown" ? page.html : "" }}
      />
    );
  })();

  return (
    <DocsThemeProvider>
      <div class="min-h-screen bg-background text-foreground">
        <title>{title}</title>
        <a class="docs-skip-link" href="#content">
          Skip to content
        </a>

        <header class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div class="mx-auto flex h-[var(--docs-header-height)] max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <a href={withBase(site.base, "/")} class="shrink-0" aria-label={site.title}>
              <BrandLogo label={site.title} base={site.base} />
            </a>
            <span class="hidden rounded-full border border-border px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground sm:inline-flex">
              v0.1 alpha
            </span>
            <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
              {nav.map((item) => {
                const active = isActive(routePath, item.link);
                return (
                  <a
                    key={item.link}
                    href={withBase(site.base, item.link)}
                    class={cn(
                      "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
                      active ? "text-brand-hover" : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.text}
                  </a>
                );
              })}
            </nav>

            <div class="ml-auto flex items-center gap-2">
              {themeConfig.search !== false ? (
                <div class="relative hidden md:block">
                  <input
                    value={query}
                    onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                    placeholder="Search docs..."
                    aria-label="Search documentation"
                    class="h-10 w-56 rounded-md border border-border bg-background pl-3 pr-3 text-sm lg:w-72"
                  />
                </div>
              ) : null}
              <a
                href="https://github.com/kamod-ch/kamod-motion"
                target="_blank"
                rel="noreferrer"
                class="hit-target inline-flex items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
                aria-label="GitHub repository"
              >
                GitHub
              </a>
              <ThemeToggle />
              <button
                type="button"
                class="hit-target inline-flex items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted lg:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? "Close" : "Menu"}
              </button>
            </div>
          </div>
          {menuOpen ? (
            <div class="border-t border-border px-4 py-4 lg:hidden">
              <nav class="mb-4 space-y-1" aria-label="Primary mobile">
                {nav.map((item) => (
                  <a
                    key={item.link}
                    href={withBase(site.base, item.link)}
                    class="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
              {showDocsChrome ? (
                <SidebarNav
                  groups={visibleSidebar}
                  routePath={routePath}
                  base={site.base}
                  onNavigate={() => setMenuOpen(false)}
                />
              ) : null}
            </div>
          ) : null}
        </header>

        <div
          class={cn(
            "mx-auto max-w-[90rem]",
            showDocsChrome
              ? "lg:grid lg:grid-cols-[var(--docs-sidebar-width)_minmax(0,1fr)] xl:grid-cols-[var(--docs-sidebar-width)_minmax(0,1fr)_var(--docs-outline-width)]"
              : "",
          )}
        >
          {showDocsChrome ? (
            <aside class="sticky top-[var(--docs-header-height)] hidden h-[calc(100vh-var(--docs-header-height))] overflow-y-auto border-r border-border p-4 lg:block">
              <SidebarNav groups={visibleSidebar} routePath={routePath} base={site.base} />
            </aside>
          ) : null}

          <div id="content" class="min-w-0">
            {showDocsChrome ? (
              <div class="px-4 py-8 sm:px-6 lg:px-8">
                {page?.title ? (
                  <header class="mb-8 space-y-2">
                    <p class="text-sm text-muted-foreground">Docs</p>
                    <h1 class="text-3xl font-bold tracking-tight text-foreground">{page.title}</h1>
                    {page.description ? (
                      <p class="max-w-3xl text-base text-muted-foreground">{page.description}</p>
                    ) : null}
                  </header>
                ) : null}
                {content}
              </div>
            ) : (
              content
            )}
          </div>

          {showOutline ? (
            <aside class="sticky top-[var(--docs-header-height)] hidden h-[calc(100vh-var(--docs-header-height))] overflow-y-auto p-4 xl:block">
              <p class="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                On this page
              </p>
              <ul class="m-0 list-none space-y-1 p-0">
                {page?.headings?.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      class={cn(
                        "block border-l-2 py-1.5 pl-3 text-sm",
                        activeHeading === heading.id
                          ? "border-brand text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                        heading.level > 2 ? "pl-5" : "",
                      )}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>

        <footer class="border-t border-border py-8 text-center text-sm whitespace-pre-line text-muted-foreground">
          {themeConfig.footer ?? "Released under the MIT License."}
        </footer>
      </div>
    </DocsThemeProvider>
  );
};

export default Layout;
