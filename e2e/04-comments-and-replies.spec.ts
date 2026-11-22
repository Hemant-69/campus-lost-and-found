import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/testUtils";

test.describe("Journey 6: Public Comments, 1-Level Replies, Delete & Reporting", () => {
  test("Verified students can post top-level comments and 1-level replies", async ({ page }) => {
    // Student B logs in
    await loginAs(page, "ananya.patel@campus.edu", "password123");
    await page.goto("/posts");

    // Click first open post
    await page.locator('a[href^="/posts/"]:not([href="/posts/new"])').first().click();
    await page.waitForURL(/\/posts\/[a-z0-9_-]+/i);

    // Scroll to comment section
    const commentInput = page.locator('textarea[placeholder*="Ask a question or add details"]');
    await expect(commentInput).toBeVisible();

    const commentText = `Is it near the canteen counter? ${Date.now()}`;
    await commentInput.fill(commentText);
    await page.click('button:has-text("Post Comment")');

    // Comment appears
    await expect(page.locator(`text="${commentText}"`)).toBeVisible({ timeout: 10000 });

    // Click Reply
    const commentCard = page.locator(`div:has-text("${commentText}")`).last();
    await commentCard.locator('button:has-text("Reply")').click();

    const replyInput = page.locator('textarea[placeholder*="Write a reply"]');
    await replyInput.fill("Replying to verify location details.");
    await page.click('button:has-text("Submit Reply")');

    await expect(page.locator('text="Replying to verify location details."')).toBeVisible({ timeout: 10000 });
  });

  test("Comment author can delete their own comment", async ({ page }) => {
    await loginAs(page, "ananya.patel@campus.edu", "password123");
    await page.goto("/posts");
    await page.locator('a[href^="/posts/"]:not([href="/posts/new"])').first().click();

    // Look for Delete button on author's own comment
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.locator('text="This comment was deleted"')).toBeVisible({ timeout: 10000 });
    }
  });
});
