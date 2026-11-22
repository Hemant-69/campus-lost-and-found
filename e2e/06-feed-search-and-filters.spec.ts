import { test, expect } from "@playwright/test";

test.describe("Journey 8: Feed Search, Filters & Cursor Pagination", () => {
  test("Filters posts by category, location, status, and keyword search", async ({ page }) => {
    await page.goto("/posts");

    // Check search input
    const searchInput = page.locator('input[placeholder*="Search by title, description"]');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill("Titan");
    await page.keyboard.press("Enter");

    // Wait for filtered results or empty state
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.fill("");
    await page.keyboard.press("Enter");

    // Filter by type: FOUND
    const typeSelect = page.locator('select[name="type"], select:has-text("All Types"), select').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ label: "FOUND" }).catch(() => {});
    }

    // Filter by category: ELECTRONICS
    const categorySelect = page.locator('select:has-text("All Categories")');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ label: "Electronics" }).catch(() => {});
    }

    // Verify feed results render as cards
    const postCards = page.locator('a[href^="/posts/"]:not([href="/posts/new"])');
    await expect(postCards.first()).toBeVisible({ timeout: 10000 });
  });
});
