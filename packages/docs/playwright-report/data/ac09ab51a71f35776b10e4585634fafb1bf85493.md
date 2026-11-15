# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> playground switches demos
- Location: e2e/smoke.spec.ts:38:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Playground' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Playground' }) with timeout 15000ms
  - waiting for getByRole('heading', { name: 'Playground' })

```

```yaml
- banner:
  - link "Kamod UI home":
    - /url: /
  - link "Get Started":
    - /url: /docs/getting-started
- main:
  - region "Page not found":
    - heading "Page not found" [level=1]
    - paragraph: We couldn’t find that page.
    - navigation "Page recovery":
      - link "Back to Home":
        - /url: /
      - link "Getting Started":
        - /url: /docs/getting-started
- contentinfo:
  - text: Made for Preact. Built to be yours.
  - link "Explore the Source":
    - /url: https://github.com/kamod-ch/kamod-ui
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const ROUTES = [
  4  |   "/",
  5  |   "/getting-started/",
  6  |   "/mini-vs-hybrid",
  7  |   "/motion",
  8  |   "/presence",
  9  |   "/hooks/use-animate",
  10 |   "/hooks/use-reduced-motion",
  11 |   "/presets",
  12 |   "/values",
  13 |   "/svg",
  14 |   "/ssr",
  15 |   "/accessibility",
  16 |   "/playground/",
  17 |   "/bundle-sizes",
  18 | ] as const;
  19 | 
  20 | for (const route of ROUTES) {
  21 |   test(`smoke: ${route} loads`, async ({ page }) => {
  22 |     await page.goto(route);
  23 |     await expect(page.locator("h1").first()).toBeVisible();
  24 |     await expect(page.locator("#content")).toBeVisible();
  25 |   });
  26 | }
  27 | 
  28 | test("motion page demo toggles panel", async ({ page }) => {
  29 |   await page.goto("/motion");
  30 |   const toggle = page.getByRole("button", { name: /Hide panel|Show panel/ });
  31 |   await expect(toggle).toBeVisible();
  32 |   await toggle.click();
  33 |   await expect(page.getByText("Fade + scale")).toBeHidden();
  34 |   await toggle.click();
  35 |   await expect(page.getByText("Fade + scale")).toBeVisible();
  36 | });
  37 | 
  38 | test("playground switches demos", async ({ page }) => {
  39 |   await page.goto("/playground/");
> 40 |   await expect(page.getByRole("heading", { name: "Playground" })).toBeVisible();
     |                                                                   ^ Error: expect(locator).toBeVisible() failed
  41 |   await page.getByRole("button", { name: "SVG path" }).click();
  42 |   await expect(page.locator("[data-testid='svg-path']")).toBeVisible();
  43 | });
  44 | 
  45 | test("presence quick reopen keeps toast mounted", async ({ page }) => {
  46 |   await page.goto("/presence");
  47 |   const toast = page.getByRole("status");
  48 |   await expect(toast).toBeVisible();
  49 |   await page.getByTestId("presence-quick-reopen").click();
  50 |   await expect(toast).toBeVisible();
  51 | });
  52 | 
```