import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import type { AuthorizationFull } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge, statusLabel } from '../../components/Badge';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { EmptyState, LoadingState } from '../../components/States';
import { I } from '../../components/Icons';
import { useToast } from '../../components/Toast';
import { formatDateLong, todayISO } from '../../utils/format';

export function GateSearch() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [today, setToday] = useState<AuthorizationFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuthorizationFull | null>(null);
  const [confirm, setConfirm] = useState(false);

  function refresh() {
    setLoading(true);
    api.listAuthorizations({ date: todayISO() }).then(setToday).finally(() => setLoading(false));
  }
  useEffect(refresh, []);

  const results = useMemo(() => {
    const list = today;
    if (!q.trim()) return list;
    const s = q.trim().toLowerCase();
    return list.filter(a =>
      a.student.full_name.toLowerCase().includes(s) ||
      a.student.dni.includes(s) ||
      a.student.course.toLowerCase().includes(s) ||
      a.code.toLowerCase().includes(s) ||
      a.pickup_adult_dni.includes(s) ||
      a.pickup_adult_name.toLowerCase().includes(s)
    );
  }, [today, q]);

  async function doWithdraw() {
    if (!selected) return;
    try {
      const upd = await api.registerWithdrawal(selected.id);
      setSelected(upd); setConfirm(false);
      toast.push({ tone: 'success', title: `Retiro registrado · ${upd.student.full_name}` });
      refresh();
    } catch (e: any) {
      toast.push({ tone: 'error', title: 'No se pudo registrar', description: e.message });
    }
  }

  return (
    <div className="space-y-5">
      <div className="card-gradient p-6">
        <div className="text-xs font-bold text-peach-700 uppercase tracking-wide">Portería · {formatDateLong(todayISO())}</div>
        <h1 className="text-2xl font-extrabold text-ink-900 mt-1">Validación de retiros</h1>
        <p className="text-sm text-ink-600 mt-1">Buscá al alumno/a o al adulto que viene a retirar y confirmá la salida.</p>
        <div className="mt-4 max-w-2xl">
          <Input
            autoFocus
            icon={<I.Search size={20} />}
            placeholder="Nombre, DNI, curso, código (SS-0001) o DNI del adulto..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="!text-base"
          />
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sage-500" /> {today.filter(a => a.status === 'approved').length} listas para retirar</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> {today.filter(a => a.status === 'pending').length} pendientes</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink-400" /> {today.filter(a => a.status === 'completed').length} ya retirados</span>
        </div>
      </div>

      {loading ? <LoadingState /> : results.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-coral-100 text-coral-600 flex items-center justify-center mb-3">
            <I.AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Sin coincidencias</h3>
          <p className="text-sm text-ink-500 mt-1">No encontramos autorizaciones para hoy con esos datos. Verificá la información o pedile al adulto un documento.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map(a => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="card p-4 text-left hover:shadow-glow transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-peach-700">{a.code}</span>
                <StatusBadge status={a.status} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={a.student.full_name} color={a.student.avatar_color} size={48} />
                <div className="min-w-0">
                  <div className="font-bold text-ink-900 truncate">{a.student.full_name}</div>
                  <div className="text-xs text-ink-500">{a.student.course} · DNI {a.student.dni}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-warm-line text-xs">
                <div className="flex items-center gap-1.5 text-ink-700"><I.Clock size={12} /> {a.time} hs</div>
                <div className="mt-1 text-ink-700 truncate"><span className="text-ink-400">Retira</span> {a.pickup_adult_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected ? `Autorización ${selected.code}` : ''}
      >
        {selected && <GateDetail a={selected} onRegister={() => setConfirm(true)} />}
      </Modal>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="¿Confirmar retiro?"
        description="Vas a registrar la salida del alumno/a. Esta acción queda asentada en el historial."
        footer={<>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Cancelar</Button>
          <Button variant="success" onClick={doWithdraw} icon={<I.CheckCircle size={18} />}>Sí, registrar salida</Button>
        </>}
      >
        {selected && (
          <div className="rounded-2xl bg-cream-50 border border-warm-line p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Avatar name={selected.student.full_name} color={selected.student.avatar_color} size={44} />
              <div>
                <div className="font-bold text-ink-900">{selected.student.full_name}</div>
                <div className="text-xs text-ink-500">{selected.student.course}</div>
              </div>
            </div>
            <div className="text-sm text-ink-700">Lo retira <strong>{selected.pickup_adult_name}</strong> (DNI {selected.pickup_adult_dni}).</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function GateDetail({ a, onRegister }: { a: AuthorizationFull; onRegister: () => void }) {
  const tone = a.status === 'approved' ? 'success' : a.status === 'pending' ? 'warn' : a.status === 'rejected' ? 'danger' : a.status === 'completed' ? 'done' : 'muted';
  const banners: Record<string, { bg: string; icon: React.ReactNode; title: string; sub: string }> = {
    success: { bg: 'from-sage-300 to-sage-600', icon: <I.CheckCircle size={28} />, title: 'AUTORIZADO', sub: 'La familia confirmó este retiro y el colegio lo aprobó.' },
    warn:    { bg: 'from-amber-300 to-amber-500', icon: <I.Clock size={28} />, title: 'PENDIENTE DE APROBACIÓN', sub: 'Aún no fue revisado por el colegio. No registrar el retiro.' },
    danger:  { bg: 'from-coral-300 to-coral-600', icon: <I.Close size={28} strokeWidth={3} />, title: 'RECHAZADO', sub: 'El colegio rechazó este retiro. NO permitir la salida.' },
    done:    { bg: 'from-ink-400 to-ink-700', icon: <I.CheckCircle size={28} />, title: 'YA RETIRADO', sub: 'El alumno ya fue retirado hoy con esta autorización.' },
    muted:   { bg: 'from-ink-300 to-ink-500', icon: <I.AlertTriangle size={28} />, title: statusLabel(a.status).toUpperCase(), sub: 'Revisar con secretaría antes de permitir el retiro.' },
  };
  const b = banners[tone];

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl bg-gradient-to-br ${b.bg} text-white p-5 shadow-soft flex items-center gap-4`}>
        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">{b.icon}</div>
        <div>
          <div className="text-xs font-bold opacity-80">ESTADO</div>
          <div className="text-2xl font-extrabold leading-none">{b.title}</div>
          <div className="text-sm opacity-90 mt-1">{b.sub}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream-50 border border-warm-line p-4">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">Alumno/a</div>
          <div className="flex items-center gap-3">
            <Avatar name={a.student.full_name} color={a.student.avatar_color} size={48} />
            <div>
              <div className="font-extrabold text-ink-900 text-lg">{a.student.full_name}</div>
              <div className="text-sm text-ink-500">{a.student.course} · {a.student.level}</div>
              <div className="text-xs text-ink-400 mt-0.5">DNI {a.student.dni}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-cream-50 border border-warm-line p-4">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">Retira</div>
          <div className="font-extrabold text-ink-900 text-lg">{a.pickup_adult_name}</div>
          <div className="text-sm text-ink-500">{a.pickup_adult_relation}</div>
          <div className="text-sm text-ink-700 mt-1">DNI <span className="font-mono font-bold">{a.pickup_adult_dni}</span></div>
        </div>
        <div className="rounded-2xl bg-cream-50 border border-warm-line p-4">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Hora autorizada</div>
          <div className="font-extrabold text-ink-900 text-2xl">{a.time}</div>
          <div className="text-xs text-ink-500">{formatDateLong(a.date)}</div>
        </div>
        <div className="rounded-2xl bg-cream-50 border border-warm-line p-4">
          <div className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Motivo</div>
          <div className="text-ink-900 font-semibold">{a.reason}</div>
          {a.notes && <div className="text-xs text-ink-500 mt-2 p-2 bg-white rounded-xl border border-warm-line">📝 {a.notes}</div>}
        </div>
      </div>

      <div className="pt-2">
        {a.status === 'approved' ? (
          <Button onClick={onRegister} variant="success" full size="lg" icon={<I.Door size={20} />}>
            Registrar retiro
          </Button>
        ) : (
          <div className="rounded-2xl bg-coral-100 border border-coral-300 text-coral-600 p-4 text-center font-semibold">
            No se puede registrar el retiro en este estado.
          </div>
        )}
      </div>
    </div>
  );
}
