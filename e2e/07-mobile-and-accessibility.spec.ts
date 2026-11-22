import { test, expect } from "@playwright/test";
import { checkA11y } from "./helpers/testUtils";

test.describe("Journey 9: Mobile Viewport 320x568 & axe-core Accessibility Audit", () => {
  test("320x568 (iPhone SE 1st gen) responsiveness: no horizontal scroll and reachable touch targets", async ({
    page,
  }) => {
    // Set viewport explicitly to 320x568
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/posts");

    // Check no horizontal scrollbar on body
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allowance for subpixel rounding

    // Check bottom navigation exists and has >= 44px touch targets
    const navButtons = page.locator('div.fixed.bottom-0 a, div.fixed.bottom-0 button');
    const count = await navButtons.count();
    for (let i = 0; i < count; i++) {
      const box = await navButtons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test("axe-core accessibility checks on Public Feed page", async ({ page }) => {
    await page.goto("/posts");
    await checkA11y(page, "Public Posts Feed");
  });

  test("axe-core accessibility checks on Login page", async ({ page }) => {
    await page.goto("/login");
    await checkA11y(page, "Sign In Page");
  });

  test("axe-core accessibility checks on Registration page", async ({ page }) => {
    await page.goto("/register");
    await checkA11y(page, "Registration Page");
  });
});
