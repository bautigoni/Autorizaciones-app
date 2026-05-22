import { type APIRequestContext, expect } from '@playwright/test';
import type { AuthorizationFull, Student, User } from '../../shared/types';
import { USERS, PASSWORD } from './auth';

/**
 * HTTP helpers to pre-create deterministic test data directly against the API
 * (through the Vite proxy). Lets specs set up rows without driving the UI.
 */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function apiLogin(request: APIRequestContext, email: string): Promise<User> {
  const res = await request.post('/api/auth/login', { data: { email, password: PASSWORD } });
  expect(res.ok(), `apiLogin ${email}`).toBeTruthy();
  return (await res.json()).user;
}

export async function listStudents(request: APIRequestContext, familyUserId: number): Promise<Student[]> {
  const res = await request.get(`/api/students?familyUserId=${familyUserId}`);
  expect(res.ok(), 'listStudents').toBeTruthy();
  return res.json();
}

export async function listAuthorizations(
  request: APIRequestContext, query = '',
): Promise<AuthorizationFull[]> {
  const res = await request.get('/api/authorizations' + query);
  expect(res.ok(), 'listAuthorizations').toBeTruthy();
  return res.json();
}

export interface CreateAuthOptions {
  studentId: number;
  createdByUserId: number;
  status?: string;          // omit for a normal 'pending' request
  date?: string;            // defaults to today
  time?: string;
  reason?: string;
}

export async function createAuthorization(
  request: APIRequestContext, o: CreateAuthOptions,
): Promise<AuthorizationFull> {
  const res = await request.post('/api/authorizations', {
    data: {
      student_id: o.studentId,
      created_by_user_id: o.createdByUserId,
      pickup_adult_name: 'Tutor de Prueba',
      pickup_adult_dni: '30999888',
      pickup_adult_relation: 'tío',
      date: o.date ?? todayISO(),
      time: o.time ?? '14:00',
      reason: o.reason ?? 'Turno médico',
      status: o.status,
    },
  });
  expect(res.ok(), 'createAuthorization').toBeTruthy();
  return res.json();
}

/** Convenience: a fresh pending authorization for one of María's students. */
export async function createPendingAuthorization(
  request: APIRequestContext,
): Promise<AuthorizationFull> {
  const family = await apiLogin(request, USERS.family);
  const students = await listStudents(request, family.id);
  expect(students.length, 'family has students').toBeGreaterThan(0);
  return createAuthorization(request, {
    studentId: students[0].id,
    createdByUserId: family.id,
  });
}

export async function setStatus(
  request: APIRequestContext, id: number, status: string, actorId: number, comment?: string,
): Promise<AuthorizationFull> {
  const res = await request.post(`/api/authorizations/${id}/status`, {
    headers: { 'x-user-id': String(actorId) },
    data: { status, comment },
  });
  expect(res.ok(), 'setStatus').toBeTruthy();
  return res.json();
}

export async function cancelAuthorization(
  request: APIRequestContext, id: number, actorId: number,
): Promise<AuthorizationFull> {
  const res = await request.post(`/api/authorizations/${id}/cancel`, {
    headers: { 'x-user-id': String(actorId) },
    data: {},
  });
  expect(res.ok(), 'cancelAuthorization').toBeTruthy();
  return res.json();
}

export async function registerWithdrawal(
  request: APIRequestContext, id: number, actorId: number,
): Promise<AuthorizationFull> {
  const res = await request.post(`/api/authorizations/${id}/withdraw`, {
    headers: { 'x-user-id': String(actorId) },
    data: {},
  });
  expect(res.ok(), 'registerWithdrawal').toBeTruthy();
  return res.json();
}
