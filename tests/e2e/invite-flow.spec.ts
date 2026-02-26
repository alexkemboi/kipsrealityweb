import { test, expect, type APIResponse, type Page } from '@playwright/test';
import { PrismaClient, organization_users_role } from '@prisma/client';

const prisma = new PrismaClient();

const E2E_MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL ?? 'manager@test.com';
const E2E_MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD ?? 'password123';

// Optional (comma-separated): token,next-auth.session-token,__Secure-next-auth.session-token
const EXPECTED_AUTH_COOKIE_NAMES = (process.env.E2E_AUTH_COOKIE_NAMES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const TID = {
  myTenantsNavBtn: 'my-tenants-nav-btn',
  newTenantInviteBtn: 'new-tenant-invite-btn',
  inviteTenantModal: 'invite-tenant-modal',
  inviteTenantModalTitle: 'invite-tenant-modal-title',
  leaseSelect: 'lease-select',
  inviteEmailInput: 'invite-email-input',
  inviteFirstNameInput: 'invite-first-name-input',
  inviteLastNameInput: 'invite-last-name-input',
  invitePhoneInput: 'invite-phone-input',
  sendInviteBtn: 'send-invite-btn',
  inviteSuccessToast: 'invite-success-toast',
  tenantInvitesTab: 'tenant-invites-tab',
  tenantInvitesTable: 'tenant-invites-table',
} as const;

type SeededManager = {
  id: string;
  emailVerified: Date | null;
};

async function waitForSeededManager(email: string): Promise<SeededManager> {
  const timeoutMs = 15_000;
  const intervalMs = 500;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (user) return user;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `User ${email} not found after ${timeoutMs}ms. Check seed step, DATABASE_URL, and E2E credentials.`
  );
}

async function ensureEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
}

async function assertPropertyManagerMembership(userId: string): Promise<void> {
  const membership = await prisma.organizationUser.findFirst({
    where: { userId },
    select: { role: true, organizationId: true },
  });

  if (!membership) {
    throw new Error(
      'User has no organization_users record. /property-manager routes require organization membership.'
    );
  }

  if (membership.role !== organization_users_role.PROPERTY_MANAGER) {
    throw new Error(
      `Expected PROPERTY_MANAGER role but found ${membership.role}. Seed data mismatch.`
    );
  }
}

async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  const emailInput = page.locator('input[name="email"]').first();
  const passwordInput = page.locator('input[name="password"]').first();

  await expect(emailInput).toBeVisible({ timeout: 15_000 });
  await expect(passwordInput).toBeVisible({ timeout: 15_000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);
}

async function submitLoginAndCapture(page: Page): Promise<APIResponse | null> {
  const responsePromise = page
    .waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        (res.url().includes('/api/auth') ||
          res.url().includes('/login') ||
          res.url().includes('/signin')),
      { timeout: 15_000 }
    )
    .catch(() => null);

  await page.locator('button[type="submit"]').click();
  return responsePromise;
}

async function assertAuthSucceeded(page: Page, loginResponse: APIResponse | null): Promise<void> {
  if (loginResponse && loginResponse.status() >= 400) {
    let body = '';
    try {
      body = await loginResponse.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Login API failed: ${loginResponse.status()} ${loginResponse.url()}${body ? ` | ${body}` : ''}`
    );
  }

  // Check for actual error messages with text content - not just empty containers
  const uiError = page.locator('div.bg-red-50:has(p:text-visible), .toast-error:visible, [role="alert"]:has-text(*):visible').first();
  if (await uiError.isVisible({ timeout: 3000 }).catch(() => false)) {
    const text = (await uiError.textContent())?.trim() || '';
    // Only throw if there's actual error text content
    if (text && text.length > 0 && !text.includes('Loading')) {
      throw new Error(`Login UI error displayed: ${text}`);
    }
  }

  const cookies = await page.context().cookies();
  const cookieNames = cookies.map((c) => c.name);

  // For WebKit/Safari, cookies might not be set due to SameSite policies on localhost
  // Check URL as fallback to verify successful login
  const currentUrl = page.url();
  const isOnDashboard = currentUrl.includes('/property-manager') || currentUrl.includes('/admin') || currentUrl.includes('/tenant');

  if (cookieNames.length === 0 && !isOnDashboard) {
    throw new Error(
      'No cookies were set after login. Likely cookie config issue (secure/samesite/domain/path) or login failed.'
    );
  }

  // If we're on a dashboard URL, login succeeded even without cookies (WebKit case)
  if (isOnDashboard) {
    console.log('Login succeeded (URL-based verification for WebKit)');
    return;
  }

  if (EXPECTED_AUTH_COOKIE_NAMES.length > 0) {
    const matched = EXPECTED_AUTH_COOKIE_NAMES.some((name) => cookieNames.includes(name));
    if (!matched) {
      throw new Error(
        `Expected one of auth cookies [${EXPECTED_AUTH_COOKIE_NAMES.join(', ')}], got [${cookieNames.join(', ')}].`
      );
    }
  }
}

async function waitForLeaseOptions(page: Page): Promise<void> {
  const leaseSelect = page.getByTestId(TID.leaseSelect);
  await expect(leaseSelect).toBeVisible({ timeout: 15_000 });

  await expect
    .poll(
      async () => leaseSelect.locator('option').count(),
      {
        timeout: 20_000,
        message: 'Lease select options did not load in time',
      }
    )
    .toBeGreaterThan(1);
}

test.describe('Tenant Invitation Flow (Enterprise 10/10)', () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('PM can invite a tenant to a unit', async ({ page }, testInfo) => {
    test.setTimeout(120_000);

    const testEmail = `tenant_${Date.now()}_${testInfo.parallelIndex}@example.com`;

    const debug: Record<string, unknown> = {
      test: testInfo.title,
      managerEmail: E2E_MANAGER_EMAIL,
      inviteEmail: testEmail,
      startedAt: new Date().toISOString(),
    };

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.startsWith('DEBUG:')) console.log(`[BROWSER-DEBUG] ${text}`);
    });

    page.on('pageerror', (err) => {
      console.error(`[BROWSER-PAGEERROR] ${err.message}`);
    });

    try {
      await test.step('Ensure seeded manager exists, verified, and has PROPERTY_MANAGER role', async () => {
        const user = await waitForSeededManager(E2E_MANAGER_EMAIL);
        debug.userId = user.id;
        debug.initialEmailVerified = user.emailVerified?.toISOString() ?? null;

        if (!user.emailVerified) {
          await ensureEmailVerified(user.id);
          debug.emailVerifiedByTest = true;
        } else {
          debug.emailVerifiedByTest = false;
        }

        await assertPropertyManagerMembership(user.id);
        debug.roleCheck = 'PROPERTY_MANAGER';
      });

      await test.step('Login and validate authenticated session', async () => {
        await page.goto('/login');

        const pageHtml = await page.content();
        if (pageHtml.includes('Internal Server Error') || pageHtml.includes('Application error')) {
          throw new Error('Server error detected on /login page render. Check CI app/server logs.');
        }

        await fillLoginForm(page, E2E_MANAGER_EMAIL, E2E_MANAGER_PASSWORD);
        const loginResponse = await submitLoginAndCapture(page);

        if (loginResponse) {
          debug.loginApi = {
            status: loginResponse.status(),
            url: loginResponse.url(),
          };
        } else {
          debug.loginApi = 'No matching login POST response captured';
        }

        await assertAuthSucceeded(page, loginResponse);

        debug.urlAfterLoginSubmit = page.url();
        debug.cookiesAfterLogin = (await page.context().cookies()).map((c) => ({
          name: c.name,
          secure: c.secure,
          httpOnly: c.httpOnly,
          domain: c.domain,
          path: c.path,
        }));

        await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 10_000 });
        await expect(page).toHaveURL(/\/property-manager/, { timeout: 30_000 });
      });

      await test.step('Navigate to My tenants', async () => {
        // Use text-based selector for button elements (sidebar uses motion.button, not anchor tags)
        const tenantsLink = page.getByRole('button', { name: /my tenants/i });
        await expect(tenantsLink).toBeVisible({ timeout: 15_000 });
        await tenantsLink.click();
        await expect(page).toHaveURL(/\/property-manager\/content\/tenants/, { timeout: 20_000 });
      });

      await test.step('Open invite modal', async () => {
        await page.getByTestId(TID.newTenantInviteBtn).click();
        await expect(page.getByTestId(TID.inviteTenantModal)).toBeVisible({ timeout: 15_000 });
        await expect(page.getByTestId(TID.inviteTenantModalTitle)).toBeVisible({ timeout: 15_000 });
      });

      await test.step('Fill invitation form deterministically', async () => {
        await waitForLeaseOptions(page);
        await page.getByTestId(TID.leaseSelect).selectOption({ index: 1 });

        await page.getByTestId(TID.inviteEmailInput).fill(testEmail);
        await page.getByTestId(TID.inviteFirstNameInput).fill('Test');
        await page.getByTestId(TID.inviteLastNameInput).fill('Tenant');
        await page.getByTestId(TID.invitePhoneInput).fill('1234567890');
      });

      await test.step('Send invite and verify API success', async () => {
        const inviteResponsePromise = page
          .waitForResponse(
            (res) =>
              res.request().method() === 'POST' &&
              (res.url().includes('/invite') || res.url().includes('/invites')),
            { timeout: 20_000 }
          )
          .catch(() => null);

        const sendButton = page.getByTestId(TID.sendInviteBtn);
        await expect(sendButton).toBeEnabled({ timeout: 10_000 });
        await sendButton.click();

        const inviteResponse = await inviteResponsePromise;
        if (inviteResponse && inviteResponse.status() >= 400) {
          let body = '';
          try {
            body = await inviteResponse.text();
          } catch {
            // ignore
          }
          throw new Error(
            `Invite API failed: ${inviteResponse.status()} ${inviteResponse.url()}${body ? ` | ${body}` : ''}`
          );
        }

        debug.inviteApi = inviteResponse
          ? { status: inviteResponse.status(), url: inviteResponse.url() }
          : 'No matching invite POST response captured';
      });

      await test.step('Verify success UI', async () => {
        await expect(page.getByTestId(TID.inviteSuccessToast)).toBeVisible({ timeout: 25_000 });
      });

      await test.step('Verify invite appears in Invites tab', async () => {
        await page.getByTestId(TID.tenantInvitesTab).click();

        const invitesTable = page.getByTestId(TID.tenantInvitesTable);
        await expect(invitesTable).toBeVisible({ timeout: 15_000 });
        await expect(invitesTable.getByText(testEmail)).toBeVisible({ timeout: 15_000 });
      });

      await test.step('Verify invite persisted in database', async () => {
        const dbInvite = await prisma.invite.findFirst({
          where: { email: testEmail },
          select: {
            id: true,
            email: true,
            accepted: true,
            expiresAt: true,
            role: true,
            organizationId: true,
          },
        });

        if (!dbInvite) {
          throw new Error(`Invite row not found in DB for ${testEmail}`);
        }

        debug.dbInvite = {
          id: dbInvite.id,
          email: dbInvite.email,
          accepted: dbInvite.accepted,
          expiresAt: dbInvite.expiresAt.toISOString(),
          role: dbInvite.role,
          organizationId: dbInvite.organizationId,
        };

        expect(dbInvite.email).toBe(testEmail);
        expect(dbInvite.accepted).toBe(false);
      });
    } catch (error) {
      await testInfo.attach('tenant-invite-debug.json', {
        body: JSON.stringify(debug, null, 2),
        contentType: 'application/json',
      });

      await testInfo.attach('page-url.txt', {
        body: page.url(),
        contentType: 'text/plain',
      });

      await testInfo.attach('page-content.html', {
        body: await page.content(),
        contentType: 'text/html',
      });

      await testInfo.attach('failure-screenshot.png', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      throw error;
    }

    await testInfo.attach('tenant-invite-debug.json', {
      body: JSON.stringify(debug, null, 2),
      contentType: 'application/json',
    });
  });
});
