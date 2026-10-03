import { test, expect } from '@playwright/test';

test.describe('Lab 3: Staff Ticket Flow', () => {
  test('Staff logs in, views queue, claims ticket, and posts internal note', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/');
    
    await page.fill('input[type="email"]', 'it1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. View Queue
    await expect(page.locator('h2:has-text("IT Staff Ticket Queue")')).toBeVisible();

    // Wait for tickets to load and click the first one
    await page.waitForSelector('table tbody tr');
    await page.locator('table tbody tr').first().click();

    // 3. Claim Ticket (if unassigned)
    // We check if the claim button exists. If it does, we click it.
    const claimButton = page.locator('button:has-text("Claim")');
    if (await claimButton.isVisible()) {
      await claimButton.click();
    }

    // 4. Update Status and Priority
    await page.selectOption('select.form-select.fw-bold', 'In Progress');

    // 5. Post Internal Note
    await page.click('button:has-text("Add Internal Note")');
    await page.fill('textarea[placeholder*="internal note"]', 'Investigating this issue now.', { force: true });
    await page.click('button:has-text("Save Internal Note")', { force: true });

    // Verify note appears
    await expect(page.locator('text=Investigating this issue now.').first()).toBeVisible();
    await expect(page.locator('.badge:has-text("Internal Note")').first()).toBeVisible();
  });
});
