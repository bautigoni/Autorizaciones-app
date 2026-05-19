import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'nexoescolar.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

export function nextAuthCode(): string {
  const row = db
    .prepare("SELECT code FROM authorizations ORDER BY id DESC LIMIT 1")
    .get() as { code: string } | undefined;
  let n = 1;
  if (row?.code) {
    const m = row.code.match(/(\d+)$/);
    if (m) n = parseInt(m[1], 10) + 1;
  }
  return 'NE-' + String(n).padStart(4, '0');
}
