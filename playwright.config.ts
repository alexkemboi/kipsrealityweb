import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load test env vars for local E2E runs while preserving explicit CI env.
const envFromFile = dotenv.config({ path: ".env.test", override: false }).parsed ?? {};

const appBaseUrl = process.env.NEXTAUTH_URL || "http://127.0.0.1:3000";

process.env.NEXTAUTH_URL = appBaseUrl;
process.env.NEXT_PUBLIC_API_URL = appBaseUrl;

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["html", { open: "never" }], ["github"]] : [["html"]],

  use: {
    baseURL: appBaseUrl,
    trace: isCI ? "retain-on-failure" : "on-first-retry",
    screenshot: "only-on-failure",
    video: isCI ? "off" : "retain-on-failure",
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        actionTimeout: 20_000,
        navigationTimeout: 45_000,
      },
    },

    // WebKit skipped - timing issues on Windows
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     actionTimeout: 45_000,
    //     navigationTimeout: 90_000,
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  webServer: {
    // CI runs production server -> workflow MUST run `npm run build` first
    command: "npm run dev",
    url: appBaseUrl,
    env: {
      ...process.env,
      ...envFromFile,
      HOSTNAME: "127.0.0.1",
      PORT: "3000",
      NEXTAUTH_URL: appBaseUrl,
      NEXT_PUBLIC_API_URL: appBaseUrl,
      DATABASE_URL: process.env.DATABASE_URL || envFromFile.DATABASE_URL || "",
    },
    reuseExistingServer: !isCI,
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
