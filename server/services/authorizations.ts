import { db, nextAuthCode } from '../db/index.js';
import type {
  Authorization, AuthorizationFull, AuthStatus, Student, User,
  AuthHistoryEntry, Attachment, DashboardMetrics,
} from '../../shared/types.js';

type Row = Record<string, any>;

function rowToAuth(r: Row): Authorization {
  return {
    id: r.id, code: r.code, student_id: r.student_id,
    created_by_user_id: r.created_by_user_id,
    pickup_adult_name: r.pickup_adult_name, pickup_adult_dni: r.pickup_adult_dni,
    pickup_adult_relation: r.pickup_adult_relation,
    date: r.date, time: r.time, reason: r.reason, notes: r.notes,
    status: r.status as AuthStatus,
    reviewed_by_user_id: r.reviewed_by_user_id, reviewed_at: r.reviewed_at,
    withdrawn_at: r.withdrawn_at, withdrawn_by_user_id: r.withdrawn_by_user_id,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

function getStudent(id: number): Student {
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Student;
}
function getUserBrief(id: number | null): any {
  if (!id) return null;
  return db.prepare('SELECT id, full_name, email, role FROM users WHERE id = ?').get(id);
}

export function expandAuth(a: Authorization): AuthorizationFull {
  const history = db
    .prepare('SELECT * FROM auth_history WHERE authorization_id = ? ORDER BY created_at ASC, id ASC')
    .all(a.id) as AuthHistoryEntry[];
  const attachments = db
    .prepare('SELECT * FROM attachments WHERE authorization_id = ?')
    .all(a.id) as Attachment[];
  return {
    ...a,
    student: getStudent(a.student_id),
    created_by: getUserBrief(a.created_by_user_id),
    reviewed_by: getUserBrief(a.reviewed_by_user_id ?? null),
    withdrawn_by: getUserBrief(a.withdrawn_by_user_id ?? null),
    history,
    attachments,
  };
}

export interface ListFilters {
  status?: AuthStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  date?: string;
  level?: string;
  course?: string;
  studentId?: number;
  search?: string;
  createdBy?: number;
  limit?: number;
}

export function listAuthorizations(f: ListFilters = {}): AuthorizationFull[] {
  const where: string[] = [];
  const params: any[] = [];
  if (f.status && f.status !== 'all') { where.push('a.status = ?'); params.push(f.status); }
  if (f.date) { where.push('a.date = ?'); params.push(f.date); }
  if (f.dateFrom) { where.push('a.date >= ?'); params.push(f.dateFrom); }
  if (f.dateTo) { where.push('a.date <= ?'); params.push(f.dateTo); }
  if (f.studentId) { where.push('a.student_id = ?'); params.push(f.studentId); }
  if (f.createdBy) { where.push('a.created_by_user_id = ?'); params.push(f.createdBy); }
  if (f.level) { where.push('s.level = ?'); params.push(f.level); }
  if (f.course) { where.push('s.course = ?'); params.push(f.course); }
  if (f.search) {
    where.push('(s.full_name LIKE ? OR s.dni LIKE ? OR a.code LIKE ? OR a.pickup_adult_name LIKE ? OR a.pickup_adult_dni LIKE ?)');
    const q = `%${f.search}%`;
    params.push(q, q, q, q, q);
  }
  const sql = `
    SELECT a.* FROM authorizations a
    JOIN students s ON s.id = a.student_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY a.date DESC, a.time DESC
    ${f.limit ? 'LIMIT ' + Math.max(1, Math.min(500, f.limit)) : ''}
  `;
  const rows = db.prepare(sql).all(...params) as Row[];
  return rows.map(r => expandAuth(rowToAuth(r)));
}

export function getAuthorization(id: number): AuthorizationFull | null {
  const r = db.prepare('SELECT * FROM authorizations WHERE id = ?').get(id) as Row | undefined;
  return r ? expandAuth(rowToAuth(r)) : null;
}

export function getAuthorizationByCode(code: string): AuthorizationFull | null {
  const r = db.prepare('SELECT * FROM authorizations WHERE code = ?').get(code) as Row | undefined;
  return r ? expandAuth(rowToAuth(r)) : null;
}

export interface CreateInput {
  student_id: number;
  created_by_user_id: number;
  pickup_adult_name: string;
  pickup_adult_dni: string;
  pickup_adult_relation?: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status?: AuthStatus;
}

export function createAuthorization(input: CreateInput): AuthorizationFull {
  const code = nextAuthCode();
  const status = input.status ?? 'pending';
  const id = db.prepare(`
    INSERT INTO authorizations
      (code, student_id, created_by_user_id, pickup_adult_name, pickup_adult_dni,
       pickup_adult_relation, date, time, reason, notes, status)
    VALUES (@code, @student_id, @created_by_user_id, @pickup_adult_name, @pickup_adult_dni,
            @pickup_adult_relation, @date, @time, @reason, @notes, @status)
  `).run({ code, ...input, status, pickup_adult_relation: input.pickup_adult_relation ?? null, notes: input.notes ?? null })
    .lastInsertRowid as number;

  db.prepare(`
    INSERT INTO auth_history (authorization_id, actor_user_id, action, to_status)
    VALUES (?, ?, 'created', ?)
  `).run(id, input.created_by_user_id, status);

  return getAuthorization(id)!;
}

export function updateStatus(
  id: number, to: AuthStatus, actorId: number, comment?: string
): AuthorizationFull | null {
  const a = getAuthorization(id);
  if (!a) return null;
  const reviewedAt = ['approved', 'rejected', 'observed'].includes(to) ? new Date().toISOString() : a.reviewed_at;
  db.prepare(`
    UPDATE authorizations SET
      status = ?, reviewed_by_user_id = ?, reviewed_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(to, actorId, reviewedAt, id);

  db.prepare(`
    INSERT INTO auth_history (authorization_id, actor_user_id, action, from_status, to_status, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, actorId, to, a.status, to, comment ?? null);

  return getAuthorization(id);
}

export function addNote(id: number, actorId: number, comment: string): AuthorizationFull | null {
  const a = getAuthorization(id);
  if (!a) return null;
  db.prepare(`
    INSERT INTO auth_history (authorization_id, actor_user_id, action, from_status, to_status, comment)
    VALUES (?, ?, 'note_added', ?, ?, ?)
  `).run(id, actorId, a.status, a.status, comment);
  return getAuthorization(id);
}

export function registerWithdrawal(id: number, actorId: number): AuthorizationFull | null {
  const a = getAuthorization(id);
  if (!a) return null;
  if (a.status !== 'approved') return a;
  db.prepare(`
    UPDATE authorizations SET
      status = 'completed', withdrawn_by_user_id = ?, withdrawn_at = datetime('now'),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(actorId, id);
  db.prepare(`
    INSERT INTO auth_history (authorization_id, actor_user_id, action, from_status, to_status, comment)
    VALUES (?, ?, 'withdrawn', 'approved', 'completed', ?)
  `).run(id, actorId, 'Retiro registrado');
  return getAuthorization(id);
}

export function updateAuthorization(
  id: number, actorId: number,
  patch: Partial<Pick<CreateInput, 'pickup_adult_name' | 'pickup_adult_dni' | 'pickup_adult_relation' | 'date' | 'time' | 'reason' | 'notes'>>
): AuthorizationFull | null {
  const a = getAuthorization(id);
  if (!a) return null;
  const fields: string[] = [];
  const params: any[] = [];
  Object.entries(patch).forEach(([k, v]) => {
    if (v !== undefined) { fields.push(`${k} = ?`); params.push(v); }
  });
  if (!fields.length) return a;
  fields.push("updated_at = datetime('now')");
  db.prepare(`UPDATE authorizations SET ${fields.join(', ')} WHERE id = ?`).run(...params, id);
  db.prepare(`
    INSERT INTO auth_history (authorization_id, actor_user_id, action, from_status, to_status, comment)
    VALUES (?, ?, 'edited', ?, ?, ?)
  `).run(id, actorId, a.status, a.status, 'Solicitud modificada');
  return getAuthorization(id);
}

export function cancelAuthorization(id: number, actorId: number): AuthorizationFull | null {
  return updateStatus(id, 'cancelled', actorId, 'Cancelada por la familia');
}

export function metricsForDate(date: string): DashboardMetrics {
  const all = db.prepare('SELECT status FROM authorizations WHERE date = ?').all(date) as { status: AuthStatus }[];
  const m: DashboardMetrics = { pending: 0, approved: 0, observed: 0, rejected: 0, completed: 0, expired: 0, todayTotal: all.length };
  all.forEach(r => { (m as any)[r.status] = ((m as any)[r.status] ?? 0) + 1; });
  return m;
}

export function expireOld() {
  const today = new Date().toISOString().slice(0, 10);
  const stale = db.prepare(
    "SELECT id, status FROM authorizations WHERE status IN ('pending','approved','observed') AND date < ?"
  ).all(today) as { id: number; status: AuthStatus }[];
  const upd = db.prepare("UPDATE authorizations SET status = 'expired', updated_at = datetime('now') WHERE id = ?");
  const hist = db.prepare(
    `INSERT INTO auth_history (authorization_id, actor_user_id, action, from_status, to_status, comment)
     VALUES (?, 1, 'expired', ?, 'expired', 'Vencida automáticamente')`
  );
  stale.forEach(s => { upd.run(s.id); hist.run(s.id, s.status); });
}
