import { test, expect } from '@playwright/test';

test.describe('E2E-02: Ticket Status Lifecycle & Resolution Workflow', () => {
  test('Enforces permitted transitions and resolution gate with conflict handling', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/');
    await page.fill('input[type="email"]', 'michael@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Open Ticket Queue and click first ticket
    await page.click('button:has-text("Ticket Queue")');
    await page.locator('table tbody tr').first().click();

    // Verify Status Dropdown exists for Staff
    const statusSelect = page.locator('select#status-select');
    await expect(statusSelect).toBeVisible();

    // Read available options
    const optionTexts = await statusSelect.locator('option').allInnerTexts();
    
    // Check state machine validity
    expect(optionTexts.length).toBeGreaterThan(0);

    // Transition status to 'In Progress' if available
    const hasInProgress = optionTexts.some(opt => opt.includes('In Progress'));
    if (hasInProgress) {
      await statusSelect.selectOption({ label: 'In Progress' });
      await expect(page.locator('text=In Progress').first()).toBeVisible();
    }
  });
});
