import { expect, Page } from '@playwright/test';

async function loginAsManager(page: Page) {
  await page.goto('/login'); // change to '/auth/login' if that's your actual route
  await page.waitForLoadState('domcontentloaded');

  console.log('Login URL:', page.url());
  await page.screenshot({ path: 'test-results/login-debug.png', fullPage: true });

  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('Login page body preview:', bodyText.slice(0, 1500));

  // Find email input (supports both testid and name selector)
  const emailByTestId = page.getByTestId('login-email');
  const emailInput =
    (await emailByTestId.count()) > 0
      ? emailByTestId.first()
      : page.locator('input[name="email"]').first();

  // Find password input
  const passwordByTestId = page.getByTestId('login-password');
  const passwordInput =
    (await passwordByTestId.count()) > 0
      ? passwordByTestId.first()
      : page.locator('input[name="password"]').first();

  await expect(emailInput).toBeVisible({ timeout: 30000 });
  await expect(passwordInput).toBeVisible({ timeout: 30000 });

  await emailInput.fill('manager@test.com');
  await passwordInput.fill('password123');

  // Find submit button
  const submitByTestId = page.getByTestId('login-submit');
  const submitButton =
    (await submitByTestId.count()) > 0
      ? submitByTestId.first()
      : page.getByRole('button', { name: /sign in|login|log in/i }).first();

  await expect(submitButton).toBeVisible({ timeout: 15000 });
  await submitButton.click();

  // Adjust to your actual post-login route if needed
  await expect(page).toHaveURL(/dashboard|properties|app/i, { timeout: 30000 });
}
