import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { AuthorizationFull } from '@shared/types';
import { LoadingState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Avatar } from '../../components/Avatar';
import { I } from '../../components/Icons';
import { formatDateLong, formatDateTime, relative } from '../../utils/format';
import { useToast } from '../../components/Toast';

export function FamilyDetail() {
  const { id } = useParams();
  const [a, setA] = useState<AuthorizationFull | null>(null);
  const [error, setError] = useState<string>();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  function load() {
    if (!id) return;
    api.getAuthorization(Number(id)).then(setA).catch(e => setError(e.message));
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!a) return <LoadingState />;

  const editable = ['pending', 'observed'].includes(a.status);

  async function doCancel() {
    try {
      const upd = await api.cancel(a!.id);
      setA(upd); setConfirmCancel(false);
      toast.push({ tone: 'success', title: 'Autorización cancelada' });
    } catch (e: any) {
      toast.push({ tone: 'error', title: 'No se pudo cancelar', description: e.message });
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-peach-700">
        <I.ArrowLeft size={16} /> Volver
      </button>

      <div className="card-gradient p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono font-extrabold text-peach-700">{a.code}</span>
          <StatusBadge status={a.status} />
        </div>
        <div className="flex items-center gap-3">
          <Avatar name={a.student.full_name} color={a.student.avatar_color} size={52} />
          <div>
            <div className="font-extrabold text-ink-900 text-lg">{a.student.full_name}</div>
            <div className="text-sm text-ink-500">{a.student.course} · {a.student.level}</div>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-bold text-ink-900">Detalles del retiro</h3>
        <div className="grid grid-cols-2 gap-3">
          <Info icon={<I.Calendar size={14} />} label="Fecha" value={formatDateLong(a.date)} />
          <Info icon={<I.Clock size={14} />} label="Hora" value={a.time} />
          <Info icon={<I.Sparkle size={14} />} label="Motivo" value={a.reason} full />
          <Info icon={<I.User size={14} />} label="Retira" value={a.pickup_adult_name} />
          <Info label="DNI" value={a.pickup_adult_dni} />
          {a.pickup_adult_relation && <Info label="Relación" value={a.pickup_adult_relation} full />}
          {a.notes && <Info label="Observaciones" value={a.notes} full />}
        </div>
      </div>

      {a.attachments.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-ink-900 mb-3">Documentos</h3>
          <div className="space-y-2">
            {a.attachments.map(at => (
              <div key={at.id} className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-warm-line">
                <div className="h-10 w-10 rounded-xl bg-peach-100 text-peach-700 flex items-center justify-center"><I.Upload size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-ink-900 truncate">{at.filename}</div>
                  <div className="text-xs text-ink-400">{(at.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-bold text-ink-900 mb-4">Historial</h3>
        <ol className="relative border-l-2 border-dashed border-warm-line ml-2 space-y-4">
          {a.history.map(h => (
            <li key={h.id} className="pl-5 relative">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gradient-to-br from-peach-300 to-peach-500 border-2 border-white shadow" />
              <div className="text-sm font-bold text-ink-900 capitalize">{actionLabel(h.action)}</div>
              <div className="text-xs text-ink-400 mt-0.5">{relative(h.created_at)} · {formatDateTime(h.created_at)}</div>
              {h.comment && <div className="mt-1 p-2 bg-cream-50 border border-warm-line rounded-xl text-xs text-ink-700">{h.comment}</div>}
            </li>
          ))}
        </ol>
      </div>

      {editable && (
        <div className="flex gap-2">
          <Button variant="danger" full onClick={() => setConfirmCancel(true)} icon={<I.Trash size={16} />}>Cancelar autorización</Button>
        </div>
      )}

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="¿Cancelar esta autorización?"
        description="No vas a poder revertir esta acción."
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmCancel(false)}>No, mantener</Button>
          <Button variant="danger" onClick={doCancel}>Sí, cancelar</Button>
        </>}
      >
        <p className="text-sm text-ink-700">El colegio será notificado. Si necesitás otro retiro tendrás que crear una nueva.</p>
      </Modal>
    </div>
  );
}

function Info({ icon, label, value, full }: { icon?: React.ReactNode; label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-[11px] text-ink-400 font-semibold uppercase tracking-wide flex items-center gap-1">{icon} {label}</div>
      <div className="text-sm text-ink-900 mt-0.5 font-medium">{value}</div>
    </div>
  );
}

export function actionLabel(a: string): string {
  return ({
    created: 'Creada por la familia',
    approved: 'Aprobada por el colegio',
    rejected: 'Rechazada por el colegio',
    observed: 'Observada · faltan datos',
    cancelled: 'Cancelada por la familia',
    withdrawn: 'Retiro registrado en portería',
    expired: 'Vencida automáticamente',
    edited: 'Solicitud editada',
    note_added: 'Nota interna agregada',
  } as Record<string, string>)[a] ?? a;
}
