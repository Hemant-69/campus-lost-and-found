import { test, expect } from "@playwright/test";
import { TEST_IMAGE_BUFFER, loginAs } from "./helpers/testUtils";

test.describe("Journey 4: FOUND Post, Ownership Claim, Approval & Handover Verification", () => {
  const uniqueWatchTitle = `Titan Octane Watch ${Date.now()}`;
  let postId: string;
  let handoverCode: string;

  test("Student A posts a FOUND item with private verification detail", async ({ page }) => {
    // Student A (Rahul Sharma) is verified
    await loginAs(page, "rahul.sharma@campus.edu", "password123");
    await page.goto("/posts/new");

    // Select FOUND type
    await page.click('button:has-text("Found Something"), label:has-text("FOUND")');
    await page.fill('input[name="title"]', uniqueWatchTitle);
    await page.fill(
      'textarea[name="description"]',
      "Found an expensive stainless steel wrist watch near the library steps."
    );
    await page.selectOption('select[name="category"]', "ELECTRONICS");
    await page.selectOption('select[name="location"]', "LIBRARY");
    await page.fill('input[name="locationDetail"]', "Steps near reading hall entrance");

    // Private verification detail (never shown to public)
    await page.fill(
      'input[name="verificationDetail"], textarea[name="verificationDetail"]',
      "Engraved initials R.K. on the back cover"
    );

    // Upload item photo
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "watch.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });
    await expect(page.locator('text="Photo uploaded"')).toBeVisible({ timeout: 15000 });

    // Submit post
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/posts\/[a-z0-9_-]+/i, { timeout: 15000 });

    postId = page.url().split("/posts/")[1].split("?")[0];
    expect(postId).toBeTruthy();

    // Verify private detail is visible to owner
    await expect(page.locator('text="Engraved initials R.K. on the back cover"')).toBeVisible();
  });

  test("Student B claims the item; verification detail remains concealed", async ({ page }) => {
    // Student B (Ananya Patel) is verified
    await loginAs(page, "ananya.patel@campus.edu", "password123");
    await page.goto(`/posts/${postId}`);

    // Verification detail is NOT visible to Student B
    await expect(page.locator('text="Engraved initials R.K. on the back cover"')).not.toBeVisible();

    // Student B clicks "This is mine" / Claim
    await page.click('button:has-text("This is Mine"), button:has-text("Claim This Item")');

    // Fill claim modal
    const modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('textarea[name="description"]').fill("This is my father's gift, a silver Titan watch with blue dial.");
    await modal.locator('textarea[name="verificationAnswer"], input[name="verificationAnswer"]').fill("It has R.K. engraved on the steel back.");

    await modal.locator('button[type="submit"]:has-text("Submit Claim")').click();
    await expect(page.locator('text="Claim submitted successfully"')).toBeVisible({ timeout: 10000 });
  });

  test("Student A reviews claim, approves it, handover code is generated", async ({ page }) => {
    await loginAs(page, "rahul.sharma@campus.edu", "password123");
    await page.goto(`/posts/${postId}`);

    // Open Claims Tab
    await page.click('button:has-text("Claims")');

    // Verify Claimant answer is visible to poster
    await expect(page.locator('text="It has R.K. engraved on the steel back."')).toBeVisible();

    // Poster clicks Approve
    await page.click('button:has-text("Approve Claim")');
    await expect(page.locator('text="CLAIM IN PROGRESS"')).toBeVisible({ timeout: 10000 });
  });

  test("Student B retrieves 6-digit code, Student A enters it to mark item RETURNED", async ({
    page,
  }) => {
    // Student B logs in to retrieve code from My Claims
    await loginAs(page, "ananya.patel@campus.edu", "password123");
    await page.goto("/my-claims");

    const codeLocator = page.locator('[data-testid="handover-code"], .font-mono');
    await expect(codeLocator).toBeVisible();
    handoverCode = (await codeLocator.innerText()).trim();
    expect(handoverCode).toMatch(/^\d{6}$/);

    // Student A (Poster) meets claimant and enters handover code
    await loginAs(page, "rahul.sharma@campus.edu", "password123");
    await page.goto(`/posts/${postId}`);

    await page.click('button:has-text("Complete Handover"), button:has-text("Enter Handover Code")');
    const modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('input[placeholder*="6-digit"]').fill(handoverCode);
    await modal.locator('button:has-text("Confirm Handover")').click();

    // Post status updates to RETURNED
    await expect(page.locator('text="RETURNED"')).toBeVisible({ timeout: 10000 });
  });
});
