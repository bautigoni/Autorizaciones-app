import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { AuthorizationFull, DashboardMetrics } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/States';
import { I } from '../../components/Icons';
import { formatDateLong, formatDateShort, todayISO } from '../../utils/format';

const METRIC_TILES = [
  { id: 'pending',   label: 'Pendientes',  tone: 'from-amber-200 to-amber-400',  icon: I.Clock },
  { id: 'approved',  label: 'Aprobadas',   tone: 'from-sage-300 to-sage-500',    icon: I.CheckCircle },
  { id: 'observed',  label: 'Observadas',  tone: 'from-peach-300 to-peach-500',  icon: I.AlertTriangle },
  { id: 'rejected',  label: 'Rechazadas',  tone: 'from-coral-300 to-coral-500',  icon: I.Close },
  { id: 'completed', label: 'Retiros',     tone: 'from-sage-300 to-sage-600',    icon: I.Door },
  { id: 'expired',   label: 'Vencidas',    tone: 'from-ink-300 to-ink-500',      icon: I.Bell },
] as const;

export function InternalDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [today, setToday] = useState<AuthorizationFull[]>([]);
  const [week, setWeek] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = todayISO();
    Promise.all([
      api.metrics(t),
      api.listAuthorizations({ date: t }),
      api.metricsWeekly(),
    ]).then(([m, list, w]) => { setMetrics(m); setToday(list); setWeek(w); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const maxWeek = Math.max(1, ...week.map(d => d.todayTotal));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card-gradient relative overflow-hidden p-6 lg:p-8">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-peach-300/40 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-bold text-peach-700 uppercase tracking-wide">Hoy · {formatDateLong(todayISO())}</div>
            <h1 className="text-3xl font-extrabold text-ink-900 mt-1">Panel de autorizaciones</h1>
            <p className="text-sm text-ink-600 mt-1.5 max-w-xl">Revisá rápido lo que está pasando hoy: pendientes por aprobar, retiros agendados y movimientos recientes.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/cole/autorizaciones')} icon={<I.List size={16} />}>Ver tabla</Button>
            <Button onClick={() => navigate('/cole/autorizaciones?status=pending')} icon={<I.Bell size={16} />}>Pendientes</Button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRIC_TILES.map(t => {
          const Icon = t.icon;
          const val = (metrics as any)?.[t.id] ?? 0;
          return (
            <button
              key={t.id}
              onClick={() => navigate(`/cole/autorizaciones?status=${t.id}`)}
              className="card p-4 text-left hover:shadow-glow transition group"
            >
              <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${t.tone} text-white flex items-center justify-center mb-3 shadow-sm`}>
                <Icon size={18} />
              </div>
              <div className="text-3xl font-extrabold text-ink-900 leading-none">{val}</div>
              <div className="text-xs text-ink-500 font-semibold mt-1.5">{t.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Today list */}
        <section className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900">Agenda de hoy</h2>
            <Link to="/cole/autorizaciones" className="text-xs font-bold text-peach-700 hover:underline">Ver todas →</Link>
          </div>
          {today.length === 0 ? (
            <EmptyState title="Sin retiros hoy" description="Cuando una familia cargue una autorización para hoy, va a aparecer acá." />
          ) : (
            <div className="space-y-2">
              {today.map(a => (
                <Link key={a.id} to={`/cole/autorizaciones/${a.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream-50 border border-transparent hover:border-warm-line transition">
                  <Avatar name={a.student.full_name} color={a.student.avatar_color} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink-900 truncate">{a.student.full_name}</span>
                      <span className="text-[11px] font-mono text-ink-400">{a.code}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 flex flex-wrap gap-x-2">
                      <span>{a.student.course}</span><span>·</span>
                      <span className="flex items-center gap-1"><I.Clock size={12} /> {a.time}</span><span>·</span>
                      <span>Retira <span className="text-ink-700">{a.pickup_adult_name}</span></span>
                    </div>
                  </div>
                  <StatusBadge status={a.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Weekly heatmap */}
        <section className="card p-5">
          <h2 className="font-bold text-ink-900 mb-4">Semana</h2>
          <div className="space-y-2.5">
            {week.map(d => {
              const isToday = d.date === todayISO();
              const pct = (d.todayTotal / maxWeek) * 100;
              return (
                <button
                  key={d.date}
                  onClick={() => navigate(`/cole/autorizaciones?date=${d.date}`)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold ${isToday ? 'text-peach-700' : 'text-ink-700'}`}>{formatDateShort(d.date)}{isToday && ' · hoy'}</span>
                    <span className="text-ink-400 font-medium">{d.todayTotal}</span>
                  </div>
                  <div className="h-2 rounded-full bg-cream-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isToday ? 'bg-gradient-to-r from-peach-400 to-peach-600' : 'bg-gradient-to-r from-peach-200 to-peach-300 group-hover:from-peach-300 group-hover:to-peach-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
