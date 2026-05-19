import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { api } from '../../services/api';
import type { AuthorizationFull, AuthStatus } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { EmptyState, LoadingState } from '../../components/States';
import { I } from '../../components/Icons';
import { formatDateLong } from '../../utils/format';

const TABS: { id: AuthStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'observed', label: 'Observadas' },
  { id: 'completed', label: 'Retiradas' },
];

export function FamilyList() {
  const { user } = useAuth();
  const [items, setItems] = useState<AuthorizationFull[]>([]);
  const [tab, setTab] = useState<AuthStatus | 'all'>('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.listAuthorizations({ createdBy: user.id })
      .then(setItems).finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => items.filter(a => {
    if (tab !== 'all' && a.status !== tab) return false;
    if (q) {
      const s = q.toLowerCase();
      return [a.code, a.student.full_name, a.pickup_adult_name, a.reason].some(x => x.toLowerCase().includes(s));
    }
    return true;
  }), [items, tab, q]);

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">Mis autorizaciones</h1>
        <p className="text-sm text-ink-500 mt-0.5">Historial completo de retiros solicitados.</p>
      </div>

      <Input icon={<I.Search size={18} />} placeholder="Buscar por código, alumno, motivo..." value={q} onChange={e => setQ(e.target.value)} />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {TABS.map(t => {
          const active = tab === t.id;
          const count = t.id === 'all' ? items.length : items.filter(i => i.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-semibold whitespace-nowrap transition border',
                active ? 'bg-gradient-to-br from-peach-400 to-peach-600 text-white border-transparent shadow-soft'
                       : 'bg-white text-ink-700 border-warm-line hover:border-peach-300',
              ].join(' ')}
            >
              {t.label}
              <span className={['text-[11px] px-1.5 rounded-full font-bold', active ? 'bg-white/25' : 'bg-cream-100 text-ink-500'].join(' ')}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={q ? 'Probá ajustar la búsqueda o el filtro seleccionado.' : 'No tenés autorizaciones en este estado.'}
        />
      ) : (
        <div className="space-y-2.5 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-1 lg:space-y-2.5 lg:block">
          {filtered.map(a => (
            <Link key={a.id} to={`/familia/autorizaciones/${a.id}`} className="card p-4 flex items-center gap-3 hover:shadow-glow transition">
              <Avatar name={a.student.full_name} color={a.student.avatar_color} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] font-mono font-bold text-peach-700">{a.code}</span>
                  <StatusBadge status={a.status} size="sm" />
                </div>
                <div className="font-bold text-ink-900 truncate text-[15px]">{a.student.full_name}</div>
                <div className="text-xs text-ink-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="flex items-center gap-1"><I.Calendar size={12} />{formatDateLong(a.date)}</span>
                  <span className="flex items-center gap-1"><I.Clock size={12} />{a.time}</span>
                </div>
                <div className="text-xs text-ink-400 mt-1 truncate">Retira <span className="text-ink-700 font-medium">{a.pickup_adult_name}</span></div>
              </div>
              <I.ChevronRight size={18} className="text-ink-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
