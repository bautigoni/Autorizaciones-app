import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { AuthorizationFull } from '@shared/types';
import { LoadingState } from '../../components/States';
import { Button } from '../../components/Button';
import { I } from '../../components/Icons';
import { formatDateLong } from '../../utils/format';
import { Avatar } from '../../components/Avatar';

export function FamilyConfirm() {
  const { id } = useParams();
  const [a, setA] = useState<AuthorizationFull | null>(null);
  const navigate = useNavigate();
  useEffect(() => { if (id) api.getAuthorization(Number(id)).then(setA); }, [id]);
  if (!a) return <LoadingState />;

  return (
    <div className="space-y-5">
      <div className="card-gradient relative overflow-hidden p-8 text-center">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-sage-300/30 blur-3xl" />
        <div className="relative">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-sage-300 to-sage-600 flex items-center justify-center text-white shadow-glow mb-4">
            <I.CheckCircle size={36} />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900">¡Solicitud enviada!</h1>
          <p className="text-sm text-ink-600 mt-1.5 max-w-sm mx-auto">
            La secretaría del colegio recibirá tu autorización en instantes. Te avisaremos cuando esté aprobada.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 bg-white border border-warm-line rounded-2xl px-4 py-2 shadow-soft">
            <span className="text-xs text-ink-400 font-semibold">Código</span>
            <span className="font-mono font-extrabold text-peach-700 text-lg">{a.code}</span>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar name={a.student.full_name} color={a.student.avatar_color} size={44} />
          <div>
            <div className="font-bold text-ink-900">{a.student.full_name}</div>
            <div className="text-xs text-ink-500">{a.student.course} · {a.student.level}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-warm-line">
          <Field icon={<I.Calendar size={14} />} label="Fecha" value={formatDateLong(a.date)} />
          <Field icon={<I.Clock size={14} />} label="Hora" value={a.time} />
          <Field icon={<I.Sparkle size={14} />} label="Motivo" value={a.reason} full />
          <Field icon={<I.User size={14} />} label="Retira" value={`${a.pickup_adult_name} · DNI ${a.pickup_adult_dni}`} full />
          {a.notes && <Field label="Notas" value={a.notes} full />}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/familia/autorizaciones')} full>Ver mis autorizaciones</Button>
        <Button onClick={() => navigate(`/familia/autorizaciones/${a.id}`)} full>Ver detalle <I.ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

function Field({ icon, label, value, full }: { icon?: React.ReactNode; label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-[11px] text-ink-400 font-semibold uppercase tracking-wide flex items-center gap-1">{icon} {label}</div>
      <div className="text-sm text-ink-900 mt-0.5 font-medium">{value}</div>
    </div>
  );
}
