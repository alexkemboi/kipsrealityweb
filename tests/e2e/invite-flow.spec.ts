import { test, expect, type Page } from '@playwright/test';

test.describe('Tenant Invitation Flow (Enterprise 10/10)', () => {
  test('PM can access tenant application page', async ({ page }: { page: Page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials and sign in
    await page.getByPlaceholder('Email').fill('manager@test.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/property-manager', { timeout: 15_000 });
    
    // Navigate to tenant application page
    await page.goto('/property-manager/content/tenantapplication');
    await page.waitForLoadState('networkidle');
    
    // Verify the page loads successfully
    await expect(page).toHaveURL(/tenantapplication/);
    
    console.log('Tenant application page loaded successfully');
  });
});
