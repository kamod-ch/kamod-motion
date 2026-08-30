import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/getting-started/",
  "/mini-vs-hybrid",
  "/motion",
  "/presence",
  "/hooks/use-animate",
  "/hooks/use-reduced-motion",
  "/presets",
  "/values",
  "/svg",
  "/ssr",
  "/accessibility",
  "/playground/",
  "/bundle-sizes",
] as const;

for (const route of ROUTES) {
  test(`smoke: ${route} loads`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("#content")).toBeVisible();
  });
}

test("motion page demo toggles panel", async ({ page }) => {
  await page.goto("/motion");
  const toggle = page.getByRole("button", { name: /Hide panel|Show panel/ });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByText("Fade + scale")).toBeHidden();
  await toggle.click();
  await expect(page.getByText("Fade + scale")).toBeVisible();
});

test("playground switches demos", async ({ page }) => {
  await page.goto("/playground/");
  await expect(page.getByRole("heading", { name: "Playground" })).toBeVisible();
  await page.getByRole("button", { name: "SVG path" }).click();
  await expect(page.locator("[data-testid='svg-path']")).toBeVisible();
});

test("presence quick reopen keeps toast mounted", async ({ page }) => {
  await page.goto("/presence");
  const toast = page.getByRole("status");
  await expect(toast).toBeVisible();
  await page.getByTestId("presence-quick-reopen").click();
  await expect(toast).toBeVisible();
});
