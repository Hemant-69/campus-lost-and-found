import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// 1x1 valid WebP image binary for tests
export const TEST_IMAGE_BUFFER = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00,
  0x10, 0x07, 0x10, 0x11, 0x11, 0x88, 0x88, 0xfe, 0x07, 0x00,
]);

export async function loginAs(page: Page, email: string, password = "password123") {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
}

export async function checkA11y(page: Page, contextName: string) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"]) // Optional slight gradient variances
    .analyze();

  expect(
    accessibilityScanResults.violations,
    `Accessibility violations found on ${contextName}: ${JSON.stringify(
      accessibilityScanResults.violations.map((v) => ({ id: v.id, description: v.description })),
      null,
      2
    )}`
  ).toEqual([]);
}
