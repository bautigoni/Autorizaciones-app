import { test, expect } from '@playwright/test';
import { loginAs, seedSession, USERS } from './fixtures/auth';

test.describe('Autenticación y guardas de rol', () => {
  test('login válido de familia redirige a /familia', async ({ page }) => {
    await loginAs(page, USERS.family);
    await expect(page).toHaveURL(/\/familia/);
  });

  test('contraseña inválida muestra error y permanece en /login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type=email]').fill(USERS.family);
    await page.locator('input[type=password]').fill('contraseña-incorrecta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('una familia que entra a /cole es redirigida a su propio inicio', async ({ page }) => {
    await seedSession(page, USERS.family);
    await page.goto('/cole');
    // El guard de rol redirige al home del usuario, no a /login.
    await expect(page).toHaveURL(/\/familia/);
  });

  test('logout vuelve a /login y limpia la sesión', async ({ page }) => {
    await seedSession(page, USERS.family);
    await page.goto('/familia');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/login/);
    const stored = await page.evaluate(() => localStorage.getItem('nexoescolar.user'));
    expect(stored).toBeNull();
  });
});
