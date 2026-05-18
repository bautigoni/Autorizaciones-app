import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { api } from '../../services/api';
import type { Student, AuthorizedAdult } from '@shared/types';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Input, Textarea } from '../../components/Input';
import { Select } from '../../components/Select';
import { Radio } from '../../components/Checkbox';
import { I } from '../../components/Icons';
import { useToast } from '../../components/Toast';
import { todayISO } from '../../utils/format';

const REASONS = [
  { value: 'Turno médico', label: 'Turno médico', icon: '🩺' },
  { value: 'Trámite familiar', label: 'Trámite familiar', icon: '📋' },
  { value: 'Práctica deportiva', label: 'Práctica deportiva', icon: '⚽' },
  { value: 'Cita odontológica', label: 'Cita odontológica', icon: '🦷' },
  { value: 'Motivo personal', label: 'Motivo personal', icon: '💬' },
  { value: 'Estudio / examen', label: 'Estudio / examen', icon: '📘' },
  { value: 'Otro', label: 'Otro', icon: '✨' },
];

export function FamilyNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [sp] = useSearchParams();
  const presetStudent = sp.get('student');

  const [step, setStep] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [adults, setAdults] = useState<AuthorizedAdult[]>([]);
  const [studentId, setStudentId] = useState<number | null>(presetStudent ? Number(presetStudent) : null);

  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('15:00');
  const [reason, setReason] = useState('Turno médico');
  const [notes, setNotes] = useState('');

  const [adultMode, setAdultMode] = useState<'saved' | 'manual'>('saved');
  const [selectedAdultId, setSelectedAdultId] = useState<number | null>(null);
  const [adultName, setAdultName] = useState('');
  const [adultDni, setAdultDni] = useState('');
  const [adultRel, setAdultRel] = useState('');
  const [saveAdult, setSaveAdult] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    api.listStudents(user.id).then(s => {
      setStudents(s);
      if (!studentId && s.length === 1) setStudentId(s[0].id);
    });
    api.listAdults(user.id).then(a => {
      setAdults(a);
      if (a.length > 0) { setAdultMode('saved'); setSelectedAdultId(a[0].id); }
      else setAdultMode('manual');
    });
  }, [user]);

  const student = students.find(s => s.id === studentId);

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0 && !studentId) e.student = 'Elegí un alumno/a';
    if (step === 1) {
      if (!date) e.date = 'Requerido';
      if (!time) e.time = 'Requerido';
      if (!reason) e.reason = 'Elegí un motivo';
    }
    if (step === 2) {
      if (adultMode === 'saved' && !selectedAdultId) e.adult = 'Elegí un adulto';
      if (adultMode === 'manual') {
        if (!adultName.trim()) e.adultName = 'Nombre requerido';
        if (!adultDni.trim() || adultDni.length < 6) e.adultDni = 'DNI inválido';
        if (!adultRel.trim()) e.adultRel = 'Indicá la relación';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() { if (validateStep()) setStep(s => Math.min(2, s + 1)); }
  function back() { setStep(s => Math.max(0, s - 1)); }

  async function submit() {
    if (!validateStep() || !user || !studentId) return;
    setSubmitting(true);
    try {
      let pickupName = adultName, pickupDni = adultDni, pickupRel = adultRel;
      if (adultMode === 'saved') {
        const a = adults.find(x => x.id === selectedAdultId)!;
        pickupName = a.full_name; pickupDni = a.dni; pickupRel = a.relation;
      } else if (saveAdult) {
        try { await api.createAdult({ family_user_id: user.id, full_name: adultName, dni: adultDni, relation: adultRel, phone: '' }); } catch {}
      }
      const created = await api.createAuthorization({
        student_id: studentId,
        created_by_user_id: user.id,
        pickup_adult_name: pickupName,
        pickup_adult_dni: pickupDni,
        pickup_adult_relation: pickupRel,
        date, time, reason, notes,
      });
      if (file) {
        try {
          await api.addAttachment(created.id, { filename: file.name, mime: file.type || 'application/octet-stream', size: file.size });
        } catch {}
      }
      toast.push({ tone: 'success', title: 'Autorización creada', description: created.code });
      navigate(`/familia/autorizaciones/confirmada/${created.id}`, { replace: true });
    } catch (e: any) {
      toast.push({ tone: 'error', title: 'No pudimos crear la autorización', description: e.message });
    } finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-peach-700">
        <I.ArrowLeft size={16} /> Volver
      </button>

      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Nueva autorización</h1>
        <p className="text-sm text-ink-500 mt-0.5">3 pasos rápidos para autorizar un retiro.</p>
      </header>

      {/* Stepper */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {['Alumno', 'Detalles', 'Quién retira'].map((label, i) => {
            const done = i < step, active = i === step;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={[
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition',
                    done ? 'bg-gradient-to-br from-sage-300 to-sage-600 text-white' :
                    active ? 'bg-gradient-to-br from-peach-400 to-peach-600 text-white shadow-sm' :
                    'bg-cream-100 text-ink-400 border border-warm-line',
                  ].join(' ')}>
                    {done ? <I.Check size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold truncate ${active ? 'text-peach-700' : done ? 'text-ink-700' : 'text-ink-400'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-sage-500' : 'bg-warm-line'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="card p-5 sm:p-6 space-y-5">
        {step === 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-ink-900">¿A quién vas a retirar?</h2>
            {students.length === 0 ? (
              <p className="text-sm text-ink-500">No tenés alumnos vinculados a tu cuenta.</p>
            ) : (
              <div className="space-y-2">
                {students.map(s => {
                  const sel = studentId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStudentId(s.id)}
                      className={[
                        'w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition text-left',
                        sel ? 'border-peach-400 bg-peach-50' : 'border-warm-line bg-white hover:border-peach-200',
                      ].join(' ')}
                    >
                      <Avatar name={s.full_name} color={s.avatar_color} size={42} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-ink-900">{s.full_name}</div>
                        <div className="text-xs text-ink-500">{s.course} · {s.level} · DNI {s.dni}</div>
                      </div>
                      <div className={['h-6 w-6 rounded-full flex items-center justify-center transition',
                        sel ? 'bg-gradient-to-br from-peach-400 to-peach-600 text-white' : 'border-2 border-warm-line'].join(' ')}>
                        {sel && <I.Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.student && <div className="text-xs text-coral-600">{errors.student}</div>}
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <h2 className="font-bold text-ink-900">¿Cuándo y por qué?</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Fecha" type="date" icon={<I.Calendar size={16} />} value={date} onChange={e => setDate(e.target.value)} error={errors.date} min={todayISO()} />
              <Input label="Hora" type="time" icon={<I.Clock size={16} />} value={time} onChange={e => setTime(e.target.value)} error={errors.time} />
            </div>
            <Select
              full
              label="Motivo"
              value={reason}
              options={REASONS}
              onChange={setReason}
            />
            <Textarea label="Observaciones (opcional)" placeholder="Ej. retira en auto blanco, llega 10 min antes..." value={notes} onChange={e => setNotes(e.target.value)} />

            <div>
              <div className="mb-1.5 text-sm font-semibold text-ink-700">Documento adjunto (opcional)</div>
              <label className="block rounded-2xl border-2 border-dashed border-warm-line hover:border-peach-300 bg-cream-50 transition p-5 text-center cursor-pointer">
                <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-soft flex items-center justify-center text-peach-600 mb-2">
                  <I.Upload size={20} />
                </div>
                <div className="text-sm font-semibold text-ink-700">{file ? file.name : 'Subí turno médico, citación u otro'}</div>
                <div className="text-xs text-ink-400 mt-0.5">JPG, PNG o PDF · máx 4 MB</div>
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="font-bold text-ink-900">¿Quién retira?</h2>
            <div className="flex gap-2 p-1 bg-cream-100 rounded-full w-fit">
              {[
                { id: 'saved', label: 'Adulto guardado', disabled: adults.length === 0 },
                { id: 'manual', label: 'Cargar nuevo' },
              ].map(o => (
                <button
                  key={o.id}
                  type="button"
                  disabled={o.disabled}
                  onClick={() => setAdultMode(o.id as any)}
                  className={[
                    'h-8 px-4 rounded-full text-sm font-semibold transition disabled:opacity-50',
                    adultMode === o.id ? 'bg-white shadow text-peach-700' : 'text-ink-500 hover:text-ink-700',
                  ].join(' ')}
                >{o.label}</button>
              ))}
            </div>

            {adultMode === 'saved' && (
              <div className="space-y-2">
                {adults.map(a => {
                  const sel = selectedAdultId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAdultId(a.id)}
                      className={[
                        'w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition text-left',
                        sel ? 'border-peach-400 bg-peach-50' : 'border-warm-line bg-white hover:border-peach-200',
                      ].join(' ')}
                    >
                      <Avatar name={a.full_name} size={40} color="#FFD1B0" />
                      <div className="flex-1">
                        <div className="font-bold text-ink-900">{a.full_name}</div>
                        <div className="text-xs text-ink-500">{a.relation} · DNI {a.dni}</div>
                      </div>
                      <Radio checked={sel} onChange={() => setSelectedAdultId(a.id)} />
                    </button>
                  );
                })}
                {adults.length === 0 && <div className="text-sm text-ink-500">Todavía no guardaste ningún adulto autorizado.</div>}
                {errors.adult && <div className="text-xs text-coral-600">{errors.adult}</div>}
              </div>
            )}

            {adultMode === 'manual' && (
              <div className="space-y-3">
                <Input label="Nombre completo" placeholder="Ej. Marina González" value={adultName} onChange={e => setAdultName(e.target.value)} error={errors.adultName} icon={<I.User size={16} />} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="DNI" placeholder="00000000" value={adultDni} onChange={e => setAdultDni(e.target.value.replace(/\D/g, ''))} error={errors.adultDni} />
                  <Input label="Relación" placeholder="abuela, tío..." value={adultRel} onChange={e => setAdultRel(e.target.value)} error={errors.adultRel} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="hidden" checked={saveAdult} onChange={() => setSaveAdult(v => !v)} />
                  <span className={['h-6 w-6 rounded-lg border-2 flex items-center justify-center transition',
                    saveAdult ? 'bg-gradient-to-br from-peach-400 to-peach-600 border-peach-500' : 'border-warm-line bg-white'].join(' ')}>
                    {saveAdult && <I.Check size={14} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-ink-700">Guardar este adulto para próximas autorizaciones</span>
                </label>
              </div>
            )}

            {/* Review */}
            {student && (
              <div className="rounded-2xl bg-gradient-soft border border-peach-200/60 p-4">
                <div className="text-xs font-bold text-peach-700 uppercase tracking-wide mb-2">Resumen</div>
                <div className="text-sm text-ink-700 space-y-1">
                  <div><strong>{student.full_name}</strong> · {student.course}</div>
                  <div>{new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })} a las {time}</div>
                  <div>Motivo: {reason}</div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="flex gap-2">
        {step > 0 && <Button variant="secondary" onClick={back} icon={<I.ArrowLeft size={16} />}>Atrás</Button>}
        <div className="flex-1" />
        {step < 2 ? (
          <Button onClick={next}>Siguiente <I.ArrowRight size={16} /></Button>
        ) : (
          <Button onClick={submit} loading={submitting} variant="primary">Crear autorización <I.Check size={16} /></Button>
        )}
      </div>
    </div>
  );
}
