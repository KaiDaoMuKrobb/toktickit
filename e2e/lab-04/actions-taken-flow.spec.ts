import { test, expect } from '@playwright/test';

test.describe('E2E-01: Actions Taken Logging and Role Boundary Flow', () => {
  test('IT Staff adds Action Taken, Requester views in read-only mode', async ({ page }) => {
    // 1. IT Staff Login
    await page.goto('/');
    await page.fill('input[type="email"]', 'michael@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for Dashboard
    await expect(page.locator('text=Welcome back, Michael Scott!')).toBeVisible();

    // Navigate to Ticket Queue
    await page.click('button:has-text("Ticket Queue")');
    await expect(page.locator('text=Queue Overview')).toBeVisible();

    // Click on the first ticket to view detail
    const firstTicketRow = page.locator('table tbody tr').first();
    await firstTicketRow.click();

    // Verify Ticket Detail and Actions Taken Section
    await expect(page.locator('h5:has-text("Actions Taken")')).toBeVisible();
    const addActionBtn = page.locator('button:has-text("Add Action Taken")');
    await expect(addActionBtn).toBeVisible();

    // Click Add Action Taken
    await addActionBtn.click();
    await expect(page.locator('h5:has-text("Add Action Taken")')).toBeVisible();

    // Fill form
    await page.fill('textarea#description', 'Replaced thermal paste and dusted internal cooling heatsinks');
    await page.fill('textarea#result', 'CPU temperature normalized to 42C');
    
    // Check follow-up required
    await page.click('input#followUpRequired');
    await expect(page.locator('textarea#followUpNote')).toBeVisible();
    await page.fill('textarea#followUpNote', 'Check fan noise level during tomorrow afternoon shift');

    // Save Action
    await page.click('button:has-text("Save Action")');

    // Verify Action is listed in the table
    await expect(page.locator('text=Replaced thermal paste and dusted internal cooling heatsinks').first()).toBeVisible();
    await expect(page.locator('text=Michael Scott').first()).toBeVisible();

    // Logout
    await page.click('button:has-text("Logout")');

    // 2. Requester Login
    await page.fill('input[type="email"]', 'jennifer@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Welcome, Jennifer Anderson!')).toBeVisible();

    // Open first recent ticket or go to My Tickets
    await page.click('button:has-text("My Tickets")');
    const requesterTicketRow = page.locator('table tbody tr').first();
    if (await requesterTicketRow.isVisible()) {
      await requesterTicketRow.click();
      
      // In Ticket Detail, Actions Taken should be read-only for Requester
      await expect(page.locator('h5:has-text("Actions Taken")')).toBeVisible();
      await expect(page.locator('button:has-text("Add Action Taken")')).not.toBeVisible();
      await expect(page.locator('button:has-text("Edit")')).not.toBeVisible();
    }
  });
});
