import { test, expect } from '@playwright/test';
import { seedSession, USERS } from './fixtures/auth';
import { listAuthorizations } from './fixtures/api';

/**
 * Expired authorizations. The seed inserts one row with status 'expired'
 * (pick-up date 3 days in the past).
 */
test.describe('Autorizaciones vencidas', () => {
  test('una autorización vencida muestra el badge "Vencida"', async ({ page, request }) => {
    const expired = await listAuthorizations(request, '?status=expired');
    expect(expired.length, 'el seed debe incluir una autorización vencida').toBeGreaterThan(0);

    await seedSession(page, USERS.secretary);
    await page.goto('/cole/autorizaciones?status=expired');

    await expect(page.getByText('Vencida', { exact: true }).first()).toBeVisible();
  });

  test('una autorización vencida no ofrece la acción de aprobar', async ({ page, request }) => {
    const expired = await listAuthorizations(request, '?status=expired');
    const id = expired[0].id;

    await seedSession(page, USERS.secretary);
    await page.goto(`/cole/autorizaciones/${id}`);

    await expect(page.getByText('Vencida', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aprobar', exact: true })).toHaveCount(0);
  });
});
