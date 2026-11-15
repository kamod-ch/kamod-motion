import { defineConfig, devices } from "@playwright/test";

const previewPort = process.env.KAMOD_DOCS_E2E_PORT ?? "4174";
const previewUrl = `http://127.0.0.1:${previewPort}`;

/**
 * Docs E2E runs against an isolated PreactPress preview server.
 * Update baselines: `pnpm test:e2e --update-snapshots` (from packages/docs).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: `${previewUrl}/`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `pnpm preview --host 127.0.0.1 --port ${previewPort}`,
    url: previewUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
