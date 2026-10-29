import { test, expect } from '@playwright/test';

test.describe('E2E-03: Role-Specific Dashboards & Responsive Drill-down', () => {
  test('Requester dashboard renders metric cards and navigates to ticket details', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'jennifer@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Requester Greeting
    await expect(page.locator('text=Welcome, Jennifer Anderson!')).toBeVisible();

    // Metric cards
    await expect(page.locator('text=My Open')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Resolved')).toBeVisible();
    await expect(page.locator('text=Closed')).toBeVisible();

    // Drill down to My Tickets
    await page.click('button:has-text("View My Tickets")');
    await expect(page.locator('text=My Tickets')).toBeVisible();

    // Return to Dashboard
    await page.click('button:has-text("Dashboard")');
    await expect(page.locator('text=Welcome, Jennifer Anderson!')).toBeVisible();
  });

  test('IT Staff dashboard renders operational metrics, priority breakdown, and queue navigation', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'michael@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Staff Greeting
    await expect(page.locator('text=Welcome back, Michael Scott!')).toBeVisible();

    // Operational Metric Cards
    await expect(page.locator('text=Unassigned')).toBeVisible();
    await expect(page.locator('text=My Assigned')).toBeVisible();
    await expect(page.locator('text=New')).toBeVisible();
    await expect(page.locator('text=Open')).toBeVisible();

    // Priority breakdown
    await expect(page.locator('text=Active Queue By Priority:')).toBeVisible();

    // Drill down to full queue
    await page.click('button:has-text("Full Ticket Queue")');
    await expect(page.locator('text=Queue Overview')).toBeVisible();
  });
});
