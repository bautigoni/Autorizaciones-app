import { test, expect } from '@playwright/test';
import { seedSession, USERS } from './fixtures/auth';
import { createPendingAuthorization } from './fixtures/api';

/**
 * Preceptor review flows. Each test pre-creates its own fresh pending row via
 * the API so they don't collide. Serial because they share a DB.
 */
test.describe.configure({ mode: 'serial' });

test('aprobar una solicitud pendiente', async ({ page, request }) => {
  const auth = await createPendingAuthorization(request);

  await seedSession(page, USERS.preceptor);
  await page.goto(`/cole/autorizaciones/${auth.id}`);

  await page.getByRole('button', { name: 'Aprobar', exact: true }).click();

  await expect(page.getByText('Aprobada', { exact: true })).toBeVisible();
  await expect(page.getByText('Aprobada por el colegio')).toBeVisible();
});

test('rechazar una solicitud con comentario', async ({ page, request }) => {
  const auth = await createPendingAuthorization(request);

  await seedSession(page, USERS.preceptor);
  await page.goto(`/cole/autorizaciones/${auth.id}`);

  await page.getByRole('button', { name: 'Rechazar' }).click();
  await page.getByPlaceholder('Escribí un comentario...').fill('Falta el documento adjunto.');
  await page.getByRole('button', { name: 'Confirmar' }).click();

  await expect(page.getByText('Rechazada', { exact: true })).toBeVisible();
  await expect(page.getByText('Falta el documento adjunto.')).toBeVisible();
});

test('observar una solicitud y luego aprobarla', async ({ page, request }) => {
  const auth = await createPendingAuthorization(request);

  await seedSession(page, USERS.preceptor);
  await page.goto(`/cole/autorizaciones/${auth.id}`);

  await page.getByRole('button', { name: 'Observar' }).click();
  await page.getByPlaceholder('Escribí un comentario...').fill('Faltan datos del adulto que retira.');
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('Observada', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Aprobar igualmente' }).click();
  await expect(page.getByText('Aprobada', { exact: true })).toBeVisible();
});
