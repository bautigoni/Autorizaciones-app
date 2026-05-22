import { test, expect } from '@playwright/test';
import { seedSession, USERS } from './fixtures/auth';
import { apiLogin, createAuthorization, listStudents, registerWithdrawal } from './fixtures/api';

/**
 * Gate / portería withdrawal logic.
 *
 * The "gate" role was deliberately removed from the project scope — `/porteria`
 * is NOT wired in App.tsx (GateLayout.tsx and pages/gate/Search.tsx are dead
 * code). So the UI flow is left as test.fixme(); the withdrawal LOGIC is still
 * fully covered via the /withdraw API endpoint.
 */
test.describe('Lógica de retiro (portería)', () => {
  test('una autorización aprobada pasa a "completada" al registrar el retiro', async ({ request }) => {
    const family = await apiLogin(request, USERS.family);
    const preceptor = await apiLogin(request, USERS.preceptor);
    const students = await listStudents(request, family.id);

    const auth = await createAuthorization(request, {
      studentId: students[0].id,
      createdByUserId: family.id,
      status: 'approved',
    });

    const updated = await registerWithdrawal(request, auth.id, preceptor.id);
    expect(updated.status).toBe('completed');
  });

  test('el retiro registrado se ve como "Retirado" en el detalle', async ({ page, request }) => {
    const family = await apiLogin(request, USERS.family);
    const preceptor = await apiLogin(request, USERS.preceptor);
    const students = await listStudents(request, family.id);

    const auth = await createAuthorization(request, {
      studentId: students[0].id,
      createdByUserId: family.id,
      status: 'approved',
    });
    await registerWithdrawal(request, auth.id, preceptor.id);

    await seedSession(page, USERS.secretary);
    await page.goto(`/cole/autorizaciones/${auth.id}`);
    await expect(page.getByText('Retirado', { exact: true })).toBeVisible();
  });

  // Unwire-then-implement: the /porteria route does not exist in App.tsx.
  test.fixme('flujo de portería por UI — /porteria no está conectada en App.tsx', async ({ page }) => {
    await page.goto('/porteria');
    // TODO: cuando se reconecte la ruta /porteria + el rol de portería,
    // implementar: buscar alumno → abrir detalle → "Registrar retiro".
  });
});
