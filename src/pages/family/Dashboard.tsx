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
  const next = upcoming[0];

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="relative overflow-hidden card-gradient p-6">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-peach-300/40 blur-3xl" />
        <div className="relative">
          <div className="text-sm font-semibold text-peach-700">Hola, {user?.full_name.split(' ')[0]}</div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 mt-1 leading-tight">
            {next ? '¿Necesitás que retiren a tu hijo/a hoy?' : 'Todo en orden por ahora ✨'}
          </h1>
          <p className="text-sm text-ink-600 mt-2 max-w-md">
            {next
              ? 'Podés cargar una nueva autorización en menos de un minuto.'
              : 'Cuando necesites un retiro, podés cargar la autorización desde acá.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => navigate('/familia/autorizaciones/nueva')} icon={<I.Plus size={18} />}>
              Nueva autorización
            </Button>
            <Button variant="secondary" onClick={() => navigate('/familia/autorizaciones')} icon={<I.List size={16} />}>
              Ver historial
            </Button>
          </div>
        </div>
      </div>

      {/* Students */}
      <section>
        <header className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-bold text-ink-900">Tus hijos/as</h2>
          <span className="text-xs text-ink-400 font-medium">{students.length} alumno/s</span>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {students.map(s => (
            <Link key={s.id} to={`/familia/autorizaciones/nueva?student=${s.id}`} className="card p-4 flex items-center gap-3 hover:shadow-glow transition group">
              <Avatar name={s.full_name} color={s.avatar_color} size={44} />
              <div className="min-w-0">
                <div className="font-bold text-ink-900 truncate">{s.full_name}</div>
                <div className="text-xs text-ink-500">{s.course} · {s.level}</div>
              </div>
              <I.ChevronRight size={16} className="ml-auto text-ink-300 group-hover:text-peach-500" />
            </Link>
          ))}
          {!students.length && (
            <div className="col-span-2"><EmptyState title="Sin alumnos vinculados" description="Pedile a secretaría que asocie tu cuenta con tu hijo/a." /></div>
          )}
        </div>
      </section>

      {/* Next */}
      <section>
        <header className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-bold text-ink-900">Próximas autorizaciones</h2>
          <Link to="/familia/autorizaciones" className="text-xs font-bold text-peach-700 hover:underline">Ver todas →</Link>
        </header>

        {upcoming.length === 0 ? (
          <EmptyState
            title="Sin retiros próximos"
            description="Creá una autorización cuando necesites que alguien retire a tu hijo/a antes de hora."
            action={<Button onClick={() => navigate('/familia/autorizaciones/nueva')} icon={<I.Plus size={18} />}>Crear autorización</Button>}
          />
        ) : (
          <div className="space-y-2.5">
            {upcoming.slice(0, 4).map(a => (
              <Link key={a.id} to={`/familia/autorizaciones/${a.id}`} className="card p-4 flex items-center gap-3 hover:shadow-glow transition">
                <Avatar name={a.student.full_name} color={a.student.avatar_color} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-ink-900 truncate">{a.student.full_name}</div>
                    <StatusBadge status={a.status} size="sm" />
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><I.Calendar size={12} /> {formatDateLong(a.date)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><I.Clock size={12} /> {a.time}</span>
                  </div>
                  <div className="text-xs text-ink-400 mt-1 truncate">Retira: <span className="text-ink-700 font-medium">{a.pickup_adult_name}</span></div>
                </div>
                <I.ChevronRight size={18} className="text-ink-300" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      {auths.length > 0 && (
        <section>
          <header className="px-1 mb-2"><h2 className="font-bold text-ink-900">Actividad reciente</h2></header>
          <div className="card divide-y divide-warm-line/70">
            {auths.slice(0, 5).map(a => (
              <Link key={a.id} to={`/familia/autorizaciones/${a.id}`} className="flex items-center gap-3 p-3.5 hover:bg-cream-50 transition">
                <div className="h-10 w-10 rounded-xl bg-gradient-soft flex items-center justify-center text-peach-600">
                  <I.Shield size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-900 truncate">{a.code} · {a.student.full_name}</div>
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
