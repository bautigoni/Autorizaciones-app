import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { api } from '../../services/api';
import type { AuthorizationFull, Student } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState, LoadingState } from '../../components/States';
import { I } from '../../components/Icons';
import { formatDateLong, todayISO, relative } from '../../utils/format';

export function FamilyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [auths, setAuths] = useState<AuthorizationFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.listStudents(user.id),
      api.listAuthorizations({ createdBy: user.id, limit: 50 }),
    ]).then(([s, a]) => { setStudents(s); setAuths(a); }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState label="Cargando tu panel..." />;

  const today = todayISO();
  const upcoming = auths.filter(a => a.date >= today && ['pending', 'approved', 'observed'].includes(a.status));

  const statusCounts = {
    pending: auths.filter(a => a.status === 'pending').length,
    approved: auths.filter(a => a.status === 'approved').length,
    completed: auths.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Hero card — full width */}
      <div className="relative overflow-hidden card-gradient p-6 lg:p-8">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-peach-300/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 bottom-0 w-48 h-48 rounded-full bg-sage-300/20 blur-3xl pointer-events-none" />
        <div className="relative lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="flex-1">
            <div className="text-sm font-semibold text-peach-700">
              Hola, {user?.full_name.split(' ')[0]} 👋
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-ink-900 mt-1 leading-tight">
              {upcoming.length > 0
                ? `Tenés ${upcoming.length} retiro${upcoming.length > 1 ? 's' : ''} próximo${upcoming.length > 1 ? 's' : ''}`
                : 'Todo en orden por ahora ✨'}
            </h1>
            <p className="text-sm text-ink-600 mt-2 max-w-lg">
              {upcoming.length > 0
                ? 'Revisá el estado de tus autorizaciones o creá una nueva cuando la necesites.'
                : 'Cuando necesites un retiro, podés cargar la autorización en menos de un minuto.'}
            </p>
          </div>
          <div className="mt-5 lg:mt-0 flex flex-wrap gap-2 lg:flex-col lg:w-56 lg:shrink-0">
            <Button onClick={() => navigate('/familia/autorizaciones/nueva')} icon={<I.Plus size={18} />} full>
              Nueva autorización
            </Button>
            <Button variant="secondary" onClick={() => navigate('/familia/autorizaciones')} icon={<I.List size={16} />} full>
              Ver historial
            </Button>
          </div>
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 space-y-6 lg:space-y-0">

        {/* Left column — main content */}
        <div className="space-y-6 min-w-0">

          {/* Students grid */}
          <section>
            <header className="flex items-center justify-between mb-3 px-0.5">
              <h2 className="font-bold text-ink-900">Tus hijos/as</h2>
              <span className="text-xs text-ink-400 font-medium">{students.length} alumno/s</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {students.map(s => (
                <Link
                  key={s.id}
                  to={`/familia/autorizaciones/nueva?student=${s.id}`}
                  className="card p-4 flex items-center gap-3 hover:shadow-glow transition group"
                >
                  <Avatar name={s.full_name} color={s.avatar_color} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-ink-900 truncate">{s.full_name}</div>
                    <div className="text-xs text-ink-500">{s.course} · {s.level}</div>
                  </div>
                  <I.ChevronRight size={16} className="ml-auto text-ink-300 group-hover:text-peach-500 shrink-0" />
                </Link>
              ))}
              {!students.length && (
                <div className="col-span-full">
                  <EmptyState
                    title="Sin alumnos vinculados"
                    description="Pedile a secretaría que asocie tu cuenta con tu hijo/a."
                  />
                </div>
              )}
            </div>
          </section>

          {/* Upcoming authorizations */}
          <section>
            <header className="flex items-center justify-between mb-3 px-0.5">
              <h2 className="font-bold text-ink-900">Próximas autorizaciones</h2>
              <Link to="/familia/autorizaciones" className="text-xs font-bold text-peach-700 hover:underline">
                Ver todas →
              </Link>
            </header>

            {upcoming.length === 0 ? (
              <EmptyState
                title="Sin retiros próximos"
                description="Creá una autorización cuando necesites que alguien retire a tu hijo/a antes de hora."
                action={
                  <Button onClick={() => navigate('/familia/autorizaciones/nueva')} icon={<I.Plus size={18} />}>
                    Crear autorización
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {upcoming.slice(0, 5).map(a => (
                  <Link
                    key={a.id}
                    to={`/familia/autorizaciones/${a.id}`}
                    className="card p-4 flex items-center gap-3 hover:shadow-glow transition"
                  >
                    <Avatar name={a.student.full_name} color={a.student.avatar_color} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-ink-900 truncate">{a.student.full_name}</div>
                        <StatusBadge status={a.status} size="sm" />
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <I.Calendar size={12} /> {formatDateLong(a.date)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <I.Clock size={12} /> {a.time}
                        </span>
                      </div>
                      <div className="text-xs text-ink-400 mt-1 truncate">
                        Retira: <span className="text-ink-700 font-medium">{a.pickup_adult_name}</span>
                      </div>
                    </div>
                    <I.ChevronRight size={18} className="text-ink-300 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar — desktop only */}
        <div className="hidden lg:flex lg:flex-col lg:gap-5">

          {/* Stats summary */}
          <div className="card p-5">
            <h3 className="font-bold text-ink-900 mb-4">Resumen</h3>
            <div className="space-y-3">
              {[
                { label: 'Pendientes', count: statusCounts.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: <I.Clock size={16} /> },
                { label: 'Aprobadas', count: statusCounts.approved, color: 'text-sage-600', bg: 'bg-sage-100', icon: <I.CheckCircle size={16} /> },
                { label: 'Completadas', count: statusCounts.completed, color: 'text-ink-500', bg: 'bg-cream-100', icon: <I.Shield size={16} /> },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                      {s.icon}
                    </div>
                    <span className="text-sm font-medium text-ink-700">{s.label}</span>
                  </div>
                  <span className="text-lg font-extrabold text-ink-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-bold text-ink-900 mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/familia/autorizaciones/nueva')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-peach-50 border border-peach-200/60 hover:bg-peach-100 transition text-left group"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-peach-400 to-peach-600 text-white flex items-center justify-center shrink-0">
                  <I.Plus size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900">Nueva autorización</div>
                  <div className="text-xs text-ink-500">Autorizar un retiro</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/familia/autorizaciones')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-warm-line hover:bg-cream-100 transition text-left"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-soft border border-peach-200/60 text-peach-600 flex items-center justify-center shrink-0">
                  <I.List size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900">Ver historial</div>
                  <div className="text-xs text-ink-500">Todas tus solicitudes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent activity */}
          {auths.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h3 className="font-bold text-ink-900">Actividad reciente</h3>
              </div>
              <div className="divide-y divide-warm-line/70">
                {auths.slice(0, 4).map(a => (
                  <Link
                    key={a.id}
                    to={`/familia/autorizaciones/${a.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-cream-50 transition"
                  >
                    <Avatar name={a.student.full_name} color={a.student.avatar_color} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-900 truncate">{a.student.full_name}</div>
                      <div className="text-xs text-ink-400">{relative(a.updated_at)}</div>
                    </div>
                    <StatusBadge status={a.status} size="sm" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity — mobile/tablet only */}
      {auths.length > 0 && (
        <section className="lg:hidden">
          <header className="px-0.5 mb-3">
            <h2 className="font-bold text-ink-900">Actividad reciente</h2>
          </header>
          <div className="card divide-y divide-warm-line/70">
            {auths.slice(0, 5).map(a => (
              <Link
                key={a.id}
                to={`/familia/autorizaciones/${a.id}`}
                className="flex items-center gap-3 p-3.5 hover:bg-cream-50 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-soft flex items-center justify-center text-peach-600 shrink-0">
                  <I.Shield size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900 truncate">
                    {a.code} · {a.student.full_name}
                  </div>
                  <div className="text-xs text-ink-400">{relative(a.updated_at)}</div>
                </div>
                <StatusBadge status={a.status} size="sm" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
