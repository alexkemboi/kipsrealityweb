import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',

  // Data-sensitive suite: keep deterministic execution
  fullyParallel: false,
  workers: 1,

  // CI safety
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,

  // Keep HTML report for artifact upload; line output can be added via CLI in workflow
  reporter: isCI ? [['html', { open: 'never' }]] : [['html']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Enable these later if needed (slower + more CI resources)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: {
    // IMPORTANT:
    // - Local: use dev server for fast iteration
    // - CI: use production server (requires `npm run build` in workflow first)
    command: isCI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
