import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { useAuth } from '../services/auth';
import { useToast } from '../components/Toast';
import { I } from '../components/Icons';

type AccessType = 'family' | 'school';

const DEMO_ACCOUNTS = {
  family: [
    { label: 'Familia González', email: 'maria@familia.edu', sub: 'Sofía y Tomás' },
    { label: 'Familia Ruiz', email: 'pablo@familia.edu', sub: 'Valentina' },
    { label: 'Familia Méndez', email: 'lucia@familia.edu', sub: 'Bruno y Camila' },
  ],
  school: [
    { label: 'Andrea López', email: 'preceptor@cole.edu', sub: 'Preceptoría' },
    { label: 'Carlos Pérez', email: 'secretaria@cole.edu', sub: 'Secretaría' },
  ],
};

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [accessType, setAccessType] = useState<AccessType>('family');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [googleMsg, setGoogleMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const u = await login(email.trim().toLowerCase(), password);
      toast.push({ tone: 'success', title: `¡Bienvenido/a, ${u.full_name}!` });
      navigate('/', { replace: true });
    } catch (e: any) {
      setErr(e.message || 'No pudimos iniciar sesión');
    }
  }

  function quickLogin(addr: string) {
    setEmail(addr);
    setPassword('demo');
    setTimeout(() =>
      login(addr, 'demo').then(u => {
        toast.push({ tone: 'success', title: `Sesión iniciada · ${u.full_name}` });
        navigate('/', { replace: true });
      }).catch(e => setErr(e.message)),
      50,
    );
  }

  async function handleGoogleLogin() {
    setGoogleMsg('');
    try {
      const res = await fetch('/api/auth/google/init');
      const data = await res.json();
      if (!res.ok) {
        setGoogleMsg(data.message ?? 'Google OAuth no está disponible en este momento.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setGoogleMsg('Error al conectar con el servidor.');
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-12 sm:py-16">

      {/* ── Background ── */}
      <div className="absolute inset-0" style={{ background: '#FBF7EE' }} />

      {/* Sage green — top-left */}
      <div className="absolute pointer-events-none" style={{
        width: '62vw', height: '62vw', maxWidth: 760, maxHeight: 760,
        top: '-18%', left: '-14%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(178,214,164,0.65) 0%, rgba(178,214,164,0.22) 50%, transparent 70%)',
        filter: 'blur(36px)',
      }} />

      {/* Peach — top-right */}
      <div className="absolute pointer-events-none" style={{
        width: '52vw', height: '52vw', maxWidth: 640, maxHeight: 640,
        top: '-10%', right: '-12%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,183,133,0.58) 0%, rgba(255,193,140,0.18) 50%, transparent 70%)',
        filter: 'blur(42px)',
      }} />

      {/* Orange glow — bottom-right (strong brand anchor) */}
      <div className="absolute pointer-events-none" style={{
        width: '48vw', height: '48vw', maxWidth: 580, maxHeight: 580,
        bottom: '-12%', right: '0%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,122,46,0.30) 0%, rgba(255,168,120,0.14) 48%, transparent 68%)',
        filter: 'blur(48px)',
      }} />

      {/* Mint — bottom-left */}
      <div className="absolute pointer-events-none" style={{
        width: '40vw', height: '40vw', maxWidth: 480, maxHeight: 480,
        bottom: '-8%', left: '6%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(141,213,179,0.38) 0%, rgba(141,213,179,0.10) 50%, transparent 68%)',
        filter: 'blur(40px)',
      }} />

      {/* Warm center wash — keeps the middle from feeling too blank */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,244,236,0.55) 0%, transparent 80%)',
      }} />

      {/* ── Content ── */}
      <div className="relative w-full max-w-md flex flex-col items-center">

        {/* Logo — single instance, sits on cream bg via multiply */}
        <img
          src="/brand/logo-horizontal-sm.png"
          alt="NexoEscolar"
          draggable={false}
          className="h-11 w-auto mb-7"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Headline */}
        <div className="text-center mb-8 px-2">
          {/* Sage green accent dots */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-400" />
            <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-sage-300 to-peach-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-peach-400" />
          </div>
          <h1 className="text-2xl sm:text-[1.8rem] font-extrabold text-ink-900 leading-snug tracking-tight">
            Retiros escolares,{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #E96416, #FF7A2E)' }}>
              simples y seguros.
            </span>
          </h1>
          <p className="text-sm text-ink-500 mt-2.5 leading-relaxed max-w-xs mx-auto">
            Todo el flujo de autorización en un solo lugar, para familias y el colegio.
          </p>
        </div>

        {/* ── Card ── */}
        <div className="w-full relative bg-white/88 backdrop-blur-md border border-peach-200/70 rounded-3xl px-7 py-8 sm:px-9" style={{ boxShadow: '0 8px 40px -8px rgba(255,122,46,0.18), 0 2px 12px -4px rgba(201,138,80,0.12), 0 0 0 1px rgba(255,183,133,0.18)' }}>
          {/* Orange accent strip at top of card */}
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl overflow-hidden">
            <div className="h-full" style={{ background: 'linear-gradient(90deg, #B2D6A4 0%, #FFB785 40%, #FF7A2E 100%)' }} />
          </div>

          {/* Access type selector */}
          <div className="flex rounded-2xl bg-cream-200/60 border border-peach-100 p-1 gap-1">
            {([
              { key: 'family' as AccessType, label: 'Familia', icon: <I.Users size={15} /> },
              { key: 'school' as AccessType, label: 'Colegio', icon: <I.Shield size={15} /> },
            ]).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setAccessType(t.key); setErr(''); setEmail(''); }}
                className={[
                  'flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all duration-150',
                  accessType === t.key
                    ? 'bg-gradient-to-br from-peach-400 to-peach-600 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-800',
                ].join(' ')}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Google login */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-2xl border border-warm-line bg-white hover:bg-cream-50 hover:border-peach-200 text-sm font-semibold text-ink-800 transition shadow-sm focus-visible:shadow-ring"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
            {googleMsg && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                <I.AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-snug">{googleMsg}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-warm-line" />
            <span className="text-xs text-ink-400 font-medium">o con correo</span>
            <div className="flex-1 h-px bg-warm-line" />
          </div>

          {/* Email + password */}
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              required
              placeholder={accessType === 'family' ? 'tu@familia.edu' : 'nombre@cole.edu'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<I.Mail size={18} />}
            />
            <Input
              label="Contraseña"
              type={showPw ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<I.Lock size={18} />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="text-ink-400 hover:text-peach-500 transition"
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPw ? <I.EyeOff size={18} /> : <I.Eye size={18} />}
                </button>
              }
              error={err || undefined}
            />
            <div className="flex items-center justify-between">
              <Checkbox checked={remember} onChange={setRemember} label="Recordarme" size="sm" />
              <button type="button" className="text-sm font-semibold text-peach-700 hover:underline transition">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button type="submit" full size="lg" loading={loading}>
              Entrar
              <I.ArrowRight size={18} />
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-warm-line" />
              <span className="text-xs text-ink-400 font-medium">cuentas demo</span>
              <div className="flex-1 h-px bg-warm-line" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS[accessType].map(a => (
                <button
                  key={a.email}
                  onClick={() => quickLogin(a.email)}
                  type="button"
                  className="group text-left rounded-xl border border-warm-line bg-white/70 hover:border-peach-200 hover:bg-peach-50/50 transition p-2.5"
                >
                  <div className="text-xs font-bold text-ink-900 group-hover:text-peach-700 transition">{a.label}</div>
                  <div className="text-[10px] text-ink-400 mt-0.5">{a.sub}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-3 text-center">
              Contraseña demo:{' '}
              <code className="bg-cream-100 px-1.5 py-0.5 rounded font-mono text-peach-700">demo</code>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-[11px] text-ink-300 text-center">
          © {new Date().getFullYear()} NexoEscolar · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
