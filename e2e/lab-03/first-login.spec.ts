import { test, expect } from '@playwright/test';

test.describe('Lab 3: Mandatory Password Change', () => {
  test('Initial password login and change', async ({ page, request }) => {
    // Reset newuser password and mustChangePassword state via Admin API so this test is completely idempotent
    try {
      const adminLogin = await request.post('/api/auth/login', {
        data: { email: 'admin@example.com', password: 'password123' }
      });
      if (adminLogin.ok()) {
        const usersRes = await request.get('/api/users?search=newuser@example.com');
        if (usersRes.ok()) {
          const usersData = await usersRes.json();
          const usersList = Array.isArray(usersData) ? usersData : usersData.data || [];
          const newuser = usersList.find((u: any) => u.email === 'newuser@example.com');
          if (newuser) {
            await request.post(`/api/users/${newuser.id}/reset-password`, {
              data: { newPassword: 'password123' }
            });
          }
        }
        await request.post('/api/auth/logout');
      }
    } catch {
      // Fallback if API request setup fails
    }

    // 1. Log in with user that has mustChangePassword = true
    await page.goto('/');
    
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // Login with correct password
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password Update Required')).toBeVisible();

    // Log out from the change password screen
    await page.click('button:has-text("Cancel and Logout")');
    await expect(page.locator('text=TokTickIT Login')).toBeVisible();
  });
});
