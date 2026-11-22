import { test, expect } from "@playwright/test";
import { TEST_IMAGE_BUFFER, loginAs } from "./helpers/testUtils";

test.describe("Journey 5: LOST Post, 'I Found This' Flow & Chat Messaging with Polling", () => {
  const lostItemTitle = `Lost Dell Charger ${Date.now()}`;
  let lostPostId: string;
  let conversationId: string;

  test("Student A posts a LOST item", async ({ page }) => {
    await loginAs(page, "rahul.sharma@campus.edu", "password123");
    await page.goto("/posts/new");

    await page.click('button:has-text("Lost Something"), label:has-text("LOST")');
    await page.fill('input[name="title"]', lostItemTitle);
    await page.fill('textarea[name="description"]', "Left my 65W Dell Type-C laptop charger in Block A.");
    await page.selectOption('select[name="category"]', "ELECTRONICS");
    await page.selectOption('select[name="location"]', "BLOCK_A");
    await page.fill('input[name="locationDetail"]', "Lab 3, second row");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "charger.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });
    await expect(page.locator('text="Photo uploaded"')).toBeVisible({ timeout: 15000 });

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/posts\/[a-z0-9_-]+/i, { timeout: 15000 });

    lostPostId = page.url().split("/posts/")[1].split("?")[0];
    expect(lostPostId).toBeTruthy();
  });

  test("Student B taps 'I Found This', opens chat thread and sends message", async ({ page }) => {
    await loginAs(page, "ananya.patel@campus.edu", "password123");
    await page.goto(`/posts/${lostPostId}`);

    // Click "I Found This" / "Message Poster"
    await page.click('button:has-text("I Found This"), button:has-text("Message Poster")');

    // Fill initial message
    const modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('textarea, input[name="message"]').fill("Hey, I picked up your Dell charger and left it with the lab attendant!");
    await modal.locator('button:has-text("Send Message")').click();

    // Redirects to conversation page
    await page.waitForURL(/\/messages\/[a-z0-9_-]+/i, { timeout: 15000 });
    conversationId = page.url().split("/messages/")[1].split("?")[0];
    expect(conversationId).toBeTruthy();

    await expect(page.locator('text="Hey, I picked up your Dell charger"')).toBeVisible();
  });

  test("Student A receives message via polling, unread count clears when viewed", async ({ page }) => {
    await loginAs(page, "rahul.sharma@campus.edu", "password123");

    // Check inbox shows unread count
    await page.goto("/messages");
    const convoRow = page.locator(`a[href*="/messages/${conversationId}"]`);
    await expect(convoRow).toBeVisible();

    // Verify unread badge is present
    const unreadBadge = convoRow.locator('.bg-brand-600, .bg-rose-600, [aria-label*="unread"]');
    await expect(unreadBadge).toBeVisible();

    // Open conversation: marks messages as read
    await convoRow.click();
    await page.waitForURL(`/messages/${conversationId}`);
    await expect(page.locator('text="Hey, I picked up your Dell charger"')).toBeVisible();

    // Reply back
    await page.fill('textarea[placeholder*="Type a message"], input[placeholder*="message"]', "Thank you so much! I will collect it today.");
    await page.click('button:has-text("Send"), button[aria-label="Send message"]');

    await expect(page.locator('text="Thank you so much! I will collect it today."')).toBeVisible();

    // Return to inbox: unread count is cleared
    await page.goto("/messages");
    const updatedRow = page.locator(`a[href*="/messages/${conversationId}"]`);
    const badgeAfter = updatedRow.locator('.bg-brand-600, .bg-rose-600');
    await expect(badgeAfter).not.toBeVisible();
  });
});
