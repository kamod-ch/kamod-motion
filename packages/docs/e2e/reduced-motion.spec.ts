import { expect, test } from "@playwright/test";

test.describe("reduced motion policies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hooks/use-reduced-motion");
    await expect(page.getByTestId("reduced-motion-status")).toBeVisible();
  });

  test("user policy follows OS preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "user", exact: true }).click();
    await expect(page.getByTestId("reduced-motion-status")).toContainText("policy: user");
    await expect(page.getByTestId("reduced-motion-status")).toContainText("reduced: yes");
    await expect(page.getByTestId("reduced-motion-panel")).toContainText("opacity only");
  });

  test("always policy forces reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.getByRole("button", { name: "always", exact: true }).click();
    await expect(page.getByTestId("reduced-motion-status")).toContainText("reduced: yes");
    await expect(page.getByTestId("reduced-motion-panel")).toContainText("opacity only");
  });

  test("never policy keeps full motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "never", exact: true }).click();
    await expect(page.getByTestId("reduced-motion-status")).toContainText("reduced: no");
    await expect(page.getByTestId("reduced-motion-panel")).toContainText("Full slide-up");
  });
});
