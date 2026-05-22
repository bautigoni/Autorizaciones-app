import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import type {
  AnalyticsSummary, PickupsBucket, StatusSlice, PeakTimes,
  TopStudent, TopFamily, AnalyticsGranularity, AuthStatus,
} from '@shared/types';
import { api } from '../../../services/api';
import { I } from '../../../components/Icons';
import { statusLabel } from '../../../components/Badge';
import { MetricCard } from './components/MetricCard';
import { ChartCard } from './components/ChartCard';
import { RangePicker, rangeToDates, type RangeKey } from './components/RangePicker';

const STATUS_COLORS: Record<AuthStatus, string> = {
  pending: '#F59E0B',
  approved: '#7AB169',
  observed: '#FF9655',
  rejected: '#F26A4B',
  completed: '#5E8E51',
  expired: '#B7AEA2',
  cancelled: '#8C8278',
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const AXIS_TICK = { fontSize: 11, fill: '#8C8278' } as const;
const ZERO_SUMMARY: AnalyticsSummary = { totalRequests: 0, totalPickups: 0, approvalRate: 0, avgApprovalHours: null };

function fmtPeriod(period: string, g: AnalyticsGranularity): string {
  const d = new Date(period + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return period;
  if (g === 'month') return d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function fmtApprovalTime(h: number | null): string {
  if (h == null) return '—';
  if (h < 1) return `${Math.round(h * 60)} min`;
  return (h % 1 === 0 ? String(h) : h.toFixed(1)) + ' h';
}

export function InternalAnalytics() {
  const [rangeKey, setRangeKey] = useState<RangeKey>('all');
  const [granularity, setGranularity] = useState<AnalyticsGranularity>('day');

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [pickups, setPickups] = useState<PickupsBucket[] | null>(null);
  const [status, setStatus] = useState<StatusSlice[] | null>(null);
  const [peak, setPeak] = useState<PeakTimes | null>(null);
  const [topStud, setTopStud] = useState<TopStudent[] | null>(null);
  const [topFam, setTopFam] = useState<TopFamily[] | null>(null);

  const range = useMemo(() => rangeToDates(rangeKey), [rangeKey]);

  useEffect(() => {
    let cancelled = false;
    setSummary(null); setStatus(null); setPeak(null); setTopStud(null); setTopFam(null);
    api.analyticsSummary(range).then(d => !cancelled && setSummary(d)).catch(() => !cancelled && setSummary(ZERO_SUMMARY));
    api.analyticsStatusBreakdown(range).then(d => !cancelled && setStatus(d)).catch(() => !cancelled && setStatus([]));
    api.analyticsPeakTimes(range).then(d => !cancelled && setPeak(d)).catch(() => !cancelled && setPeak({ byHour: [], byWeekday: [] }));
    api.analyticsTopStudents(range).then(d => !cancelled && setTopStud(d)).catch(() => !cancelled && setTopStud([]));
    api.analyticsTopFamilies(range).then(d => !cancelled && setTopFam(d)).catch(() => !cancelled && setTopFam([]));
    return () => { cancelled = true; };
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    setPickups(null);
    api.analyticsPickups(range, granularity).then(d => !cancelled && setPickups(d)).catch(() => !cancelled && setPickups([]));
    return () => { cancelled = true; };
  }, [range, granularity]);

  const weekdayData = useMemo(
    () => (peak ? [1, 2, 3, 4, 5, 6, 0].map(w => ({
      name: WEEKDAYS[w],
      count: peak.byWeekday.find(x => x.weekday === w)?.count ?? 0,
    })) : []),
    [peak],
  );

  const pickupsEmpty = !!pickups && pickups.every(b => b.requests === 0 && b.pickups === 0);
  const peakHourEmpty = !!peak && peak.byHour.every(h => h.count === 0);
  const peakWeekdayEmpty = !!peak && weekdayData.every(w => w.count === 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-[1.85rem] font-extrabold text-ink-900">Analítica</h1>
          <p className="text-sm text-ink-500 mt-1">Métricas de solicitudes y retiros del colegio.</p>
        </div>
        <RangePicker value={rangeKey} onChange={setRangeKey} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          loading={!summary}
          icon={<I.List size={20} />}
          tone="peach"
          label="Solicitudes totales"
          value={String(summary?.totalRequests ?? 0)}
        />
        <MetricCard
          loading={!summary}
          icon={<I.Door size={20} />}
          tone="sage"
          label="Retiros completados"
          value={String(summary?.totalPickups ?? 0)}
        />
        <MetricCard
          loading={!summary}
          icon={<I.CheckCircle size={20} />}
          tone="sage"
          label="Tasa de aprobación"
          value={`${Math.round((summary?.approvalRate ?? 0) * 100)}%`}
          hint="aprobadas vs. rechazadas"
        />
        <MetricCard
          loading={!summary}
          icon={<I.Clock size={20} />}
          tone="amber"
          label="Tiempo prom. de aprobación"
          value={fmtApprovalTime(summary?.avgApprovalHours ?? null)}
          hint="desde que se solicita"
        />
      </div>

      {/* Pick-ups over time + status breakdown */}
      <div className="grid gap-5 lg:gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          icon={<I.TrendingUp size={18} />}
          title="Retiros en el tiempo"
          subtitle="Solicitudes recibidas y retiros completados"
          action={<GranularityToggle value={granularity} onChange={setGranularity} />}
          loading={!pickups}
          empty={pickupsEmpty}
        >
          <div className="flex items-center gap-4 mb-3">
            <LegendDot color="#FFD1B0" label="Solicitudes" />
            <LegendDot color="#FF7A2E" label="Retiros" />
          </div>
          <ResponsiveContainer width="100%" height={284}>
            <BarChart data={pickups ?? []} margin={{ top: 4, right: 6, left: -18, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBDFCB" vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={(v: string) => fmtPeriod(v, granularity)}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                cursor={{ fill: 'rgba(255,122,46,0.06)' }}
                content={<BarTooltip labelFmt={(l: string) => fmtPeriod(l, granularity)} />}
              />
              <Bar dataKey="requests" name="Solicitudes" fill="#FFD1B0" radius={[5, 5, 0, 0]} maxBarSize={44} />
              <Bar dataKey="pickups" name="Retiros" fill="#FF7A2E" radius={[5, 5, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon={<I.PieChart size={18} />}
          title="Estado de las solicitudes"
          subtitle="Distribución por estado"
          loading={!status}
          empty={!!status && status.length === 0}
        >
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={208}>
              <PieChart>
                <Pie
                  data={status ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                >
                  {(status ?? []).map(s => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-3">
              {(status ?? []).map(s => (
                <div key={s.status} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] }} />
                  <span className="text-ink-600 flex-1 truncate">{statusLabel(s.status)}</span>
                  <span className="font-bold text-ink-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Peak times */}
      <div className="grid gap-5 lg:gap-6 lg:grid-cols-2">
        <ChartCard
          icon={<I.Clock size={18} />}
          title="Horarios pico"
          subtitle="Retiros solicitados por hora del día"
          loading={!peak}
          empty={peakHourEmpty}
        >
          <ResponsiveContainer width="100%" height={252}>
            <BarChart data={peak?.byHour ?? []} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBDFCB" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h: number) => `${h}h`}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                cursor={{ fill: 'rgba(255,122,46,0.06)' }}
                content={<BarTooltip labelFmt={(h: number) => `${h}:00 hs`} />}
              />
              <Bar dataKey="count" name="Solicitudes" fill="#FF9655" radius={[5, 5, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon={<I.Calendar size={18} />}
          title="Días de mayor actividad"
          subtitle="Retiros solicitados por día de la semana"
          loading={!peak}
          empty={peakWeekdayEmpty}
        >
          <ResponsiveContainer width="100%" height={252}>
            <BarChart data={weekdayData} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBDFCB" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: 'rgba(122,177,105,0.08)' }} content={<BarTooltip />} />
              <Bar dataKey="count" name="Solicitudes" fill="#8DD5B3" radius={[5, 5, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top students + families */}
      <div className="grid gap-5 lg:gap-6 lg:grid-cols-2">
        <ChartCard
          icon={<I.Trophy size={18} />}
          title="Alumnos con más solicitudes"
          subtitle="Ranking por cantidad de retiros solicitados"
          loading={!topStud}
          empty={!!topStud && topStud.length === 0}
        >
          <RankedList
            items={(topStud ?? []).map(s => ({
              id: s.student_id,
              primary: s.full_name,
              secondary: `${s.course} · ${s.level} · ${s.pickups} retiro${s.pickups === 1 ? '' : 's'}`,
              count: s.count,
            }))}
          />
        </ChartCard>

        <ChartCard
          icon={<I.Users size={18} />}
          title="Familias más activas"
          subtitle="Ranking por cantidad de solicitudes creadas"
          loading={!topFam}
          empty={!!topFam && topFam.length === 0}
        >
          <RankedList
            items={(topFam ?? []).map(f => ({
              id: f.user_id,
              primary: f.full_name,
              count: f.count,
            }))}
            tone="sage"
          />
        </ChartCard>
      </div>
    </div>
  );
}

// ── Inline helpers ───────────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function GranularityToggle({
  value, onChange,
}: { value: AnalyticsGranularity; onChange: (g: AnalyticsGranularity) => void }) {
  const opts: [AnalyticsGranularity, string][] = [['day', 'Día'], ['week', 'Sem'], ['month', 'Mes']];
  return (
    <div className="inline-flex bg-cream-100 border border-warm-line rounded-xl p-0.5 gap-0.5">
      {opts.map(([k, l]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={[
            'h-7 px-2.5 rounded-lg text-xs font-bold transition',
            value === k ? 'bg-white shadow-sm text-peach-700' : 'text-ink-400 hover:text-ink-700',
          ].join(' ')}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label, labelFmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-warm-line rounded-xl shadow-soft px-3 py-2 text-xs">
      <div className="font-bold text-ink-900 mb-1">{labelFmt ? labelFmt(label) : label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color ?? p.fill }} />
          <span className="text-ink-500">{p.name}</span>
          <span className="font-bold text-ink-900 ml-auto pl-3">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const slice = payload[0]?.payload as StatusSlice | undefined;
  if (!slice) return null;
  return (
    <div className="bg-white border border-warm-line rounded-xl shadow-soft px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[slice.status] }} />
        <span className="text-ink-600">{statusLabel(slice.status)}</span>
        <span className="font-bold text-ink-900 ml-auto pl-3">{slice.count}</span>
      </div>
    </div>
  );
}

interface RankedItem { id: number; primary: string; secondary?: string; count: number }

function RankedList({ items, tone = 'peach' }: { items: RankedItem[]; tone?: 'peach' | 'sage' }) {
  const max = Math.max(1, ...items.map(i => i.count));
  const bar = tone === 'sage'
    ? 'bg-gradient-to-r from-sage-300 to-sage-500'
    : 'bg-gradient-to-r from-peach-300 to-peach-500';
  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={it.id} className="flex items-center gap-3">
          <span className="h-7 w-7 shrink-0 rounded-lg bg-cream-100 border border-warm-line text-xs font-extrabold text-ink-500 flex items-center justify-center">
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink-900 text-sm truncate">{it.primary}</span>
              <span className="text-sm font-extrabold text-ink-900 shrink-0">{it.count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-cream-100 overflow-hidden">
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${(it.count / max) * 100}%` }} />
            </div>
            {it.secondary && <div className="text-[11px] text-ink-400 mt-1">{it.secondary}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
