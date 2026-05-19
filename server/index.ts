import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import {
  listAuthorizations, getAuthorization, getAuthorizationByCode,
  createAuthorization, updateStatus, addNote, registerWithdrawal,
  updateAuthorization, cancelAuthorization, metricsForDate, expireOld,
} from './services/authorizations.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

// auto-expire old pending/approved on each startup
expireOld();

// --- Auth (demo: plain password check, session via header)

// Google OAuth init — returns redirect URL if credentials are configured, 503 otherwise.
// Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// Optional env var:  GOOGLE_REDIRECT_URI (defaults to http://localhost:5174/api/auth/google/callback)
app.get('/api/auth/google/init', (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(503).json({
      error: 'google_not_configured',
      message: 'Google OAuth no está configurado. Agregá GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el archivo .env del servidor para habilitarlo.',
    });
  }
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:5174/api/auth/google/callback';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase()) as any;
  if (!u || u.password !== password) return res.status(401).json({ error: 'Credenciales inválidas' });
  res.json({ user: { id: u.id, email: u.email, full_name: u.full_name, role: u.role, phone: u.phone, avatar_color: u.avatar_color } });
});

app.get('/api/me', (req, res) => {
  const id = Number(req.header('x-user-id'));
  if (!id) return res.status(401).json({ error: 'No session' });
  const u = db.prepare('SELECT id, email, full_name, role, phone, avatar_color FROM users WHERE id = ?').get(id);
  if (!u) return res.status(401).json({ error: 'No session' });
  res.json({ user: u });
});

// --- Reference data
app.get('/api/students', (req, res) => {
  const familyUserId = req.query.familyUserId ? Number(req.query.familyUserId) : null;
  if (familyUserId) {
    const rows = db.prepare(`
      SELECT s.* FROM students s
      JOIN guardians g ON g.student_id = s.id
      WHERE g.user_id = ?
      ORDER BY s.full_name
    `).all(familyUserId);
    return res.json(rows);
  }
  res.json(db.prepare('SELECT * FROM students ORDER BY level, course, full_name').all());
});

app.get('/api/students/:id', (req, res) => {
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(req.params.id));
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

app.get('/api/authorized-adults', (req, res) => {
  const userId = Number(req.query.familyUserId);
  if (!userId) return res.json([]);
  res.json(db.prepare('SELECT * FROM authorized_adults WHERE family_user_id = ? ORDER BY full_name').all(userId));
});

app.post('/api/authorized-adults', (req, res) => {
  const { family_user_id, full_name, dni, relation, phone } = req.body ?? {};
  if (!family_user_id || !full_name || !dni || !relation) return res.status(400).json({ error: 'Missing fields' });
  const id = db.prepare(`
    INSERT INTO authorized_adults (family_user_id, full_name, dni, relation, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run(family_user_id, full_name, dni, relation, phone ?? null).lastInsertRowid;
  res.json(db.prepare('SELECT * FROM authorized_adults WHERE id = ?').get(id));
});

// --- Authorizations
app.get('/api/authorizations', (req, res) => {
  const f: any = {};
  ['status', 'date', 'dateFrom', 'dateTo', 'level', 'course', 'search'].forEach(k => {
    if (req.query[k]) f[k] = String(req.query[k]);
  });
  if (req.query.studentId) f.studentId = Number(req.query.studentId);
  if (req.query.createdBy) f.createdBy = Number(req.query.createdBy);
  if (req.query.limit) f.limit = Number(req.query.limit);
  res.json(listAuthorizations(f));
});

app.get('/api/authorizations/:id', (req, res) => {
  const a = getAuthorization(Number(req.params.id));
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

app.get('/api/authorizations/by-code/:code', (req, res) => {
  const a = getAuthorizationByCode(req.params.code);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

app.post('/api/authorizations', (req, res) => {
  try {
    const a = createAuthorization(req.body);
    // Notify all preceptors about the new request
    const preceptors = db.prepare("SELECT id FROM users WHERE role = 'preceptor'").all() as { id: number }[];
    const studentName = a.student?.full_name ?? 'alumno/a';
    preceptors.forEach(p => {
      db.prepare(
        `INSERT INTO notifications (user_id, type, title, body, authorization_id, read, created_at)
         VALUES (?, 'auth_pending', ?, ?, ?, 0, datetime('now'))`
      ).run(p.id, `Nueva solicitud · ${studentName}`, `Se recibió la solicitud ${a.code} para revisión.`, a.id);
    });
    res.status(201).json(a);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.patch('/api/authorizations/:id', (req, res) => {
  const actorId = Number(req.header('x-user-id')) || req.body.actor_user_id;
  if (!actorId) return res.status(401).json({ error: 'No actor' });
  const a = updateAuthorization(Number(req.params.id), actorId, req.body);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

app.post('/api/authorizations/:id/status', (req, res) => {
  const actorId = Number(req.header('x-user-id')) || req.body.actor_user_id;
  const { status, comment } = req.body ?? {};
  if (!actorId || !status) return res.status(400).json({ error: 'Missing actor or status' });
  const a = updateStatus(Number(req.params.id), status, actorId, comment);
  if (!a) return res.status(404).json({ error: 'Not found' });
  // Notify the family who created the authorization
  createStatusNotification(a, status, comment);
  res.json(a);
});

app.post('/api/authorizations/:id/notes', (req, res) => {
  const actorId = Number(req.header('x-user-id')) || req.body.actor_user_id;
  const { comment } = req.body ?? {};
  if (!actorId || !comment) return res.status(400).json({ error: 'Missing fields' });
  const a = addNote(Number(req.params.id), actorId, comment);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

app.post('/api/authorizations/:id/withdraw', (req, res) => {
  const actorId = Number(req.header('x-user-id')) || req.body.actor_user_id;
  if (!actorId) return res.status(401).json({ error: 'No actor' });
  const a = registerWithdrawal(Number(req.params.id), actorId);
  if (!a) return res.status(404).json({ error: 'Not found' });
  createStatusNotification(a, 'completed');
  res.json(a);
});

app.post('/api/authorizations/:id/cancel', (req, res) => {
  const actorId = Number(req.header('x-user-id')) || req.body.actor_user_id;
  if (!actorId) return res.status(401).json({ error: 'No actor' });
  const a = cancelAuthorization(Number(req.params.id), actorId);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

// --- Attachments (metadata only)
app.post('/api/authorizations/:id/attachments', (req, res) => {
  const { filename, mime, size } = req.body ?? {};
  if (!filename || !mime || size == null) return res.status(400).json({ error: 'Missing fields' });
  const id = db.prepare(`
    INSERT INTO attachments (authorization_id, filename, mime, size) VALUES (?, ?, ?, ?)
  `).run(Number(req.params.id), filename, mime, size).lastInsertRowid;
  res.json(db.prepare('SELECT * FROM attachments WHERE id = ?').get(id));
});

// --- Metrics
app.get('/api/metrics', (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  res.json(metricsForDate(date));
});

app.get('/api/metrics/weekly', (req, res) => {
  const today = new Date();
  const days: any[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const m = metricsForDate(ds);
    days.push({ date: ds, ...m });
  }
  res.json(days);
});

// --- Notifications
app.get('/api/notifications', (req, res) => {
  const userId = Number(req.header('x-user-id'));
  if (!userId) return res.status(401).json({ error: 'No session' });
  const rows = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 80'
  ).all(userId) as any[];
  res.json(rows.map(n => ({ ...n, read: Boolean(n.read) })));
});

app.get('/api/notifications/unread-count', (req, res) => {
  const userId = Number(req.header('x-user-id'));
  if (!userId) return res.status(401).json({ error: 'No session' });
  const row = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(userId) as { count: number };
  res.json({ count: row.count });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const userId = Number(req.header('x-user-id'));
  if (!userId) return res.status(401).json({ error: 'No session' });
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(Number(req.params.id), userId);
  res.json({ ok: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const userId = Number(req.header('x-user-id'));
  if (!userId) return res.status(401).json({ error: 'No session' });
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
  res.json({ ok: true });
});

function createStatusNotification(auth: any, status: string, comment?: string) {
  const recipientId = auth.created_by_user_id;
  if (!recipientId) return;
  const studentName = auth.student?.full_name ?? 'alumno/a';
  const configs: Record<string, { type: string; title: string; body: string }> = {
    approved:  { type: 'auth_approved',  title: `Autorización aprobada · ${studentName}`,              body: `La solicitud ${auth.code} fue aprobada por preceptoría.` },
    rejected:  { type: 'auth_rejected',  title: `Solicitud rechazada · ${studentName}`,                body: comment ? `Motivo: ${comment}` : `La solicitud ${auth.code} fue rechazada.` },
    observed:  { type: 'auth_observed',  title: `Información adicional requerida · ${studentName}`,   body: comment ? `Observación: ${comment}` : `La solicitud ${auth.code} necesita más información.` },
    completed: { type: 'auth_completed', title: `Retiro registrado · ${studentName}`,                  body: `El retiro de la solicitud ${auth.code} fue registrado.` },
    cancelled: { type: 'auth_cancelled', title: `Solicitud cancelada · ${studentName}`,                body: `La solicitud ${auth.code} fue cancelada.` },
  };
  const cfg = configs[status];
  if (cfg) {
    db.prepare(
      `INSERT INTO notifications (user_id, type, title, body, authorization_id, read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`
    ).run(recipientId, cfg.type, cfg.title, cfg.body, auth.id);
  }
}

// --- Static (built client)
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = Number(process.env.PORT) || 5174;
app.listen(PORT, () => console.log(`🟧 NexoEscolar API listening on http://localhost:${PORT}`));
