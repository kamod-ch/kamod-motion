import fs from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@kamod-ch/preactpress/config";
import { getThemeInitScript } from "@kamod-ch/themes";
import tailwindcss from "@tailwindcss/vite";
import type { Connect, Plugin } from "vite";

const configDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(configDir, "..");
const base = process.env.VITE_BASE_PATH ?? "/";

const faviconFiles = new Map([["/favicon.svg", { file: "favicon.svg", type: "image/svg+xml" }]]);

function publicUrl(assetPath: string): string {
  const prefix = base === "/" ? "" : base.replace(/\/$/, "");
  return `${prefix}/${assetPath.replace(/^\//, "")}`;
}

function kamodFaviconDevPlugin(): Plugin {
  return {
    name: "kamod-motion-favicon-dev",
    enforce: "pre",
    configureServer(server) {
      const serveKamodFavicon: Connect.NextHandleFunction = (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        const favicon = faviconFiles.get(pathname);

        if (!favicon) {
          next();
          return;
        }

        void fs
          .readFile(join(docsRoot, "public", favicon.file))
          .then((body) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", favicon.type);
            res.setHeader("Cache-Control", "no-store, max-age=0");
            res.end(body);
          })
          .catch(() => next());
      };

      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        stack.unshift({ route: "", handle: serveKamodFavicon });
      } else {
        server.middlewares.use(serveKamodFavicon);
      }
    },
  };
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
    ["link", { rel: "icon", href: publicUrl("favicon.svg"), type: "image/svg+xml" }],
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
    plugins: [kamodFaviconDevPlugin(), tailwindcss()],
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
