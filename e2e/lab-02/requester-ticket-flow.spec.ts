import { test, expect } from '@playwright/test';

test.describe('Requester Ticket Flow (Lab 2)', () => {
  test('Complete responsive submission flow (E2E-01, AC-01)', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // 1. Unauthenticated -> Should see Development Requester Selector
    await expect(page.getByText(/Select Development Requester/i)).toBeVisible();

    // Select the first requester in the list
    // Wait for the select to be enabled and populated
    await page.locator('select').waitFor({ state: 'visible' });
    // Assuming the first real option is index 1 (index 0 is "Select a requester")
    await page.locator('select').selectOption({ index: 1 });
    
    await page.getByRole('button', { name: /Continue/i }).click();

    // 2. Authenticated -> Should see My Tickets
    await expect(page.getByText(/My Tickets/i)).toBeVisible();

    // 3. Create a new ticket
    await page.getByRole('button', { name: /Create Ticket/i }).click();
    await expect(page.getByText(/Create New Ticket/i)).toBeVisible();

    // Wait for categories to load by checking for the 'Hardware' option
    await expect(page.locator('select option', { hasText: 'Hardware' })).toBeAttached();
    await page.locator('select').selectOption({ label: 'Hardware' }); // Category
    await page.getByPlaceholder('e.g., Email, VPN, SAP').fill('E2E Test System');
    await page.getByPlaceholder('Brief description of the issue').fill('E2E Test Summary');
    await page.getByPlaceholder('Detailed description of the issue...').fill('E2E Test Description that is long enough.');

    // Submit
    await expect(page.getByRole('button', { name: /Submit Ticket/i })).toBeEnabled();
    await page.getByRole('button', { name: /Submit Ticket/i }).click();

    // Debugging: wait a bit and check if we are still on the form or if there are validation errors
    // If the form is invalid, the `.is-invalid` class will appear
    await expect(page.locator('.is-invalid')).toHaveCount(0);

    // Debugging: check if there's a danger alert
    const errorAlert = page.locator('.alert-danger');
    if (await errorAlert.count() > 0) {
      console.log("ERROR ALERT:", await errorAlert.textContent());
    }

    // 4. Verify Success Alert with Ticket Number
    // The alert contains "Success! Your ticket has been created."
    await expect(page.locator('.alert-success')).toContainText(/Your ticket has been created/i, { timeout: 10000 });
    await expect(page.locator('.alert-success')).toContainText(/T-/);

    // Click Go Back to My Tickets (Actually in App it's an X button or just home, wait, there is no "Go back to My Tickets" button! The view just goes back to home.)
    // We can just verify the new ticket appears in the table.
    
    // The new ticket should appear in the table
    await expect(page.getByText('E2E Test Summary').first()).toBeVisible();
  });
});
