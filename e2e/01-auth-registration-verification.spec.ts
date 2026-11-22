import { test, expect } from "@playwright/test";
import { TEST_IMAGE_BUFFER, loginAs } from "./helpers/testUtils";

test.describe("Journey 1-3: Student Registration, Admin Moderation & ID Verification", () => {
  const uniqueId = Date.now().toString().slice(-6);
  const studentEmail = `student_${uniqueId}@campus.edu`;
  const rollNumber = `ROLL${uniqueId}`;

  test("1. Register with ID photo, observe PENDING banner, confirm post creation is blocked", async ({
    page,
  }) => {
    await page.goto("/register");

    await page.fill('input[id*="name"], input[placeholder*="Full Name"]', "Test Student One");
    await page.fill('input[type="email"]', studentEmail);
    await page.fill('input[id*="rollNumber"], input[placeholder*="Roll Number"]', rollNumber);
    await page.fill('input[id*="department"], input[placeholder*="Department"]', "Computer Science");
    await page.selectOption('select[id*="year"]', "2");
    await page.fill('input[type="password"]', "password123");

    // Upload ID card image
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "student_id.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });

    // Wait for upload confirmation
    await expect(page.locator('text="ID photo ready"')).toBeVisible({ timeout: 15000 });

    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForURL("/posts", { timeout: 15000 });

    // Confirm Pending Verification banner is shown
    const banner = page.locator('text="Your account is waiting for verification"');
    await expect(banner).toBeVisible();

    // Confirm navigating to /posts/new or attempting to post is blocked
    await page.goto("/posts/new");
    await expect(page.locator('text="Verification Pending"')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test("2. Admin approves student verification, student receives notification and can post", async ({
    page,
  }) => {
    // Login as Admin
    await loginAs(page, "admin@campus.edu", "admin123");
    await page.goto("/admin/verifications");

    // Locate the newly registered student in queue
    const studentRow = page.locator(`tr:has-text("${studentEmail}")`);
    await expect(studentRow).toBeVisible({ timeout: 10000 });

    // Click Approve
    await studentRow.locator('button:has-text("Approve")').click();
    await expect(studentRow).not.toBeVisible({ timeout: 10000 });

    // Logout and log back in as student
    await page.goto("/login");
    await loginAs(page, studentEmail, "password123");

    // Check notifications
    await page.goto("/notifications");
    await expect(page.locator('text="Account Approved"')).toBeVisible();

    // Verify student can now access post creation form
    await page.goto("/posts/new");
    await expect(page.locator('text="Verification Pending"')).not.toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test("3. Admin rejects student with reason, student sees reason and re-uploads ID", async ({
    page,
  }) => {
    const rejectedEmail = `reject_${uniqueId}@campus.edu`;
    const rejectedRoll = `REJ${uniqueId}`;

    // Register 2nd student
    await page.goto("/register");
    await page.fill('input[id*="name"], input[placeholder*="Full Name"]', "Reject Candidate");
    await page.fill('input[type="email"]', rejectedEmail);
    await page.fill('input[id*="rollNumber"], input[placeholder*="Roll Number"]', rejectedRoll);
    await page.fill('input[id*="department"], input[placeholder*="Department"]', "Civil Engineering");
    await page.selectOption('select[id*="year"]', "1");
    await page.fill('input[type="password"]', "password123");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click('button:has-text("Upload Photograph"), input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "blurry_id.webp",
      mimeType: "image/webp",
      buffer: TEST_IMAGE_BUFFER,
    });
    await expect(page.locator('text="ID photo ready"')).toBeVisible({ timeout: 15000 });
    await page.click('button[type="submit"]');
    await page.waitForURL("/posts", { timeout: 15000 });

    // Admin logs in and rejects
    await loginAs(page, "admin@campus.edu", "admin123");
    await page.goto("/admin/verifications");

    const row = page.locator(`tr:has-text("${rejectedEmail}")`);
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('button:has-text("Reject")').click();

    // Fill rejection reason in modal
    const modal = page.locator('[role="dialog"], .fixed');
    await modal.locator('textarea, input[placeholder*="reason"]').fill("ID photo was blurry and roll number was illegible.");
    await modal.locator('button:has-text("Confirm Rejection")').click();

    // Student logs in and sees rejection reason
    await loginAs(page, rejectedEmail, "password123");
    await page.goto("/profile");
    await expect(page.locator('text="ID photo was blurry and roll number was illegible."')).toBeVisible();

    // Re-upload button is accessible
    const reuploadBtn = page.locator('button:has-text("Re-upload ID Card"), a:has-text("Re-upload")');
    await expect(reuploadBtn).toBeVisible();
  });
});
