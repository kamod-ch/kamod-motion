# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> presence quick reopen keeps toast mounted
- Location: e2e/smoke.spec.ts:45:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByTestId('presence-quick-reopen')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "Kamod UI home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic "Kamod UI" [ref=e6]:
        - generic [aria-hidden] [ref=e8]: UI
    - link "Get Started" [ref=e9] [cursor=pointer]:
      - /url: /docs/getting-started
  - main [ref=e12]:
    - region [ref=e13]:
      - paragraph [aria-hidden] [ref=e14]: "404"
      - generic [ref=e15]:
        - heading "Page not found" [level=1] [ref=e16]
        - paragraph [ref=e17]: We couldn’t find that page.
        - navigation "Page recovery" [ref=e18]:
          - link "Back to Home" [ref=e19] [cursor=pointer]:
            - /url: /
          - link "Getting Started" [ref=e23] [cursor=pointer]:
            - /url: /docs/getting-started
  - contentinfo [ref=e26]:
    - generic [ref=e27]: Made for Preact. Built to be yours.
    - link "Explore the Source" [ref=e28] [cursor=pointer]:
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
  40 |   await expect(page.getByRole("heading", { name: "Playground" })).toBeVisible();
  41 |   await page.getByRole("button", { name: "SVG path" }).click();
  42 |   await expect(page.locator("[data-testid='svg-path']")).toBeVisible();
  43 | });
  44 | 
  45 | test("presence quick reopen keeps toast mounted", async ({ page }) => {
  46 |   await page.goto("/presence");
  47 |   const toast = page.getByRole("status");
  48 |   await expect(toast).toBeVisible();
> 49 |   await page.getByTestId("presence-quick-reopen").click();
     |                                                   ^ Error: locator.click: Test timeout of 60000ms exceeded.
  50 |   await expect(toast).toBeVisible();
  51 | });
  52 | 
```