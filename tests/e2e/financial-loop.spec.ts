import { test, expect, type APIResponse, type Locator, type Page } from '@playwright/test';
import { PrismaClient, organization_users_role } from '@prisma/client';

const prisma = new PrismaClient();

const E2E_MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL ?? 'manager@test.com';
const E2E_MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD ?? 'password123';
const E2E_TENANT_INVITE_EMAIL =
  process.env.E2E_TENANT_INVITE_EMAIL ?? `tenant.invite+${Date.now()}@example.com`;

// Optional (comma-separated): token,next-auth.session-token,__Secure-next-auth.session-token
const EXPECTED_AUTH_COOKIE_NAMES = (process.env.E2E_AUTH_COOKIE_NAMES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

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
    `Seeded user "${email}" not found within ${timeoutMs}ms. Check seed step, DATABASE_URL, and E2E credentials.`
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
      'User has no organization_users record. /property-manager routes usually require organization membership.'
    );
  }

  if (membership.role !== organization_users_role.PROPERTY_MANAGER) {
    throw new Error(`Expected PROPERTY_MANAGER but found ${membership.role}. Seed data mismatch.`);
  }
}

async function firstVisible(candidates: Locator[], timeout = 3000): Promise<Locator> {
  for (const locator of candidates) {
    if (await locator.isVisible({ timeout }).catch(() => false)) return locator;
  }
  throw new Error('None of the expected UI elements were visible.');
}

async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  const emailInput = await firstVisible([
    page.getByLabel(/email/i),
    page.locator('input[name="email"]'),
    page.locator('input[type="email"]'),
  ]);

  const passwordInput = await firstVisible([
    page.getByLabel(/password/i),
    page.locator('input[name="password"]'),
    page.locator('input[type="password"]'),
  ]);

  await emailInput.fill(email);
  await passwordInput.click();
  await passwordInput.fill(password);
}

async function submitLoginAndCapture(page: Page): Promise<APIResponse | null> {
  const responsePromise = page
    .waitForResponse(
      (res) => {
        const url = res.url();
        return (
          res.request().method() === 'POST' &&
          (url.includes('/api/auth') || url.includes('/login') || url.includes('/signin'))
        );
      },
      { timeout: 15_000 }
    )
    .catch(() => null);

  const submit = await firstVisible([
    page.getByRole('button', { name: /sign in|log in|login/i }),
    page.locator('button[type="submit"]'),
  ]);

  await submit.click();
  return responsePromise;
}

async function assertAuthSucceeded(page: Page, loginResponse: APIResponse | null): Promise<void> {
  if (loginResponse && loginResponse.status() >= 400) {
    let body = '';
    try {
      body = await loginResponse.text();
    } catch {
      // ignore unreadable body
    }
    throw new Error(
      `Login API failed: ${loginResponse.status()} ${loginResponse.url()} ${body ? `| ${body}` : ''}`
    );
  }

  const alert = page.locator('div.bg-red-50 p, .toast-error, [role="alert"]').first();
  if (await alert.isVisible({ timeout: 3000 }).catch(() => false)) {
    const text = (await alert.textContent())?.trim() || '[empty alert]';
    throw new Error(`Login UI error displayed: ${text}`);
  }

  const cookies = await page.context().cookies();
  const cookieNames = cookies.map((c) => c.name);

  if (cookieNames.length === 0) {
    throw new Error(
      'No cookies were set after login. Likely cookie config issue (secure/samesite/domain/path) or login failed.'
    );
  }

  if (EXPECTED_AUTH_COOKIE_NAMES.length > 0) {
    const matched = EXPECTED_AUTH_COOKIE_NAMES.some((n) => cookieNames.includes(n));
    if (!matched) {
      throw new Error(
        `Expected auth cookie in [${EXPECTED_AUTH_COOKIE_NAMES.join(', ')}], got [${cookieNames.join(', ')}].`
      );
    }
  }
}

async function clickRoleOrText(page: Page, roleRegex: RegExp, fallbackText: string): Promise<void> {
  const target = await firstVisible(
    [
      page.getByRole('button', { name: roleRegex }).first(),
      page.getByRole('link', { name: roleRegex }).first(),
      page.getByText(fallbackText, { exact: false }).first(),
    ],
    4000
  );
  await target.click();
}

async function fillFirstVisible(page: Page, value: string, candidates: Locator[]): Promise<Locator> {
  const input = await firstVisible(candidates, 5000);
  await input.fill(value);
  return input;
}

async function selectFirstAvailable(page: Page): Promise<void> {
  const selects = page.locator('select');
  const count = await selects.count();
  if (count === 0) {
    throw new Error(
      'No <select> found for tenant/unit selection. Add a stable selector (data-testid/label) and update the test.'
    );
  }

  for (let i = 0; i < count; i++) {
    const s = selects.nth(i);
    if (!(await s.isVisible().catch(() => false))) continue;

    const options = await s.locator('option').allTextContents();
    if (options.length > 1) {
      await s.selectOption({ index: 1 });
      return;
    }
  }

  throw new Error('Visible <select> elements found, but none had selectable options beyond placeholder.');
}

test.describe('Tenant Invitation Flow', () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('PM can invite a tenant to a unit', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    const debug: Record<string, unknown> = {
      test: testInfo.title,
      managerEmail: E2E_MANAGER_EMAIL,
      inviteEmail: E2E_TENANT_INVITE_EMAIL,
      startedAt: new Date().toISOString(),
    };

    await test.step('Ensure seeded manager exists, is verified, and has PROPERTY_MANAGER role', async () => {
      const user = await waitForSeededManager(E2E_MANAGER_EMAIL);
      debug.managerUserId = user.id;
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

    await test.step('Login as property manager and validate session', async () => {
      await page.goto('/login');

      await fillLoginForm(page, E2E_MANAGER_EMAIL, E2E_MANAGER_PASSWORD);
      const loginResponse = await submitLoginAndCapture(page);

      if (loginResponse) {
        debug.loginApi = { status: loginResponse.status(), url: loginResponse.url() };
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

    await test.step('Open My tenants', async () => {
      await clickRoleOrText(page, /my tenants/i, 'My tenants');

      // Keep route flexible across refactors
      await expect(page).toHaveURL(/\/property-manager\/.*tenant/i, { timeout: 20_000 });
    });

    await test.step('Open tenant invite flow', async () => {
      await clickRoleOrText(page, /invite( a)? tenant/i, 'Invite Tenant');

      // If your UI opens a modal instead of navigating, this still works.
      await expect(
        firstVisible(
          [
            page.getByText(/invite tenant/i).first(),
            page.getByText(/invite a tenant/i).first(),
            page.getByRole('heading', { name: /invite/i }).first(),
          ],
          10_000
        )
      ).resolves.toBeTruthy();
    });

    await test.step('Fill invitation form', async () => {
      // Email field
      await fillFirstVisible(page, E2E_TENANT_INVITE_EMAIL, [
        page.getByLabel(/email/i),
        page.locator('input[name="email"]'),
        page.locator('input[type="email"]'),
      ]);

      // Select tenant/unit/property/lease if a select exists
      await selectFirstAvailable(page);

      // Optional fields (best-effort)
      const nameField = page
        .getByLabel(/name/i)
        .or(page.locator('input[name="fullName"], input[name="name"]'))
        .first();
      if (await nameField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameField.fill('E2E Tenant Invite');
      }
    });

    await test.step('Send invite and verify success', async () => {
      const inviteResponsePromise = page
        .waitForResponse(
          (res) =>
            res.request().method() === 'POST' &&
            (res.url().includes('/invite') || res.url().includes('/invites')),
          { timeout: 15_000 }
        )
        .catch(() => null);

      await clickRoleOrText(page, /send invite|invite tenant|create invite/i, 'Send Invite');

      const inviteResponse = await inviteResponsePromise;
      if (inviteResponse && inviteResponse.status() >= 400) {
        let body = '';
        try {
          body = await inviteResponse.text();
        } catch {
          // ignore
        }
        throw new Error(
          `Invite API failed: ${inviteResponse.status()} ${inviteResponse.url()} ${body ? `| ${body}` : ''}`
        );
      }

      await expect(
        page.getByText(/invite sent|invitation sent|tenant invited|success/i).first()
      ).toBeVisible({ timeout: 20_000 });
    });
  });
});
