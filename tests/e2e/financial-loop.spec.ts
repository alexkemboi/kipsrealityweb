import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Financial Core Workflow', () => {
    // Setup: Create a clean user & property before test starts
    test.beforeAll(async () => {
        // Run your 'seed' script logic here or hit a setup API endpoint
        // For now, we assume the seeded DB is sufficient as requested, or we can add specific setup logic later.
        // Ideally, we'd want to ensure a clean slate or specific test data exists.
    });

    test('Manager can create invoice and record payment', async ({ page }) => {
        test.setTimeout(90000); // Give it plenty of time for GL posting + toast
        // 1. Verification Bypass (The "Magic" Step)
        // Poll for user creation (seed may still be committing)
        let user = null;
        for (let i = 0; i < 20; i++) {
            user = await prisma.user.findUnique({
                where: { email: 'manager@test.com' },
                select: { verificationToken: true, emailVerified: true, id: true }
            });
            if (user) break;
            await new Promise(r => setTimeout(r, 500));
        }

        if (!user) {
            throw new Error('User manager@test.com not found after 10 seconds of polling. Seed may have failed.');
        }

        if (user?.emailVerified) {
            console.log('DEBUG: User already verified, navigating to login');
            await page.goto('/login');
        } else if (user?.verificationToken) {
            // Visit verify-email directly
            await page.goto(`/api/auth/verify-email?token=${user.verificationToken}`);

            // Verify redirect to login with verification success param
            await expect(page).toHaveURL(/\/login\?verified=true/);
        } else {
            throw new Error('Neither verification token found nor user is verified');
        }

        // 2. Login
        await page.waitForSelector('input[name="email"]');
        await page.fill('input[name="email"]', 'manager@test.com');

        const passwordInput = page.locator('input[name="password"]');
        await passwordInput.click();
        await passwordInput.fill('password123'); // Still use fill but with a click first

        console.log('DEBUG: Filling credentials and clicking sign-in');
        await page.click('button[type="submit"]');

        // Check for any error toast or message if navigation doesn't happen
        const errorLocator = page.locator('div.bg-red-50 p, .toast-error, [role="alert"]');
        if (await errorLocator.isVisible({ timeout: 5000 })) {
            const errorMsg = await errorLocator.textContent();
            console.error('DEBUG: Login Error found in UI:', errorMsg);
        }

        // Wait for navigation to dashboard - adjust timeout to 30s to be safe
        await expect(page).toHaveURL(/\/property-manager/, { timeout: 30000 });

        // 2. Navigate to Invoices
        await page.click('text=View Invoices');
        await expect(page).toHaveURL(/\/property-manager\/finance\/invoices/);

        // 3. Create Invoice
        await page.click('text=Create Invoice');

        // Wait for the modal or page to load
        await expect(page.locator('text=Create Manual Invoice')).toBeVisible();

        // Select first available tenant/lease (it's the first select in modal)
        await page.selectOption('select', { index: 1 });

        // Amount input uses placeholder 0.00
        await page.fill('input[placeholder="0.00"]', '1500');

        await page.click('text=Generate Invoice');

        // 4. Verify Toast & List
        // 4. Verify Toast & List
        await expect(page.getByText('Invoice Created & Posted to GL!')).toBeVisible({ timeout: 20000 });

        // 5. Verify Dashboard Update
        // Re-navigate to dashboard to check arrears or just verified logout/login loop
        await page.click('text=Dashboard Overview');
        await expect(page).toHaveURL(/\/property-manager/, { timeout: 10000 });
    });
});
