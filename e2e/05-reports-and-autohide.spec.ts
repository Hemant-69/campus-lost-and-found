import { test, expect } from "@playwright/test";
import { TEST_IMAGE_BUFFER, loginAs } from "./helpers/testUtils";

test.describe("Journey 7: Post Reporting, 3-Report Auto-Hide & Admin Moderation Queue", () => {
  const spamPostTitle = `Spam Promo Post ${Date.now()}`;
  let spamPostId: string;

  test("Poster creates a suspicious post", async ({ page }) => {
    await loginAs(page, "rahul.sharma@campus.edu", "password123");
    await page.goto("/posts/new");

    await page.click('button:has-text("Found Something")');
    await page.fill('input[name="title"]', spamPostTitle);
    await page.fill('textarea[name="description"]', "Get cheap crypto and gift cards on campus.");
    await page.selectOption('select[name="category"]', "OTHER");
    await page.selectOption('select[name="location"]', "GROUND");
    await page.fill('input[name="locationDetail"]', "Bench");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "spam.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });
    await expect(page.locator('text="Photo uploaded"')).toBeVisible({ timeout: 15000 });

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/posts\/[a-z0-9_-]+/i, { timeout: 15000 });

    spamPostId = page.url().split("/posts/")[1].split("?")[0];
    expect(spamPostId).toBeTruthy();
  });

  test("Post receives 3 distinct reports and becomes auto-hidden", async ({ page }) => {
    // Report 1: Student B (Ananya)
    await loginAs(page, "ananya.patel@campus.edu", "password123");
    await page.goto(`/posts/${spamPostId}`);
    await page.click('button:has-text("Report")');

    let modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('select[name="reason"]').selectOption("SPAM");
    await modal.locator('button:has-text("Submit Report")').click();
    await expect(page.locator('text="Report submitted"')).toBeVisible({ timeout: 10000 });

    // Report 2: Student C (Vikram - once approved or test user)
    // Register temporary reviewer 1
    const id1 = Date.now().toString().slice(-5);
    await page.goto("/register");
    await page.fill('input[id*="name"]', "Reviewer One");
    await page.fill('input[type="email"]', `rev1_${id1}@campus.edu`);
    await page.fill('input[id*="rollNumber"]', `RV1${id1}`);
    await page.fill('input[id*="department"]', "IT");
    await page.selectOption('select[id*="year"]', "2");
    await page.fill('input[type="password"]', "password123");

    let fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    let fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "id.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });
    await expect(page.locator('text="ID photo ready"')).toBeVisible({ timeout: 15000 });
    await page.click('button[type="submit"]');

    // Admin verifies them quickly
    await loginAs(page, "admin@campus.edu", "admin123");
    await page.goto("/admin/verifications");
    const r1 = page.locator(`tr:has-text("rev1_${id1}@campus.edu")`);
    if (await r1.isVisible()) {
      await r1.locator('button:has-text("Approve")').click();
    }

    // Now rev1 files report 2
    await loginAs(page, `rev1_${id1}@campus.edu`, "password123");
    await page.goto(`/posts/${spamPostId}`);
    await page.click('button:has-text("Report")');
    modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('select[name="reason"]').selectOption("SPAM");
    await modal.locator('button:has-text("Submit Report")').click();

    // Register temporary reviewer 2 for report 3
    await page.goto("/register");
    await page.fill('input[id*="name"]', "Reviewer Two");
    await page.fill('input[type="email"]', `rev2_${id1}@campus.edu`);
    await page.fill('input[id*="rollNumber"]', `RV2${id1}`);
    await page.fill('input[id*="department"]', "IT");
    await page.selectOption('select[id*="year"]', "2");
    await page.fill('input[type="password"]', "password123");

    fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "id.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });
    await expect(page.locator('text="ID photo ready"')).toBeVisible({ timeout: 15000 });
    await page.click('button[type="submit"]');

    await loginAs(page, "admin@campus.edu", "admin123");
    await page.goto("/admin/verifications");
    const r2 = page.locator(`tr:has-text("rev2_${id1}@campus.edu")`);
    if (await r2.isVisible()) {
      await r2.locator('button:has-text("Approve")').click();
    }

    // rev2 files report 3
    await loginAs(page, `rev2_${id1}@campus.edu`, "password123");
    await page.goto(`/posts/${spamPostId}`);
    await page.click('button:has-text("Report")');
    modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('select[name="reason"]').selectOption("SPAM");
    await modal.locator('button:has-text("Submit Report")').click();

    // Check feed: the post is now auto-hidden from public browse feed!
    await page.goto("/posts");
    await expect(page.locator(`text="${spamPostTitle}"`)).not.toBeVisible();
  });

  test("Admin manages reports queue and permanently closes spam post", async ({ page }) => {
    await loginAs(page, "admin@campus.edu", "admin123");
    await page.goto("/admin/reports");

    // Spam report row is present in admin moderation queue
    const reportRow = page.locator(`tr:has-text("${spamPostTitle}"), div:has-text("${spamPostTitle}")`).first();
    await expect(reportRow).toBeVisible();

    // Admin resolves report
    await reportRow.locator('button:has-text("Take Action"), button:has-text("Resolve")').click();
  });
});
