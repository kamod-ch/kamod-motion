import { expect, test } from "@playwright/test";
import { assertNoBlockingA11yViolations } from "./a11y-utils";

const KEY_PAGES = [
  { route: "/", name: "introduction" },
  { route: "/getting-started/", name: "getting started" },
  { route: "/motion", name: "motion" },
  { route: "/accessibility", name: "accessibility" },
  { route: "/playground/", name: "playground" },
] as const;

for (const { route, name } of KEY_PAGES) {
  test(`${name} has no blocking a11y violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await assertNoBlockingA11yViolations(page, name, { include: "#content" });
  });
}
