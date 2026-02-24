import { test, expect, type APIResponse, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["warn", "error"] });

const E2E_MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL ?? "manager@test.com";
const E2E_MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD ?? "password123";

const EXPECTED_AUTH_COOKIE_NAMES = (process.env.E2E_AUTH_COOKIE_NAMES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const TID = {
  myTenantsNavBtn: "my-tenants-nav-btn",
  newTenantInviteBtn: "new-tenant-invite-btn",
  inviteTenantModal: "invite-tenant-modal",
  inviteTenantModalTitle: "invite-tenant-modal-title",
  leaseSelect: "lease-select",
  inviteEmailInput: "invite-email-input",
  inviteFirstNameInput: "invite-first-name-input",
  inviteLastNameInput: "invite-last-name-input",
  invitePhoneInput: "invite-phone-input",
  sendInviteBtn: "send-invite-btn",
  inviteSuccessToast: "invite-success-toast",
  tenantInvitesTab: "tenant-invites-tab",
  tenantInvitesTable: "tenant-invites-table",
} as const;

type SeededManager = {
  id: string;
  emailVerified: Date | null;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitForDbReady(): Promise<void> {
  const timeoutMs = 20_000;
  const intervalMs = 500;
  const started = Date.now();
  let lastErr: unknown = null;

  while (Date.now() - started < timeoutMs) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (e) {
      lastErr = e;
      await sleep(intervalMs);
    }
  }

  throw new Error(
    `DB not ready after ${timeoutMs}ms.${
      lastErr instanceof Error ? ` Last DB error: ${lastErr.message}` : ""
    }`
  );
}

async function waitForSeededManager(email: string): Promise<SeededManager> {
  const timeoutMs = 20_000;
  const intervalMs = 500;
  const started = Date.now();
  let lastError: unknown = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, emailVerified: true },
      });

      if (user) return user;
    } catch (err) {
      lastError = err;
    }

    await sleep(intervalMs);
  }

  throw new Error(
    `User ${email} not found after ${timeoutMs}ms. Check seed step, DATABASE_URL, and E2E credentials.${
      lastError instanceof Error ? ` Last DB error: ${lastError.message}` : ""
    }`
  );
}

async function ensureEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
}

async function assertPropertyManagerMembership(userId: string): Promise<void> {
  const memberships = await (prisma as any).organizationUser.findMany({
    where: { userId },
    select: { role: true, organizationId: true },
    take: 10,
  });

  if (!memberships?.length) {
    throw new Error(
      "User has no organization_users record. /property-manager routes require organization membership."
    );
  }

  const isPm = memberships.some((m: any) => String(m.role) === "PROPERTY_MANAGER");
  if (!isPm) {
    throw new Error(
      `User is not a PROPERTY_MANAGER. Found memberships: ${memberships
        .map((m: any) => `${m.role}@${m.organizationId}`)
        .join(", ")}`
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
        res.request().method() === "POST" &&
        (res.url().includes("/api/auth") ||
          res.url().includes("/api/login") ||
          res.url().includes("/login") ||
          res.url().includes("/signin")),
      { timeout: 20_000 }
    )
    .catch(() => null);

  await page.locator('button[type="submit"]').click();
  return responsePromise;
}

async function assertAuthSucceeded(page: Page, loginResponse: APIResponse | null): Promise<void> {
  if (loginResponse && loginResponse.status() >= 400) {
    let body = "";
    try {
      body = await loginResponse.text();
    } catch {
      // ignore
    }

    throw new Error(
      `Login API failed: ${loginResponse.status()} ${loginResponse.url()}${body ? ` | ${body}` : ""}`
    );
  }

  const uiError = page.locator("div.bg-red-50 p, .toast-error, [role='alert']").first();
  if (await uiError.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const text = (await uiError.textContent())?.trim() || "[empty alert]";
    throw new Error(`Login UI error displayed: ${text}`);
  }

  await page.waitForTimeout(250);

  const cookies = await page.context().cookies();
  const cookieNames = cookies.map((c) => c.name);

  if (cookieNames.length === 0) {
    throw new Error(
      "No cookies were set after login. Likely cookie config issue (secure/samesite/domain/path) or login failed."
    );
  }

  if (EXPECTED_AUTH_COOKIE_NAMES.length > 0) {
    const matched = EXPECTED_AUTH_COOKIE_NAMES.some((name) => cookieNames.includes(name));
    if (!matched) {
      throw new Error(
        `Expected one of auth cookies [${EXPECTED_AUTH_COOKIE_NAMES.join(", ")}], got [${cookieNames.join(", ")}].`
      );
    }
  }
}

async function waitForLeaseOptions(page: Page): Promise<void> {
  const leaseSelect = page.getByTestId(TID.leaseSelect);

  await expect(leaseSelect).toBeVisible({ timeout: 20_000 });

  await expect
    .poll(() => leaseSelect.locator("option").count(), {
      timeout: 25_000,
      message: "Lease select options did not load in time",
    })
    .toBeGreaterThan(1);
}

test.describe("Tenant Invitation Flow", () => {
  test.beforeAll(async () => {
    await waitForDbReady();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("PM can invite a tenant to a unit", async ({ page }, testInfo) => {
    test.setTimeout(140_000);

    const testEmail = `tenant_${Date.now()}_${testInfo.parallelIndex}@example.com`;

    const debug: Record<string, unknown> = {
      test: testInfo.title,
      managerEmail: E2E_MANAGER_EMAIL,
      inviteEmail: testEmail,
      startedAt: new Date().toISOString(),
      expectedAuthCookies: EXPECTED_AUTH_COOKIE_NAMES,
    };

    const browserConsole: string[] = [];

    page.on("console", (msg) => {
      browserConsole.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on("pageerror", (err) => {
      browserConsole.push(`[pageerror] ${err.message}`);
    });

    try {
      await test.step("Verify seeded PM user", async () => {
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
        debug.roleCheck = "PROPERTY_MANAGER";
      });

      await test.step("Login", async () => {
        await page.goto("/login", { waitUntil: "domcontentloaded" });

        const pageHtml = await page.content();
        if (pageHtml.includes("Internal Server Error") || pageHtml.includes("Application error")) {
          throw new Error("Server error detected on /login page render. Check CI app/server logs.");
        }

        await fillLoginForm(page, E2E_MANAGER_EMAIL, E2E_MANAGER_PASSWORD);
        const loginResponse = await submitLoginAndCapture(page);

        debug.loginApi = loginResponse
          ? { status: loginResponse.status(), url: loginResponse.url() }
          : "No matching login POST response captured";

        await assertAuthSucceeded(page, loginResponse);

        debug.urlAfterLoginSubmit = page.url();
        debug.cookiesAfterLogin = (await page.context().cookies()).map((c) => ({
          name: c.name,
          secure: c.secure,
          httpOnly: c.httpOnly,
          domain: c.domain,
          path: c.path,
          sameSite: c.sameSite,
        }));

        await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
        await expect(page).toHaveURL(/\/property-manager/, { timeout: 40_000 });
      });

      await test.step("Open tenants page", async () => {
        await page.getByTestId(TID.myTenantsNavBtn).click();
        await expect(page).toHaveURL(/\/property-manager\/content\/tenants/, { timeout: 25_000 });
      });

      await test.step("Open invite modal", async () => {
        await page.getByTestId(TID.newTenantInviteBtn).click();
        await expect(page.getByTestId(TID.inviteTenantModal)).toBeVisible({ timeout: 20_000 });
        await expect(page.getByTestId(TID.inviteTenantModalTitle)).toBeVisible({ timeout: 20_000 });
      });

      await test.step("Fill invite form", async () => {
        await waitForLeaseOptions(page);
        await page.getByTestId(TID.leaseSelect).selectOption({ index: 1 });

        await page.getByTestId(TID.inviteEmailInput).fill(testEmail);
        await page.getByTestId(TID.inviteFirstNameInput).fill("Test");
        await page.getByTestId(TID.inviteLastNameInput).fill("Tenant");
        await page.getByTestId(TID.invitePhoneInput).fill("+12065551234");
      });

      await test.step("Submit invite", async () => {
        const inviteResponsePromise = page
          .waitForResponse(
            (res) =>
              res.request().method() === "POST" &&
              (res.url().includes("/invite") || res.url().includes("/invites")),
            { timeout: 25_000 }
          )
          .catch(() => null);

        const sendButton = page.getByTestId(TID.sendInviteBtn);
        await expect(sendButton).toBeEnabled({ timeout: 15_000 });
        await sendButton.click();

        const inviteResponse = await inviteResponsePromise;

        debug.inviteApi = inviteResponse
          ? { status: inviteResponse.status(), url: inviteResponse.url() }
          : "No matching invite POST response captured";

        if (inviteResponse && inviteResponse.status() >= 400) {
          let body = "";
          try {
            body = await inviteResponse.text();
          } catch {
            // ignore
          }

          throw new Error(
            `Invite API failed: ${inviteResponse.status()} ${inviteResponse.url()}${body ? ` | ${body}` : ""}`
          );
        }
      });

      await test.step("Verify success UI", async () => {
        await expect(page.getByTestId(TID.inviteSuccessToast)).toBeVisible({ timeout: 30_000 });
      });

      await test.step("Verify invite in table", async () => {
        await page.getByTestId(TID.tenantInvitesTab).click();

        const invitesTable = page.getByTestId(TID.tenantInvitesTable);
        await expect(invitesTable).toBeVisible({ timeout: 20_000 });
        await expect(invitesTable.getByText(testEmail)).toBeVisible({ timeout: 20_000 });
      });

      await test.step("Verify invite in DB", async () => {
        const timeoutMs = 10_000;
        const started = Date.now();
        let dbInvite: any = null;

        while (Date.now() - started < timeoutMs) {
          dbInvite = await (prisma as any).invite.findFirst({
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

          if (dbInvite) break;
          await sleep(300);
        }

        if (!dbInvite) {
          throw new Error(`Invite row not found in DB for ${testEmail} after ${timeoutMs}ms`);
        }

        debug.dbInvite = {
          id: dbInvite.id,
          email: dbInvite.email,
          accepted: dbInvite.accepted,
          expiresAt: dbInvite.expiresAt ? new Date(dbInvite.expiresAt).toISOString() : null,
          role: dbInvite.role,
          organizationId: dbInvite.organizationId,
        };

        expect(dbInvite.email).toBe(testEmail);
        expect(Boolean(dbInvite.accepted)).toBe(false);
      });
    } catch (error) {
      debug.browserConsole = browserConsole.slice(-200);
      debug.finalUrl = page.url();

      await testInfo.attach("tenant-invite-debug.json", {
        body: JSON.stringify(debug, null, 2),
        contentType: "application/json",
      });

      await testInfo.attach("page-content.html", {
        body: await page.content(),
        contentType: "text/html",
      });

      await testInfo.attach("failure-screenshot.png", {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      throw error;
    }

    debug.browserConsole = browserConsole.slice(-200);
    debug.finalUrl = page.url();

    await testInfo.attach("tenant-invite-debug.json", {
      body: JSON.stringify(debug, null, 2),
      contentType: "application/json",
    });
  });
});
