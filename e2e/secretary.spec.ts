import { test, expect } from '@playwright/test';
import { seedSession, USERS } from './fixtures/auth';
import { apiLogin, cancelAuthorization, createPendingAuthorization } from './fixtures/api';

/** Secretariat flows: list filtering, search and cancellation auditing. */
test.describe.configure({ mode: 'serial' });

test('buscar una autorización por su código NE-', async ({ page, request }) => {
  const auth = await createPendingAuthorization(request);

  await seedSession(page, USERS.secretary);
  await page.goto('/cole/autorizaciones');

  await page.getByPlaceholder('Buscar alumno, código, DNI...').fill(auth.code);
  // The table renders both a desktop <table> and hidden mobile cards, so the
  // code appears twice in the DOM — assert on the first (visible) match.
  await expect(page.getByText(auth.code).first()).toBeVisible();
});

test('filtrar la lista por estado', async ({ page }) => {
  await seedSession(page, USERS.secretary);
  await page.goto('/cole/autorizaciones');

  // The status filter is a custom <Select>: open it, then pick an option.
  await page.getByRole('button', { name: /Todos los estados/ }).click();
  await page.getByRole('button', { name: 'Aprobadas', exact: true }).click();

  await expect(page).toHaveURL(/status=approved/);
  await expect(page.getByText('Aprobada', { exact: true }).first()).toBeVisible();
});

test('cancelar una autorización queda reflejado con su auditoría', async ({ page, request }) => {
  const auth = await createPendingAuthorization(request);
  const family = await apiLogin(request, USERS.family);
  await cancelAuthorization(request, auth.id, family.id);

  await seedSession(page, USERS.secretary);
  await page.goto(`/cole/autorizaciones/${auth.id}`);

  await expect(page.getByText('Cancelada', { exact: true })).toBeVisible();
  // Appears twice in the timeline (action label + comment) — assert the first.
  await expect(page.getByText('Cancelada por la familia').first()).toBeVisible();
});
