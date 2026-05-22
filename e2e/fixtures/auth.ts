import { type Page, expect } from '@playwright/test';

/** Demo accounts seeded by server/db/seed.ts (password is always `demo`). */
export const USERS = {
  family: 'maria@familia.edu',     // María González — guardian of Sofía, Tomás, Mateo
  family2: 'pablo@familia.edu',    // Pablo Ruiz
  preceptor: 'preceptor@cole.edu', // Andrea López
  secretary: 'secretaria@cole.edu',// Carlos Pérez
} as const;

export const PASSWORD = 'demo';

/** Logs in through the real login UI and waits until we leave /login. */
export async function loginAs(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(url => !url.pathname.startsWith('/login'));
}

/**
 * Fast path: authenticates via the API and injects the user into
 * localStorage['nexoescolar.user'] before any app code runs. The caller
 * navigates afterwards. Use this for tests that aren't exercising the login UI.
 */
export async function seedSession(page: Page, email: string): Promise<void> {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password: PASSWORD },
  });
  expect(res.ok(), `seedSession: login ${email} failed`).toBeTruthy();
  const { user } = await res.json();
  await page.addInitScript(u => {
    window.localStorage.setItem('nexoescolar.user', JSON.stringify(u));
  }, user);
}
