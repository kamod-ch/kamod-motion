import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@kamod-ch/preactpress/config";
import { getThemeInitScript } from "@kamod-ch/themes";
import tailwindcss from "@tailwindcss/vite";

const configDir = dirname(fileURLToPath(import.meta.url));
const isGithubPages =
  process.env.GITHUB_ACTIONS === "true" || process.env.KAMOD_DOCS_BASE === "github-pages";
const base = process.env.VITE_BASE_PATH ?? (isGithubPages ? "/kamod-motion/" : "/");

function publicUrl(assetPath: string): string {
  const prefix = base === "/" ? "" : base.replace(/\/$/, "");
  return `${prefix}/${assetPath.replace(/^\//, "")}`;
}

export default defineConfig({
  theme: "./theme/Layout.tsx",
  srcExclude: [
    "README.md",
    "dist/**",
    "components/**",
    "data/**",
    "styles/**",
    "public/**",
    "e2e/**",
    "node_modules/**",
  ],
  site: {
    title: "kamod motion",
    description:
      "Preact-first animation primitives built on Vanilla Motion. Mini engine by default, hybrid opt-in.",
    url: "https://kamod-ch.github.io/kamod-motion/",
    base,
  },
  markdown: {
    html: false,
    linkify: true,
    typographer: true,
  },
  head: [
    ["link", { rel: "icon", href: `${base}favicon.svg`, type: "image/svg+xml" }],
    ["link", { rel: "apple-touch-icon", href: `${base}favicon.svg` }],
    ["link", { rel: "stylesheet", href: publicUrl("styles/logo.css") }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
      },
    ],
    ["script", { type: "text/javascript" }, getThemeInitScript({ defaultScheme: "system" })],
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["preact", "preact/hooks", "@preact/signals", "motion", "motion/mini"],
    },
    ssr: {
      noExternal: [
        "@kamod-ch/brand",
        "@kamod-ch/motion",
        "@kamod-ch/themes",
        "@preact/signals",
        "preact",
        "preact/hooks",
      ],
    },
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    footer: "Released under the MIT License.\n\nCopyright © 2026 Klaus Zahiragic - www.kamod.ch",
    editLink: {
      text: "Edit this page",
      pattern: "https://github.com/kamod-ch/kamod-motion/edit/main/packages/docs/:path",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kamod-ch/kamod-motion",
        ariaLabel: "kamod motion on GitHub",
      },
    ],
    nav: [
      { text: "Docs", link: "/" },
      { text: "Playground", link: "/playground/" },
      { text: "Bundle sizes", link: "/bundle-sizes" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Installation", link: "/getting-started/" },
          { text: "Mini vs hybrid", link: "/mini-vs-hybrid" },
        ],
      },
      {
        text: "Components",
        items: [
          { text: "Motion", link: "/motion" },
          { text: "Presence", link: "/presence" },
        ],
      },
      {
        text: "Hooks",
        items: [
          { text: "useAnimate", link: "/hooks/use-animate" },
          { text: "useReducedMotion", link: "/hooks/use-reduced-motion" },
        ],
      },
      {
        text: "Utilities",
        items: [
          { text: "Presets", link: "/presets" },
          { text: "Values", link: "/values" },
          { text: "SVG", link: "/svg" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "SSR", link: "/ssr" },
          { text: "Accessibility", link: "/accessibility" },
          { text: "Bundle sizes", link: "/bundle-sizes" },
          { text: "Playground", link: "/playground/" },
        ],
      },
    ],
  },
});
