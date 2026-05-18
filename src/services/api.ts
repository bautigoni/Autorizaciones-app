import type {
  AuthorizationFull, DashboardMetrics, Student, AuthorizedAdult, User, AuthStatus,
} from '@shared/types';

const BASE = '/api';

function userId(): number | null {
  const raw = localStorage.getItem('salida-segura.user');
  if (!raw) return null;
  try { return JSON.parse(raw).id; } catch { return null; }
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  const uid = userId();
  if (uid) headers['x-user-id'] = String(uid);
  const res = await fetch(BASE + path, { ...init, headers });
  if (!res.ok) {
    let msg = res.statusText;
    try { const b = await res.json(); msg = b.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    req<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req<{ user: User }>('/me'),

  listStudents: (familyUserId?: number) =>
    req<Student[]>('/students' + (familyUserId ? `?familyUserId=${familyUserId}` : '')),
  getStudent: (id: number) => req<Student>(`/students/${id}`),

  listAdults: (familyUserId: number) =>
    req<AuthorizedAdult[]>(`/authorized-adults?familyUserId=${familyUserId}`),
  createAdult: (payload: Omit<AuthorizedAdult, 'id'>) =>
    req<AuthorizedAdult>('/authorized-adults', { method: 'POST', body: JSON.stringify(payload) }),

  listAuthorizations: (filters: Record<string, string | number | undefined> = {}) => {
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== 'all') q.set(k, String(v)); });
    const s = q.toString();
    return req<AuthorizationFull[]>('/authorizations' + (s ? `?${s}` : ''));
  },
  getAuthorization: (id: number) => req<AuthorizationFull>(`/authorizations/${id}`),
  getAuthorizationByCode: (code: string) => req<AuthorizationFull>(`/authorizations/by-code/${code}`),
  createAuthorization: (payload: any) =>
    req<AuthorizationFull>('/authorizations', { method: 'POST', body: JSON.stringify(payload) }),
  updateAuthorization: (id: number, patch: any) =>
    req<AuthorizationFull>(`/authorizations/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  setStatus: (id: number, status: AuthStatus, comment?: string) =>
    req<AuthorizationFull>(`/authorizations/${id}/status`, {
      method: 'POST', body: JSON.stringify({ status, comment }),
    }),
  addNote: (id: number, comment: string) =>
    req<AuthorizationFull>(`/authorizations/${id}/notes`, { method: 'POST', body: JSON.stringify({ comment }) }),
  registerWithdrawal: (id: number) =>
    req<AuthorizationFull>(`/authorizations/${id}/withdraw`, { method: 'POST', body: '{}' }),
  cancel: (id: number) =>
    req<AuthorizationFull>(`/authorizations/${id}/cancel`, { method: 'POST', body: '{}' }),
  addAttachment: (id: number, payload: { filename: string; mime: string; size: number }) =>
    req(`/authorizations/${id}/attachments`, { method: 'POST', body: JSON.stringify(payload) }),

  metrics: (date?: string) => req<DashboardMetrics>('/metrics' + (date ? `?date=${date}` : '')),
  metricsWeekly: () => req<(DashboardMetrics & { date: string })[]>('/metrics/weekly'),
};
