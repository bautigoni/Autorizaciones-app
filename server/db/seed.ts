import { db } from './index.js';

const hasData = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c > 0;
if (hasData) {
  console.log('Database already seeded. Use `npm run db:reset` to start fresh.');
  process.exit(0);
}

const insertUser = db.prepare(
  `INSERT INTO users (email, password, full_name, role, phone, avatar_color)
   VALUES (@email, @password, @full_name, @role, @phone, @avatar_color)`
);
const insertStudent = db.prepare(
  `INSERT INTO students (full_name, dni, level, course, birthdate, avatar_color)
   VALUES (@full_name, @dni, @level, @course, @birthdate, @avatar_color)`
);
const insertGuardian = db.prepare(
  `INSERT INTO guardians (user_id, student_id, relation) VALUES (?, ?, ?)`
);
const insertAdult = db.prepare(
  `INSERT INTO authorized_adults (family_user_id, full_name, dni, relation, phone)
   VALUES (?, ?, ?, ?, ?)`
);
const insertAuth = db.prepare(
  `INSERT INTO authorizations
    (code, student_id, created_by_user_id, pickup_adult_name, pickup_adult_dni,
     pickup_adult_relation, date, time, reason, notes, status,
     reviewed_by_user_id, reviewed_at, withdrawn_at, withdrawn_by_user_id, created_at, updated_at)
   VALUES (@code, @student_id, @created_by_user_id, @pickup_adult_name, @pickup_adult_dni,
           @pickup_adult_relation, @date, @time, @reason, @notes, @status,
           @reviewed_by_user_id, @reviewed_at, @withdrawn_at, @withdrawn_by_user_id, @created_at, @updated_at)`
);
const insertHistory = db.prepare(
  `INSERT INTO auth_history (authorization_id, actor_user_id, action, from_status, to_status, comment, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);
const insertNotif = db.prepare(
  `INSERT INTO notifications (user_id, type, title, body, authorization_id, read, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

const COLORS = ['#FFB785', '#F26A4B', '#B2D6A4', '#FFD1B0', '#FFA48B', '#7AB169', '#FFC59A', '#FFE6D4', '#B2D6A4', '#8DD5B3', '#5DBF90'];
const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

// ─── Users ───────────────────────────────────────────────────────────────────
// Indices 0-2: families
// Index 3: first preceptor (referenced as reviewer and withdrawn actor)
const users = [
  // Families (indices 0-2)
  { email: 'maria@familia.edu',    password: 'demo', full_name: 'María González',  role: 'family',    phone: '+54 9 11 5555-1010' },
  { email: 'pablo@familia.edu',    password: 'demo', full_name: 'Pablo Ruiz',      role: 'family',    phone: '+54 9 11 5555-2020' },
  { email: 'lucia@familia.edu',    password: 'demo', full_name: 'Lucía Méndez',    role: 'family',    phone: '+54 9 11 5555-3030' },
  // Preceptoría — 10 users (indices 3-12)
  { email: 'preceptor@cole.edu',   password: 'demo', full_name: 'Andrea López',    role: 'preceptor', phone: '+54 9 11 5555-4040' },
  { email: 'm.garcia@cole.edu',    password: 'demo', full_name: 'Martín García',   role: 'preceptor', phone: '+54 9 11 5555-4041' },
  { email: 'l.sanchez@cole.edu',   password: 'demo', full_name: 'Laura Sánchez',   role: 'preceptor', phone: '+54 9 11 5555-4042' },
  { email: 'j.rodriguez@cole.edu', password: 'demo', full_name: 'Juan Rodríguez',  role: 'preceptor', phone: '+54 9 11 5555-4043' },
  { email: 'a.martinez@cole.edu',  password: 'demo', full_name: 'Ana Martínez',    role: 'preceptor', phone: '+54 9 11 5555-4044' },
  { email: 'd.fernandez@cole.edu', password: 'demo', full_name: 'Diego Fernández', role: 'preceptor', phone: '+54 9 11 5555-4045' },
  { email: 'c.torres@cole.edu',    password: 'demo', full_name: 'Claudia Torres',  role: 'preceptor', phone: '+54 9 11 5555-4046' },
  { email: 'p.romero@cole.edu',    password: 'demo', full_name: 'Pablo Romero',    role: 'preceptor', phone: '+54 9 11 5555-4047' },
  { email: 'v.castro@cole.edu',    password: 'demo', full_name: 'Valeria Castro',  role: 'preceptor', phone: '+54 9 11 5555-4048' },
  { email: 'e.diaz@cole.edu',      password: 'demo', full_name: 'Eduardo Díaz',    role: 'preceptor', phone: '+54 9 11 5555-4049' },
  // Secretaría — 3 users (indices 13-15)
  { email: 'secretaria@cole.edu',  password: 'demo', full_name: 'Carlos Pérez',    role: 'secretary', phone: '+54 9 11 5555-5050' },
  { email: 'm.silva@cole.edu',     password: 'demo', full_name: 'Marta Silva',     role: 'secretary', phone: '+54 9 11 5555-5051' },
  { email: 'f.lopez@cole.edu',     password: 'demo', full_name: 'Fernanda López',  role: 'secretary', phone: '+54 9 11 5555-5052' },
];

const userIds = users.map((u, i) =>
  insertUser.run({ ...u, avatar_color: pick(COLORS, i) }).lastInsertRowid as number
);

const IDX_PRECEPTOR = 3; // Andrea López — used for reviews and withdrawn registrations

// ─── Students ────────────────────────────────────────────────────────────────
const students = [
  { full_name: 'Sofía Martínez',   dni: '52111222', level: 'Secundario', course: '3°B',    guardianIdx: 0 },
  { full_name: 'Tomás Martínez',   dni: '54222111', level: 'Primario',   course: '5°A',    guardianIdx: 0 },
  { full_name: 'Valentina Ruiz',   dni: '51999888', level: 'Secundario', course: '1°C',    guardianIdx: 1 },
  { full_name: 'Bruno Méndez',     dni: '53777666', level: 'Primario',   course: '2°B',    guardianIdx: 2 },
  { full_name: 'Camila Méndez',    dni: '55666555', level: 'Inicial',    course: 'Sala 5', guardianIdx: 2 },
  { full_name: 'Mateo Suárez',     dni: '50333222', level: 'Secundario', course: '5°A',    guardianIdx: 0 },
  { full_name: 'Julieta Costa',    dni: '52444333', level: 'Primario',   course: '6°B',    guardianIdx: 1 },
  { full_name: 'Lautaro Pérez',    dni: '53555444', level: 'Secundario', course: '4°A',    guardianIdx: 2 },
];

const studentIds = students.map((s, i) => {
  const id = insertStudent.run({
    full_name: s.full_name, dni: s.dni, level: s.level, course: s.course,
    birthdate: null, avatar_color: pick(COLORS, i + 2),
  }).lastInsertRowid as number;
  insertGuardian.run(userIds[s.guardianIdx], id, 'madre/padre');
  return id;
});

// ─── Authorized adults ───────────────────────────────────────────────────────
const adults = [
  { fam: 0, name: 'Abuelo Jorge González', dni: '14555666', rel: 'abuelo', phone: '+54 9 11 4444-1111' },
  { fam: 0, name: 'Tía Marina González',   dni: '28999888', rel: 'tía',    phone: '+54 9 11 4444-2222' },
  { fam: 1, name: 'Abuela Susana Ruiz',    dni: '12333444', rel: 'abuela', phone: '+54 9 11 4444-3333' },
  { fam: 2, name: 'Vecina Laura B.',        dni: '33222111', rel: 'vecina', phone: '+54 9 11 4444-4444' },
];
adults.forEach(a => insertAdult.run(userIds[a.fam], a.name, a.dni, a.rel, a.phone));

// ─── Authorizations ──────────────────────────────────────────────────────────
const today = new Date();
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtDateTime = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

const reasons = ['Turno médico', 'Trámite familiar', 'Práctica deportiva', 'Cita odontológica', 'Motivo personal', 'Estudio'];
const times   = ['10:30', '11:15', '13:00', '14:20', '15:10', '16:00', '17:30'];
const statuses: { status: string; offset: number }[] = [
  { status: 'completed', offset: -2 },
  { status: 'completed', offset: -1 },
  { status: 'approved',  offset:  0 },
  { status: 'approved',  offset:  0 },
  { status: 'pending',   offset:  0 },
  { status: 'observed',  offset:  0 },
  { status: 'pending',   offset:  1 },
  { status: 'approved',  offset:  1 },
  { status: 'rejected',  offset: -1 },
  { status: 'expired',   offset: -3 },
  { status: 'approved',  offset:  2 },
  { status: 'pending',   offset:  0 },
];

let counter = 1;
const authIds: number[] = [];
const authCodes: string[] = [];

statuses.forEach((s, i) => {
  const code = 'NE-' + String(counter++).padStart(4, '0');
  const sIdx = i % students.length;
  const student = students[sIdx];
  const familyUserId = userIds[student.guardianIdx];
  const adult = adults[(i + sIdx) % adults.length];
  const d = new Date(today); d.setDate(today.getDate() + s.offset);
  const createdAt = new Date(d); createdAt.setHours(8, 0, 0, 0);
  const status = s.status;

  const reviewedBy =
    status === 'approved' || status === 'rejected' || status === 'observed' || status === 'completed'
      ? userIds[IDX_PRECEPTOR]
      : null;
  const reviewedAt = reviewedBy ? fmtDateTime(new Date(createdAt.getTime() + 60 * 60 * 1000)) : null;
  const withdrawnAt = status === 'completed' ? fmtDateTime(new Date(createdAt.getTime() + 5 * 60 * 60 * 1000)) : null;
  const withdrawnBy = status === 'completed' ? userIds[IDX_PRECEPTOR] : null;

  const authId = insertAuth.run({
    code,
    student_id: studentIds[sIdx],
    created_by_user_id: familyUserId,
    pickup_adult_name: adult.name,
    pickup_adult_dni: adult.dni,
    pickup_adult_relation: adult.rel,
    date: fmtDate(d),
    time: pick(times, i),
    reason: pick(reasons, i),
    notes: i % 3 === 0 ? 'Trae documento adjunto.' : null,
    status,
    reviewed_by_user_id: reviewedBy,
    reviewed_at: reviewedAt,
    withdrawn_at: withdrawnAt,
    withdrawn_by_user_id: withdrawnBy,
    created_at: fmtDateTime(createdAt),
    updated_at: fmtDateTime(
      withdrawnAt ? new Date(withdrawnAt) : reviewedAt ? new Date(reviewedAt) : createdAt
    ),
  }).lastInsertRowid as number;

  authIds.push(authId);
  authCodes.push(code);

  insertHistory.run(authId, familyUserId, 'created', null, 'pending', null, fmtDateTime(createdAt));
  if (reviewedBy) {
    const action = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status === 'observed' ? 'observed' : 'approved';
    insertHistory.run(
      authId, reviewedBy, action, 'pending',
      status === 'completed' ? 'approved' : status,
      status === 'observed' ? 'Faltan datos del adulto que retira.' : null,
      reviewedAt,
    );
  }
  if (status === 'completed' && withdrawnBy && withdrawnAt) {
    insertHistory.run(authId, withdrawnBy, 'withdrawn', 'approved', 'completed', 'Retiro confirmado.', withdrawnAt);
  }
});

// ─── Notifications ───────────────────────────────────────────────────────────
statuses.forEach((s, i) => {
  const sIdx = i % students.length;
  const student = students[sIdx];
  const familyUserId = userIds[student.guardianIdx];
  const authId = authIds[i];
  const code = authCodes[i];
  const d = new Date(today); d.setDate(today.getDate() + s.offset);
  // Notification created ~1.5 hours after authorization
  const notifAt = fmtDateTime(new Date(d.getTime() + 90 * 60 * 1000));
  const read = i < 3 ? 1 : 0; // first few seeded as already-read

  switch (s.status) {
    case 'approved':
      insertNotif.run(
        familyUserId, 'auth_approved',
        `Autorización aprobada · ${student.full_name}`,
        `La solicitud ${code} fue aprobada por preceptoría.`,
        authId, read, notifAt,
      );
      break;
    case 'rejected':
      insertNotif.run(
        familyUserId, 'auth_rejected',
        `Solicitud rechazada · ${student.full_name}`,
        `La solicitud ${code} fue rechazada. Revisá los detalles en la app.`,
        authId, 0, notifAt,
      );
      break;
    case 'observed':
      insertNotif.run(
        familyUserId, 'auth_observed',
        `Información adicional requerida · ${student.full_name}`,
        `La solicitud ${code} necesita más información. Faltan datos del adulto que retira.`,
        authId, 0, notifAt,
      );
      break;
    case 'completed':
      insertNotif.run(
        familyUserId, 'auth_completed',
        `Retiro registrado · ${student.full_name}`,
        `El retiro de la solicitud ${code} fue confirmado.`,
        authId, 1, notifAt,
      );
      break;
    case 'pending':
      // Notify first preceptor about pending requests
      insertNotif.run(
        userIds[IDX_PRECEPTOR], 'auth_pending',
        `Nueva solicitud · ${student.full_name}`,
        `Se recibió la solicitud ${code} para revisión.`,
        authId, i < 2 ? 1 : 0, notifAt,
      );
      break;
  }
});

console.log('✓ Base de datos inicializada correctamente.');
console.log('   Cuentas demo (contraseña: demo):');
users.forEach(u => console.log(`   · ${u.role.padEnd(10)} ${u.email}`));
