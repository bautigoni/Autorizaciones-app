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

  const stats = [
    { label: 'Pendientes', count: auths.filter(a => a.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <I.Clock size={18} /> },
    { label: 'Aprobadas', count: auths.filter(a => a.status === 'approved').length, color: 'text-sage-600', bg: 'bg-sage-100', icon: <I.CheckCircle size={18} /> },
    { label: 'Completadas', count: auths.filter(a => a.status === 'completed').length, color: 'text-ink-500', bg: 'bg-cream-200', icon: <I.Shield size={18} /> },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden card-gradient p-6 sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-peach-300/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-56 h-56 rounded-full bg-sage-300/20 blur-3xl pointer-events-none" />
        <div className="relative lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-peach-700">
              Hola, {user?.full_name.split(' ')[0]} 👋
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.3rem] font-extrabold text-ink-900 mt-1.5 leading-[1.12]">
              {upcoming.length > 0
                ? `Tenés ${upcoming.length} retiro${upcoming.length > 1 ? 's' : ''} próximo${upcoming.length > 1 ? 's' : ''}`
                : 'Todo en orden por ahora ✨'}
            </h1>
            <p className="text-sm sm:text-[15px] text-ink-600 mt-2.5 max-w-xl leading-relaxed">
              {upcoming.length > 0
                ? 'Revisá el estado de tus autorizaciones o creá una nueva cuando la necesites.'
                : 'Cuando necesites un retiro, podés cargar la autorización en menos de un minuto.'}
            </p>
          </div>

          {/* Stat tiles */}
          <div className="mt-6 lg:mt-0 grid grid-cols-3 gap-3 lg:gap-4 lg:shrink-0">
            {stats.map(s => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/85 border border-warm-line/80 px-3 py-3.5 lg:px-5 lg:py-4 text-center lg:text-left lg:min-w-[120px] shadow-soft"
              >
                <div className={`mx-auto lg:mx-0 h-9 w-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-2`}>
                  {s.icon}
                </div>
                <div className="text-2xl lg:text-3xl font-extrabold text-ink-900 leading-none">{s.count}</div>
                <div className="text-[11px] lg:text-xs text-ink-500 font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two-column desktop layout ── */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_340px]">

        {/* Left — main content */}
        <div className="space-y-6 lg:space-y-8 min-w-0">

          {/* Students */}
          <section>
            <header className="flex items-center justify-between mb-3.5 px-0.5">
              <h2 className="text-lg font-bold text-ink-900">Tus hijos/as</h2>
              <span className="text-xs text-ink-400 font-semibold">{students.length} alumno/s</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {students.map(s => (
                <Link
                  key={s.id}
                  to={`/familia/autorizaciones/nueva?student=${s.id}`}
                  className="card p-4 flex items-center gap-3 hover:shadow-glow hover:-translate-y-0.5 transition-all group"
                >
                  <Avatar name={s.full_name} color={s.avatar_color} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-ink-900 truncate">{s.full_name}</div>
                    <div className="text-xs text-ink-500">{s.course} · {s.level}</div>
                  </div>
                  <I.ChevronRight size={16} className="ml-auto text-ink-300 group-hover:text-peach-500 shrink-0 transition" />
                </Link>
              ))}
              {!students.length && (
                <div className="col-span-full card">
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
            <header className="flex items-center justify-between mb-3.5 px-0.5">
              <h2 className="text-lg font-bold text-ink-900">Próximas autorizaciones</h2>
              <Link to="/familia/autorizaciones" className="text-xs font-bold text-peach-700 hover:underline">
                Ver todas →
              </Link>
            </header>

            {upcoming.length === 0 ? (
              <div className="card">
                <EmptyState
                  title="Sin retiros próximos"
                  description="Creá una autorización cuando necesites que alguien retire a tu hijo/a antes de hora."
                  action={
                    <Button onClick={() => navigate('/familia/autorizaciones/nueva')} icon={<I.Plus size={18} />}>
                      Crear autorización
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {upcoming.slice(0, 6).map(a => (
                  <Link
                    key={a.id}
                    to={`/familia/autorizaciones/${a.id}`}
                    className="card p-4 flex items-center gap-3 hover:shadow-glow hover:-translate-y-0.5 transition-all"
                  >
                    <Avatar name={a.student.full_name} color={a.student.avatar_color} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-ink-900 truncate">{a.student.full_name}</div>
                        <StatusBadge status={a.status} size="sm" />
                      </div>
                      <div className="text-xs text-ink-500 mt-1 flex items-center gap-2 flex-wrap">
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
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6 lg:space-y-8 min-w-0">

          {/* Recent activity */}
          <div className="card overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-ink-900">Actividad reciente</h3>
              <Link to="/familia/autorizaciones" className="text-xs font-bold text-peach-700 hover:underline">
                Ver todas
              </Link>
            </div>
            {auths.length > 0 ? (
              <div className="divide-y divide-warm-line/70">
                {auths.slice(0, 5).map(a => (
                  <Link
                    key={a.id}
                    to={`/familia/autorizaciones/${a.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-cream-50 transition"
                  >
                    <Avatar name={a.student.full_name} color={a.student.avatar_color} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-900 truncate">{a.student.full_name}</div>
                      <div className="text-xs text-ink-400">{relative(a.updated_at)}</div>
                    </div>
                    <StatusBadge status={a.status} size="sm" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 pb-6 pt-2 text-sm text-ink-400">
                Todavía no hay movimientos. Tus solicitudes aparecerán acá.
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card p-5">
            <h3 className="font-bold text-ink-900 mb-3.5">¿Cómo funciona?</h3>
            <ol className="space-y-3">
              {[
                { n: '1', t: 'Cargás la autorización', d: 'Elegí alumno, fecha y quién retira.' },
                { n: '2', t: 'El colegio la revisa', d: 'Secretaría la aprueba u observa.' },
                { n: '3', t: 'Retiro seguro', d: 'En portería validan los datos y registran la salida.' },
              ].map(s => (
                <li key={s.n} className="flex gap-3">
                  <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-peach-400 to-peach-600 text-white text-xs font-bold flex items-center justify-center">
                    {s.n}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-900">{s.t}</div>
                    <div className="text-xs text-ink-500 leading-snug">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
