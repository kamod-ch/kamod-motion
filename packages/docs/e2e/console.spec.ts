import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/motion", "/playground/"] as const;

for (const route of ROUTES) {
  test(`no console errors on ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(500);

    expect(errors, `Console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}
