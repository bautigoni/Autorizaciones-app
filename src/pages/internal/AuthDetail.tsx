import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { AuthorizationFull, AuthStatus } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Textarea } from '../../components/Input';
import { LoadingState, ErrorState } from '../../components/States';
import { I } from '../../components/Icons';
import { formatDateLong, formatDateTime, relative } from '../../utils/format';
import { useToast } from '../../components/Toast';
import { actionLabel } from '../family/Detail';
import { roleLabel } from '../../layouts/InternalLayout';

export function InternalAuthDetail() {
  const { id } = useParams();
  const [a, setA] = useState<AuthorizationFull | null>(null);
  const [error, setError] = useState<string>();
  const [actionModal, setActionModal] = useState<null | { kind: 'reject' | 'observe' | 'note'; }>(null);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  function load() {
    if (!id) return;
    api.getAuthorization(Number(id)).then(setA).catch(e => setError(e.message));
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!a) return <LoadingState />;

  async function doStatus(next: AuthStatus, c?: string) {
    try { setA(await api.setStatus(a!.id, next, c)); toast.push({ tone: 'success', title: 'Estado actualizado' }); }
    catch (e: any) { toast.push({ tone: 'error', title: 'Error', description: e.message }); }
  }
  async function doNote() {
    if (!comment.trim()) return;
    try { setA(await api.addNote(a!.id, comment.trim())); setComment(''); setActionModal(null); toast.push({ tone: 'success', title: 'Nota agregada' }); }
    catch (e: any) { toast.push({ tone: 'error', title: 'Error', description: e.message }); }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-peach-700">
        <I.ArrowLeft size={16} /> Volver
      </button>

      <div className="card-gradient p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar name={a.student.full_name} color={a.student.avatar_color} size={56} />
          <div>
            <div className="text-xs font-mono font-bold text-peach-700">{a.code}</div>
            <h1 className="text-2xl font-extrabold text-ink-900">{a.student.full_name}</h1>
            <div className="text-sm text-ink-500">
              <Link to={`/cole/alumnos/${a.student.id}`} className="hover:underline">{a.student.course} · {a.student.level}</Link>
            </div>
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 card p-5 space-y-4">
          <h3 className="font-bold text-ink-900">Datos del retiro</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Info icon={<I.Calendar size={14} />} label="Fecha" value={formatDateLong(a.date)} />
            <Info icon={<I.Clock size={14} />} label="Hora" value={`${a.time} hs`} />
            <Info icon={<I.Sparkle size={14} />} label="Motivo" value={a.reason} full />
            <Info icon={<I.User size={14} />} label="Retira" value={a.pickup_adult_name} />
            <Info label="DNI" value={a.pickup_adult_dni} />
            <Info label="Relación" value={a.pickup_adult_relation || '—'} />
            <Info label="Solicitada por" value={a.created_by.full_name} />
            <Info label="Email" value={a.created_by.email} />
            {a.notes && <Info label="Observaciones de la familia" value={a.notes} full />}
          </div>

          {a.attachments.length > 0 && (
            <div className="pt-3 border-t border-warm-line">
              <h4 className="font-bold text-ink-900 mb-2 text-sm">Documentos adjuntos</h4>
              <div className="space-y-2">
                {a.attachments.map(at => (
                  <div key={at.id} className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-warm-line">
                    <div className="h-10 w-10 rounded-xl bg-peach-100 text-peach-700 flex items-center justify-center"><I.Upload size={16} /></div>
                    <div className="flex-1"><div className="text-sm font-semibold text-ink-900">{at.filename}</div><div className="text-xs text-ink-400">{(at.size / 1024).toFixed(1)} KB · {at.mime}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="pt-3 border-t border-warm-line flex gap-2 flex-wrap">
            {a.status === 'pending' && (
              <>
                <Button variant="success" onClick={() => doStatus('approved')} icon={<I.Check size={16} strokeWidth={3} />}>Aprobar</Button>
                <Button variant="soft" onClick={() => setActionModal({ kind: 'observe' })} icon={<I.AlertTriangle size={16} />}>Observar</Button>
                <Button variant="danger" onClick={() => setActionModal({ kind: 'reject' })} icon={<I.Close size={16} strokeWidth={3} />}>Rechazar</Button>
              </>
            )}
            {a.status === 'observed' && (
              <Button variant="success" onClick={() => doStatus('approved')}>Aprobar igualmente</Button>
            )}
            <Button variant="secondary" onClick={() => setActionModal({ kind: 'note' })} icon={<I.Edit size={16} />}>Nota interna</Button>
          </div>
        </section>

        {/* Timeline */}
        <section className="card p-5">
          <h3 className="font-bold text-ink-900 mb-4">Historial</h3>
          <ol className="relative border-l-2 border-dashed border-warm-line ml-2 space-y-4">
            {a.history.map(h => (
              <li key={h.id} className="pl-5 relative">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gradient-to-br from-peach-300 to-peach-500 border-2 border-white shadow" />
                <div className="text-sm font-bold text-ink-900">{actionLabel(h.action)}</div>
                <div className="text-xs text-ink-400 mt-0.5">{relative(h.created_at)}</div>
                {h.comment && <div className="mt-1.5 p-2 bg-cream-50 border border-warm-line rounded-xl text-xs text-ink-700">{h.comment}</div>}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setComment(''); }}
        title={
          actionModal?.kind === 'reject' ? 'Rechazar autorización' :
          actionModal?.kind === 'observe' ? 'Observar autorización' :
          'Agregar nota interna'
        }
        description={
          actionModal?.kind === 'reject' ? 'Contale a la familia por qué.' :
          actionModal?.kind === 'observe' ? 'Pedile a la familia los datos que faltan.' :
          'Solo visible para el staff del colegio.'
        }
        footer={<>
          <Button variant="secondary" onClick={() => { setActionModal(null); setComment(''); }}>Cancelar</Button>
          <Button
            variant={actionModal?.kind === 'reject' ? 'danger' : 'primary'}
            onClick={() => {
              if (!actionModal) return;
              if (actionModal.kind === 'note') doNote();
              else doStatus(actionModal.kind === 'reject' ? 'rejected' : 'observed', comment.trim() || undefined).then(() => { setActionModal(null); setComment(''); });
            }}
          >Confirmar</Button>
        </>}
      >
        <Textarea autoFocus placeholder="Escribí un comentario..." value={comment} onChange={e => setComment(e.target.value)} />
      </Modal>
    </div>
  );
}

function Info({ icon, label, value, full }: { icon?: React.ReactNode; label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="text-[11px] text-ink-400 font-bold uppercase tracking-wide flex items-center gap-1">{icon} {label}</div>
      <div className="text-sm text-ink-900 mt-0.5 font-medium">{value}</div>
    </div>
  );
}
