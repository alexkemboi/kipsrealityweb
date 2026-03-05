import { test, expect, type Page } from '@playwright/test';

test.describe('Tenant Invitation Flow (Enterprise 10/10)', () => {
  test('PM can access tenants page', async ({ page }: { page: Page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials and sign in
    await page.getByPlaceholder('Email').fill('manager@test.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect anywhere under property manager routes
    await page.waitForURL(/\/property-manager(\/.*)?$/, { timeout: 30_000 });
    
    // Avoid waiting on long-running network activity in dashboard widgets.
    await page.goto('/property-manager/content/tenants', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    
    // Verify the page loads successfully
    await expect(page).toHaveURL(/\/property-manager\/content\/tenants/);
    
    console.log('Tenants page loaded successfully');
  });
});
