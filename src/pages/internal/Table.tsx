import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { AuthorizationFull, AuthStatus, Student } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { EmptyState, LoadingState } from '../../components/States';
import { Drawer } from '../../components/Modal';
import { I } from '../../components/Icons';
import { formatDateShort, todayISO } from '../../utils/format';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../services/auth';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'observed', label: 'Observadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'completed', label: 'Retiradas' },
  { value: 'expired', label: 'Vencidas' },
  { value: 'cancelled', label: 'Canceladas' },
];

export function InternalTable() {
  const [sp, setSp] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<AuthorizationFull[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerId, setDrawerId] = useState<number | null>(null);

  const status = (sp.get('status') ?? 'all') as AuthStatus | 'all';
  const date = sp.get('date') ?? '';
  const search = sp.get('search') ?? '';
  const level = sp.get('level') ?? 'all';
  const course = sp.get('course') ?? 'all';

  function set(key: string, val: string) {
    const n = new URLSearchParams(sp);
    if (val && val !== 'all') n.set(key, val); else n.delete(key);
    setSp(n, { replace: true });
  }

  function refresh() {
    setLoading(true);
    api.listAuthorizations({
      status: status === 'all' ? undefined : status,
      date: date || undefined,
      search: search || undefined,
      level: level === 'all' ? undefined : level,
      course: course === 'all' ? undefined : course,
    }).then(setItems).finally(() => setLoading(false));
  }

  useEffect(refresh, [status, date, search, level, course]);
  useEffect(() => { api.listStudents().then(setStudents); }, []);

  const levels = useMemo(() => Array.from(new Set(students.map(s => s.level))), [students]);
  const courses = useMemo(() => Array.from(new Set(students.map(s => s.course))).sort(), [students]);

  async function quickAction(id: number, next: AuthStatus, comment?: string) {
    try {
      await api.setStatus(id, next, comment);
      toast.push({ tone: 'success', title: `Solicitud ${next === 'approved' ? 'aprobada' : next === 'rejected' ? 'rechazada' : 'actualizada'}` });
      refresh();
    } catch (e: any) {
      toast.push({ tone: 'error', title: 'No se pudo actualizar', description: e.message });
    }
  }

  const drawer = items.find(i => i.id === drawerId);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Autorizaciones</h1>
          <p className="text-sm text-ink-500 mt-0.5">{items.length} resultado/s</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => exportCSV(items)} icon={<I.Upload size={16} className="rotate-180" />}>Exportar CSV</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <Input icon={<I.Search size={18} />} placeholder="Buscar alumno, código, DNI..." value={search} onChange={e => set('search', e.target.value)} />
        </div>
        <Select full value={status} options={STATUS_OPTIONS as any} onChange={v => set('status', String(v))} />
        <Input type="date" icon={<I.Calendar size={16} />} value={date} onChange={e => set('date', e.target.value)} placeholder="Fecha" />
        <div className="grid grid-cols-2 gap-2">
          <Select full value={level} options={[{ value: 'all', label: 'Todos los niveles' }, ...levels.map(l => ({ value: l, label: l }))]} onChange={v => set('level', String(v))} />
          <Select full value={course} options={[{ value: 'all', label: 'Todos los cursos' }, ...courses.map(c => ({ value: c, label: c }))]} onChange={v => set('course', String(v))} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <LoadingState /> : items.length === 0 ? (
          <EmptyState title="Sin resultados" description="Ajustá los filtros para ver más autorizaciones." />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-50/80 border-b border-warm-line">
                  <tr className="text-left text-xs font-bold text-ink-500 uppercase tracking-wide">
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Alumno/a</th>
                    <th className="px-4 py-3">Curso</th>
                    <th className="px-4 py-3">Fecha / hora</th>
                    <th className="px-4 py-3">Retira</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-line/70">
                  {items.map(a => (
                    <tr key={a.id} className="hover:bg-cream-50 transition group">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-peach-700">{a.code}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerId(a.id)} className="flex items-center gap-2.5 text-left">
                          <Avatar name={a.student.full_name} color={a.student.avatar_color} size={32} />
                          <div>
                            <div className="font-semibold text-ink-900">{a.student.full_name}</div>
                            <div className="text-[11px] text-ink-400">DNI {a.student.dni}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{a.student.course} · {a.student.level}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink-900">{formatDateShort(a.date)}</div>
                        <div className="text-xs text-ink-400">{a.time} hs</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink-900">{a.pickup_adult_name}</div>
                        <div className="text-xs text-ink-400">DNI {a.pickup_adult_dni}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} size="sm" /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === 'pending' && (
                            <>
                              <button onClick={() => quickAction(a.id, 'approved')} title="Aprobar"
                                className="h-8 w-8 rounded-xl bg-sage-100 text-sage-600 hover:bg-sage-300 hover:text-white transition flex items-center justify-center">
                                <I.Check size={14} strokeWidth={3} />
                              </button>
                              <button onClick={() => {
                                const c = prompt('Comentario (opcional):') || '';
                                quickAction(a.id, 'rejected', c);
                              }} title="Rechazar" className="h-8 w-8 rounded-xl bg-coral-100 text-coral-600 hover:bg-coral-500 hover:text-white transition flex items-center justify-center">
                                <I.Close size={14} strokeWidth={3} />
                              </button>
                            </>
                          )}
                          <button onClick={() => setDrawerId(a.id)} title="Ver detalle"
                            className="h-8 w-8 rounded-xl bg-cream-100 text-ink-700 hover:bg-peach-200 transition flex items-center justify-center">
                            <I.Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-warm-line/70">
              {items.map(a => (
                <button key={a.id} onClick={() => setDrawerId(a.id)} className="w-full text-left p-4 hover:bg-cream-50 transition">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.student.full_name} color={a.student.avatar_color} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-peach-700">{a.code}</span>
                        <StatusBadge status={a.status} size="sm" />
                      </div>
                      <div className="font-bold text-ink-900 truncate">{a.student.full_name}</div>
                      <div className="text-xs text-ink-500">{a.student.course} · {formatDateShort(a.date)} {a.time}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawerId(null)} title="Detalle de autorización">
        {drawer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={drawer.student.full_name} color={drawer.student.avatar_color} size={52} />
              <div>
                <div className="font-extrabold text-ink-900 text-lg">{drawer.student.full_name}</div>
                <div className="text-xs text-ink-500">{drawer.student.course} · {drawer.student.level}</div>
              </div>
              <div className="ml-auto"><StatusBadge status={drawer.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Info label="Código" value={drawer.code} />
              <Info label="Fecha" value={formatDateShort(drawer.date)} />
              <Info label="Hora" value={drawer.time} />
              <Info label="Motivo" value={drawer.reason} />
              <Info label="Retira" value={drawer.pickup_adult_name} full />
              <Info label="DNI" value={drawer.pickup_adult_dni} />
              <Info label="Relación" value={drawer.pickup_adult_relation || '—'} />
              {drawer.notes && <Info label="Observaciones" value={drawer.notes} full />}
            </div>

            <div className="flex gap-2 pt-2">
              {drawer.status === 'pending' && (
                <>
                  <Button variant="success" full onClick={() => { quickAction(drawer.id, 'approved'); setDrawerId(null); }}>Aprobar</Button>
                  <Button variant="danger" full onClick={() => { const c = prompt('Motivo del rechazo:') || ''; quickAction(drawer.id, 'rejected', c); setDrawerId(null); }}>Rechazar</Button>
                </>
              )}
              <Button variant="secondary" onClick={() => { setDrawerId(null); navigate(`/cole/autorizaciones/${drawer.id}`); }}>Ver historial completo</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-[11px] text-ink-400 font-bold uppercase tracking-wide">{label}</div>
      <div className="text-sm text-ink-900 font-medium mt-0.5">{value}</div>
    </div>
  );
}

function exportCSV(items: AuthorizationFull[]) {
  const headers = ['code', 'student', 'course', 'date', 'time', 'pickup', 'dni', 'status'];
  const rows = items.map(i => [i.code, i.student.full_name, i.student.course, i.date, i.time, i.pickup_adult_name, i.pickup_adult_dni, i.status]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `autorizaciones-${todayISO()}.csv`; a.click();
  URL.revokeObjectURL(url);
}
