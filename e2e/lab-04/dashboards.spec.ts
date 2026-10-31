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
    await expect(page.locator('[data-testid="metric-open"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-resolved"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-closed"]')).toBeVisible();

    // Drill down to My Tickets
    await page.click('button:has-text("View My Tickets")');
    await expect(page.locator('h2:has-text("My Tickets")')).toBeVisible();

    // Return to Dashboard
    await page.click('button[aria-label="Dashboard"]');
    await expect(page.locator('text=Welcome, Jennifer Anderson!')).toBeVisible();
  });

  test('IT Staff dashboard renders operational metrics, priority breakdown, and queue navigation', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'it1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Staff Greeting
    await expect(page.locator('text=Welcome back, IT Staff One!')).toBeVisible();

    // Operational Metric Cards
    await expect(page.locator('[data-testid="metric-unassigned"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-my-assigned"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-new"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-open"]')).toBeVisible();

    // Priority breakdown
    await expect(page.locator('text=Active Queue By Priority:')).toBeVisible();

    // Drill down to full queue
    await page.click('button:has-text("View Full Queue")');
    await expect(page.locator('h2:has-text("IT Staff Ticket Queue")')).toBeVisible();
  });
});
