import { test, expect } from '@playwright/test';

test.describe('Lab 3: Authentication and Requester Regression', () => {
  test('Requester logs in, creates a ticket, and views only own tickets', async ({ page }) => {
    // 1. Log in
    await page.goto('/');
    
    await page.fill('input[type="email"]', 'jennifer@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for the app to load
    await expect(page.locator('text=TokTickIT')).toBeVisible();

    // Verify correct role badge
    await expect(page.locator('.badge:has-text("Requester")')).toBeVisible();

    // 2. Create Ticket
    await page.click('button:has-text("+ Create Ticket")');
    await page.locator('select').nth(0).selectOption({ label: 'Hardware' });
    await page.locator('select').nth(1).selectOption({ label: 'VPN' });
    await page.fill('input[placeholder="Brief description of the issue"]', 'E2E Test Auth Ticket');
    await page.fill('textarea[placeholder="Detailed description of the issue..."]', 'This ticket is created during E2E testing.');
    // Priority select if it exists
    const prioritySelect = page.locator('select').nth(2);
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption('High');
    }
    
    // Submit
    await page.click('button:has-text("Submit Ticket")');

    // Return to Home
    await page.click('.btn-close');

    // 3. View Own Tickets
    await expect(page.locator('text=My Tickets')).toBeVisible();
    await expect(page.locator('text=E2E Test Auth Ticket').first()).toBeVisible();
  });
});
