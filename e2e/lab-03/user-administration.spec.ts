import { test, expect } from '@playwright/test';

test.describe('Lab 3: User Administration', () => {
  test('Administrator logs in and creates a new user', async ({ page }) => {
    // 1. Log in as Admin
    await page.goto('/');
    
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. View Users
    await expect(page.locator('h2:has-text("Administrator User Management")')).toBeVisible();

    // 3. Open Create Modal
    await page.click('button:has-text("+ Create New User")');
    await expect(page.locator('.modal-title:has-text("Create New User")')).toBeVisible();

    // 4. Fill form
    const uniqueEmail = `newuser${Date.now()}@toktickit.com`;
    await page.fill('#create-name', 'E2E New User');
    await page.fill('#create-email', uniqueEmail);
    await page.selectOption('#create-role', 'IT Staff');
    await page.fill('#create-password', 'password123');

    // 5. Submit
    await page.click('div.modal-footer button:has-text("Create User")');

    // 6. Verify user appears in list
    // The user list should reload and the modal should close
    await expect(page.locator('.modal-title:has-text("Create New User")')).not.toBeVisible();
    
    // Search for the new user
    await page.fill('input[placeholder="Search by name or email..."]', uniqueEmail);
    // There isn't an explicit search button, it auto-fetches or we press enter
    await page.press('input[placeholder="Search by name or email..."]', 'Enter');

    await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();
  });
});
