import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for Salida Segura / NexoEscolar.
 *
 * The DB is reset as the FIRST step of the webServer command (`db:reset` before
 * `dev`). Playwright starts the webServer before any global setup, so resetting
 * here — while no server holds the SQLite file open — is what keeps the seed
 * data deterministic and avoids Windows file-lock (EBUSY) errors.
 *
 * Run the suite with no other dev server already running on ports 5173/5174.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: /family\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Family flows are mobile-first (bottom nav + FAB). iPhone 13 viewport,
      // Chromium engine so we only need one browser download.
      name: 'mobile',
      testMatch: /family\.spec\.ts/,
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],

  webServer: {
    // Reset+reseed the DB, then start the app. The reset runs before any
    // server opens the file, so the delete never hits a lock.
    command: 'npm run db:reset && npm run dev',
    // Hitting an API route through the Vite proxy proves BOTH servers are up.
    url: 'http://localhost:5173/api/students',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
