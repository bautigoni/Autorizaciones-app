import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { AuthorizationFull, Student } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import { LoadingState } from '../../components/States';
import { I } from '../../components/Icons';
import { formatDateLong } from '../../utils/format';

export function InternalStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [auths, setAuths] = useState<AuthorizationFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getStudent(Number(id)), api.listAuthorizations({ studentId: Number(id) })])
      .then(([s, a]) => { setStudent(s); setAuths(a); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !student) return <LoadingState />;
  const stats = {
    total: auths.length,
    completed: auths.filter(a => a.status === 'completed').length,
    pending: auths.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-peach-700">
        <I.ArrowLeft size={16} /> Volver
      </button>

      <div className="card-gradient p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar name={student.full_name} color={student.avatar_color} size={64} />
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">{student.full_name}</h1>
            <div className="text-sm text-ink-500">{student.course} · {student.level} · DNI {student.dni}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Retiros" value={stats.completed} tone="sage" />
          <Stat label="Pendientes" value={stats.pending} tone="peach" />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-ink-900 mb-3">Historial de autorizaciones</h3>
        <div className="space-y-2">
          {auths.map(a => (
            <Link key={a.id} to={`/cole/autorizaciones/${a.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream-50 border border-transparent hover:border-warm-line transition">
              <div className="h-10 w-10 rounded-xl bg-gradient-soft text-peach-600 flex items-center justify-center"><I.Shield size={16} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-mono text-xs text-peach-700">{a.code}</span> · <span className="text-sm text-ink-700">{formatDateLong(a.date)} · {a.time}</span></div>
                <div className="text-xs text-ink-500 mt-0.5">{a.reason} · Retira {a.pickup_adult_name}</div>
              </div>
              <StatusBadge status={a.status} size="sm" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'peach' | 'sage' }) {
  const c = tone === 'peach' ? 'text-peach-700' : tone === 'sage' ? 'text-sage-600' : 'text-ink-900';
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-warm-line text-center min-w-[80px]">
      <div className={`text-2xl font-extrabold ${c}`}>{value}</div>
      <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}
