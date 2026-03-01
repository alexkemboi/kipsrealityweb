import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["html", { open: "never" }], ["github"]] : [["html"]],

  use: {
    baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: isCI
    ? [
        {
          name: "chromium",
          use: {
            ...devices["Desktop Chrome"],
            actionTimeout: 15_000,
            navigationTimeout: 30_000,
          },
        },
      ]
    : [
        {
          name: "chromium",
          use: {
            ...devices["Desktop Chrome"],
            actionTimeout: 15_000,
            navigationTimeout: 30_000,
          },
        },
        {
          name: "firefox",
          use: {
            ...devices["Desktop Firefox"],
            actionTimeout: 20_000,
            navigationTimeout: 45_000,
          },
        },
        {
          name: "webkit",
          use: {
            ...devices["Desktop Safari"],
            actionTimeout: 25_000,
            navigationTimeout: 60_000,
          },
        },
      ],

  webServer: {
    // CI runs production server -> workflow MUST run `npm run build` first
    command: "npm run dev",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
