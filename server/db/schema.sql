-- NexoEscolar · SQLite schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- plaintext only for demo seed
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('family','preceptor','secretary')),
  phone TEXT,
  avatar_color TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL,
  course TEXT NOT NULL,
  birthdate TEXT,
  avatar_color TEXT
);

CREATE TABLE IF NOT EXISTS guardians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  UNIQUE(user_id, student_id)
);

CREATE TABLE IF NOT EXISTS authorized_adults (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  dni TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS authorizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  student_id INTEGER NOT NULL REFERENCES students(id),
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  pickup_adult_name TEXT NOT NULL,
  pickup_adult_dni TEXT NOT NULL,
  pickup_adult_relation TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','observed','rejected','completed','expired','cancelled')),
  reviewed_by_user_id INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  withdrawn_at TEXT,
  withdrawn_by_user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_auth_date ON authorizations(date);
CREATE INDEX IF NOT EXISTS idx_auth_status ON authorizations(status);
CREATE INDEX IF NOT EXISTS idx_auth_student ON authorizations(student_id);

CREATE TABLE IF NOT EXISTS auth_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authorization_id INTEGER NOT NULL REFERENCES authorizations(id) ON DELETE CASCADE,
  actor_user_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hist_auth ON auth_history(authorization_id);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  authorization_id INTEGER REFERENCES authorizations(id) ON DELETE SET NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authorization_id INTEGER NOT NULL REFERENCES authorizations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
