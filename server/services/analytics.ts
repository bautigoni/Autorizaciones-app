import { db } from '../db/index.js';
import type {
  AnalyticsGranularity, AnalyticsRange, AnalyticsSummary,
  PickupsBucket, StatusSlice, PeakTimes, TopStudent, TopFamily,
} from '../../shared/types.js';

/** Builds a WHERE clause filtering authorizations (alias `a`) by pick-up date range. */
function whereRange(r: AnalyticsRange): { clause: string; params: string[] } {
  const w: string[] = [];
  const params: string[] = [];
  if (r.from) { w.push('a.date >= ?'); params.push(r.from); }
  if (r.to) { w.push('a.date <= ?'); params.push(r.to); }
  return { clause: w.length ? 'WHERE ' + w.join(' AND ') : '', params };
}

// ── 1. Summary ───────────────────────────────────────────────────────────────
export function analyticsSummary(r: AnalyticsRange): AnalyticsSummary {
  const { clause, params } = whereRange(r);
  const row = db.prepare(`
    SELECT
      COUNT(*) AS totalRequests,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS totalPickups,
      SUM(CASE WHEN status IN ('approved','completed') THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
    FROM authorizations a ${clause}
  `).get(...params) as Record<string, number>;

  const t = db.prepare(`
    SELECT AVG((julianday(reviewed_at) - julianday(created_at)) * 24.0) AS h
    FROM authorizations a ${clause ? clause + ' AND' : 'WHERE'} reviewed_at IS NOT NULL
  `).get(...params) as { h: number | null };

  const approved = row.approved ?? 0;
  const decided = approved + (row.rejected ?? 0);
  return {
    totalRequests: row.totalRequests ?? 0,
    totalPickups: row.totalPickups ?? 0,
    approvalRate: decided ? approved / decided : 0,
    avgApprovalHours: t.h != null ? Math.round(t.h * 10) / 10 : null,
  };
}

// ── 2. Pick-ups over time ────────────────────────────────────────────────────
function periodExpr(g: AnalyticsGranularity): string {
  if (g === 'week') return "date(a.date, '-6 days', 'weekday 1')"; // Monday of that week
  if (g === 'month') return "strftime('%Y-%m-01', a.date)";
  return 'a.date';
}

function isoUTC(d: Date): string { return d.toISOString().slice(0, 10); }

function mondayOf(iso: string): Date {
  const d = new Date(iso + 'T00:00:00Z');
  const diff = (d.getUTCDay() + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function enumeratePeriods(from: string, to: string, g: AnalyticsGranularity): string[] {
  const out: string[] = [];
  if (g === 'month') {
    let [y, m] = from.split('-').map(Number);
    const [ty, tm] = to.split('-').map(Number);
    while (y < ty || (y === ty && m <= tm)) {
      out.push(`${y}-${String(m).padStart(2, '0')}-01`);
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  }
  let d = g === 'week' ? mondayOf(from) : new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  const step = g === 'week' ? 7 : 1;
  while (d <= end && out.length < 1000) {
    out.push(isoUTC(d));
    d.setUTCDate(d.getUTCDate() + step);
  }
  return out;
}

export function pickupsOverTime(r: AnalyticsRange, g: AnalyticsGranularity): PickupsBucket[] {
  const { clause, params } = whereRange(r);
  const rows = db.prepare(`
    SELECT ${periodExpr(g)} AS period,
      COUNT(*) AS requests,
      SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS pickups
    FROM authorizations a ${clause}
    GROUP BY period ORDER BY period
  `).all(...params) as { period: string; requests: number; pickups: number }[];

  // Resolve effective bounds so the chart can show 0-value gaps.
  let from = r.from;
  let to = r.to;
  if (!from || !to) {
    const b = db.prepare(
      `SELECT MIN(a.date) AS mn, MAX(a.date) AS mx FROM authorizations a ${clause}`
    ).get(...params) as { mn: string | null; mx: string | null };
    from = from ?? b.mn ?? undefined;
    to = to ?? b.mx ?? undefined;
  }
  if (!from || !to) {
    return rows.map(x => ({ period: String(x.period), requests: x.requests, pickups: x.pickups ?? 0 }));
  }

  const byPeriod = new Map(rows.map(x => [String(x.period), x]));
  return enumeratePeriods(from, to, g).map(period => {
    const hit = byPeriod.get(period);
    return { period, requests: hit?.requests ?? 0, pickups: hit?.pickups ?? 0 };
  });
}

// ── 3. Status breakdown ──────────────────────────────────────────────────────
export function statusBreakdown(r: AnalyticsRange): StatusSlice[] {
  const { clause, params } = whereRange(r);
  return db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM authorizations a ${clause}
    GROUP BY status ORDER BY count DESC
  `).all(...params) as StatusSlice[];
}

// ── 4. Peak times ────────────────────────────────────────────────────────────
export function peakTimes(r: AnalyticsRange): PeakTimes {
  const { clause, params } = whereRange(r);
  const hourRows = db.prepare(`
    SELECT CAST(substr(a.time, 1, 2) AS INTEGER) AS hour, COUNT(*) AS count
    FROM authorizations a ${clause}
    GROUP BY hour
  `).all(...params) as { hour: number; count: number }[];
  const wdRows = db.prepare(`
    SELECT CAST(strftime('%w', a.date) AS INTEGER) AS weekday, COUNT(*) AS count
    FROM authorizations a ${clause}
    GROUP BY weekday
  `).all(...params) as { weekday: number; count: number }[];

  const hourMap = new Map(hourRows.map(h => [h.hour, h.count]));
  const byHour: { hour: number; count: number }[] = [];
  for (let h = 7; h <= 19; h++) byHour.push({ hour: h, count: hourMap.get(h) ?? 0 });

  const wdMap = new Map(wdRows.map(w => [w.weekday, w.count]));
  const byWeekday: { weekday: number; count: number }[] = [];
  for (let w = 0; w <= 6; w++) byWeekday.push({ weekday: w, count: wdMap.get(w) ?? 0 });

  return { byHour, byWeekday };
}

// ── 5. Top students ──────────────────────────────────────────────────────────
export function topStudents(r: AnalyticsRange): TopStudent[] {
  const { clause, params } = whereRange(r);
  return db.prepare(`
    SELECT s.id AS student_id, s.full_name, s.course, s.level,
      COUNT(*) AS count,
      SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS pickups
    FROM authorizations a
    JOIN students s ON s.id = a.student_id
    ${clause}
    GROUP BY s.id
    ORDER BY count DESC, s.full_name
    LIMIT 8
  `).all(...params) as TopStudent[];
}

// ── 6. Top families ──────────────────────────────────────────────────────────
export function topFamilies(r: AnalyticsRange): TopFamily[] {
  const { clause, params } = whereRange(r);
  const where = clause ? clause + " AND u.role = 'family'" : "WHERE u.role = 'family'";
  return db.prepare(`
    SELECT u.id AS user_id, u.full_name, COUNT(*) AS count
    FROM authorizations a
    JOIN users u ON u.id = a.created_by_user_id
    ${where}
    GROUP BY u.id
    ORDER BY count DESC, u.full_name
    LIMIT 8
  `).all(...params) as TopFamily[];
}
