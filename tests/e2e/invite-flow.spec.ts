import { test, expect } from '@playwright/test';

const E2E_MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL ?? 'manager@test.com';
const E2E_MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD;

if (!E2E_MANAGER_PASSWORD) {
  throw new Error('E2E_MANAGER_PASSWORD environment variable must be set for E2E tests.');
}
test.describe('Tenant Invitation Flow (Enterprise 10/10)', () => {
  test.describe.configure({ timeout: 120_000 });

  test('PM can access tenants page', async ({ page }) => {
    // Navigate to login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Fill credentials and sign in
    await page.getByPlaceholder('Email').fill(E2E_MANAGER_EMAIL);
    await page.getByPlaceholder('Password').fill(E2E_MANAGER_PASSWORD);

    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );

    await Promise.all([
      page.waitForURL(/\/property-manager(\/.*)?$/, { timeout: 60_000 }),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);

    const loginResponse = await loginResponsePromise;
    expect(loginResponse.ok()).toBeTruthy();
    
    // Wait for redirect anywhere under property manager routes
    await page.goto('/property-manager/content/tenants', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    
    // Verify the page loads successfully
    await expect(page).toHaveURL(/\/property-manager\/content\/tenants/);
    
    console.log('Tenants page loaded successfully');
  });
});
