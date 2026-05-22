import { test, expect } from '@playwright/test';
import { seedSession, USERS } from './fixtures/auth';

/**
 * Family flows — runs on the iPhone 13 (mobile) project only.
 * Serial: the second test verifies the request created by the first.
 */
test.describe.configure({ mode: 'serial' });

let createdCode = '';

test('crear una autorización de retiro de principio a fin', async ({ page }) => {
  await seedSession(page, USERS.family);
  await page.goto('/familia/autorizaciones/nueva');

  // Step 1 — choose the student
  await page.getByRole('button', { name: /Sofía Martínez/ }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 2 — date/time/reason (seeded defaults are valid: today / 15:00 / Turno médico)
  await expect(page.getByText('¿Cuándo y por qué?')).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 3 — quién retira (a saved adult is preselected for this family)
  await expect(page.getByText('¿Quién retira?')).toBeVisible();
  await page.getByRole('button', { name: 'Crear autorización' }).click();

  // Confirmation screen with the generated NE- code
  await expect(page).toHaveURL(/\/familia\/autorizaciones\/confirmada\/\d+/);
  await expect(page.getByText('¡Solicitud enviada!')).toBeVisible();

  const codeText = await page.getByText(/NE-\d{4}/).first().innerText();
  createdCode = codeText.match(/NE-\d{4}/)![0];
  expect(createdCode).toMatch(/^NE-\d{4}$/);
});

test('la nueva solicitud aparece en la lista como pendiente', async ({ page }) => {
  expect(createdCode, 'el test anterior debe haber creado un código').toMatch(/^NE-\d{4}$/);

  await seedSession(page, USERS.family);
  await page.goto('/familia/autorizaciones');

  const card = page.locator('a', { hasText: createdCode });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Pendiente');
});

test('validación: no se puede avanzar sin elegir un alumno', async ({ page }) => {
  await seedSession(page, USERS.family);
  await page.goto('/familia/autorizaciones/nueva');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Elegí un alumno/a')).toBeVisible();
});

test('validación: DNI inválido del adulto que retira', async ({ page }) => {
  await seedSession(page, USERS.family);
  await page.goto('/familia/autorizaciones/nueva');

  await page.getByRole('button', { name: /Sofía Martínez/ }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Switch to manual adult entry and submit an invalid DNI
  await page.getByRole('button', { name: 'Cargar nuevo' }).click();
  await page.getByPlaceholder('Ej. Marina González').fill('Adulto de Prueba');
  await page.getByPlaceholder('00000000').fill('123');
  await page.getByPlaceholder('abuela, tío...').fill('tío');
  // Scroll past the fixed mobile bottom-nav so it doesn't intercept the click.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('button', { name: 'Crear autorización' }).click();

  await expect(page.getByText('DNI inválido')).toBeVisible();
});
