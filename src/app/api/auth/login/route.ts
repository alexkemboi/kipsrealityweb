import { expect, Page } from "@playwright/test";

type LoginOptions = {
  email?: string;
  password?: string;
  expectedUrl?: RegExp;
};

export async function loginAsManager(
  page: Page,
  options: LoginOptions = {}
): Promise<void> {
  const email = options.email ?? process.env.E2E_MANAGER_EMAIL ?? "manager@test.com";
  const password = options.password ?? process.env.E2E_MANAGER_PASSWORD ?? "password123";
  const expectedUrl = options.expectedUrl ?? /property-manager|dashboard|properties|app/i;

  let loginApiStatus: number | null = null;
  let loginApiBodyPreview = "";

  const responseListener = async (response: any) => {
    if (response.url().includes("/api/auth/login")) {
      loginApiStatus = response.status();
      try {
        const ct = response.headers()["content-type"] || "";
        if (ct.includes("application/json")) {
          const json = await response.json();
          loginApiBodyPreview = JSON.stringify(json).slice(0, 1200);
        } else {
          const text = await response.text();
          loginApiBodyPreview = text.slice(0, 1200);
        }
      } catch {
        loginApiBodyPreview = "<unable to read login response body>";
      }
    }
  };

  page.on("response", responseListener);

  try {
    await page.goto("/login"); // change to '/auth/login' if that is your actual route
    await page.waitForLoadState("domcontentloaded");

    console.log("Login URL:", page.url());
    await page.screenshot({ path: "test-results/login-debug.png", fullPage: true });

    const bodyText = await page.locator("body").innerText().catch(() => "");
    console.log("Login page body preview:", bodyText.slice(0, 1500));

    if (/internal server error/i.test(bodyText) || /application error/i.test(bodyText)) {
      throw new Error(`Login page rendered a server error page.\nPreview:\n${bodyText.slice(0, 1000)}`);
    }

    if (/modulebuilderror|export .* doesn't exist/i.test(bodyText)) {
      throw new Error(`Login page likely failed to compile.\nPreview:\n${bodyText.slice(0, 1200)}`);
    }

    const emailByTestId = page.getByTestId("login-email");
    const emailInput =
      (await emailByTestId.count()) > 0
        ? emailByTestId.first()
        : page.locator('input[name="email"], input[type="email"]').first();

    const passwordByTestId = page.getByTestId("login-password");
    const passwordInput =
      (await passwordByTestId.count()) > 0
        ? passwordByTestId.first()
        : page.locator('input[name="password"], input[type="password"]').first();

    await expect(emailInput).toBeVisible({ timeout: 30000 });
    await expect(passwordInput).toBeVisible({ timeout: 30000 });

    await emailInput.fill(email);
    await passwordInput.fill(password);

    const submitByTestId = page.getByTestId("login-submit");
    const submitButton =
      (await submitByTestId.count()) > 0
        ? submitByTestId.first()
        : page.getByRole("button", { name: /sign in|login|log in/i }).first();

    await expect(submitButton).toBeVisible({ timeout: 15000 });

    await submitButton.click();

    // Wait for navigation or auth API activity
    await Promise.race([
      page.waitForURL(expectedUrl, { timeout: 30000 }),
      page.waitForResponse((res) => res.url().includes("/api/auth/login"), { timeout: 30000 }),
      page.waitForResponse((res) => res.url().includes("/api/auth/me"), { timeout: 30000 }),
    ]);

    // STRICT-MODE SAFE login UI error check (avoids matching Next route announcer)
    const errorLocator = page.locator("div.bg-red-50 p, .toast-error").first();
    if (await errorLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
      const errorMsg = (await errorLocator.textContent())?.trim();
      console.error("DEBUG: Login Error found in UI:", errorMsg);
    }

    const twoFaPrompt = page.getByText(/two-factor|verification code|enter your code/i);
    if (
      (await twoFaPrompt.count()) > 0 &&
      (await twoFaPrompt.first().isVisible().catch(() => false))
    ) {
      throw new Error(
        `Login requires 2FA for this test user. Disable 2FA for E2E seed user or extend test to handle 2FA.\n` +
          `Login API status: ${loginApiStatus ?? "unknown"}\n` +
          `Login API body: ${loginApiBodyPreview || "<empty>"}`
      );
    }

    await expect(page).toHaveURL(expectedUrl, { timeout: 30000 });
  } catch (err) {
    const currentUrl = page.url();
    const currentBody = await page.locator("body").innerText().catch(() => "");
    await page.screenshot({ path: "test-results/login-after-submit-failed.png", fullPage: true });

    throw new Error(
      [
        `Login did not reach expected route.`,
        `Expected URL pattern: ${expectedUrl}`,
        `Current URL: ${currentUrl}`,
        `Login API status: ${loginApiStatus ?? "unknown"}`,
        `Login API body preview: ${loginApiBodyPreview || "<empty>"}`,
        `Page body preview: ${currentBody.slice(0, 1500)}`,
        `Original error: ${err instanceof Error ? err.message : String(err)}`,
      ].join("\n\n")
    );
  } finally {
    page.off("response", responseListener);
  }
}
