import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Logo } from '../components/Logo';
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

const VALUE_PROPS = [
  { icon: <I.Users size={20} />, title: 'Para toda la familia', desc: 'Autorizá un retiro en menos de un minuto, desde el celular.' },
  { icon: <I.Shield size={20} />, title: 'Aprobación del colegio', desc: 'Secretaría revisa y valida cada solicitud antes del retiro.' },
  { icon: <I.CheckCircle size={20} />, title: 'Salida segura y auditada', desc: 'Cada movimiento queda registrado en un historial completo.' },
];

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
    <div className="min-h-screen lg:flex bg-cream-50">

      {/* ── Left — brand panel (desktop only) ── */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-100 via-peach-50 to-cream-200" />
        <div className="absolute pointer-events-none" style={{
          width: 560, height: 560, top: '-12%', left: '-10%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,183,133,0.55) 0%, transparent 70%)', filter: 'blur(40px)',
        }} />
        <div className="absolute pointer-events-none" style={{
          width: 480, height: 480, bottom: '-14%', right: '-8%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(178,214,164,0.5) 0%, transparent 70%)', filter: 'blur(44px)',
        }} />

        <div className="relative">
          <Logo variant="lockup" size={42} tagline />
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl xl:text-[2.9rem] font-extrabold text-ink-900 leading-[1.12] tracking-tight">
            Retiros escolares,{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #E96416, #FF7A2E)' }}>
              simples y seguros.
            </span>
          </h1>
          <p className="text-[15px] text-ink-600 mt-4 leading-relaxed">
            Todo el flujo de autorización en un solo lugar, conectando a las familias con el colegio.
          </p>

          <div className="mt-9 space-y-4">
            {VALUE_PROPS.map(v => (
              <div key={v.title} className="flex items-start gap-3.5">
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-white/80 border border-peach-200/60 text-peach-600 flex items-center justify-center shadow-soft">
                  {v.icon}
                </div>
                <div>
                  <div className="font-bold text-ink-900">{v.title}</div>
                  <div className="text-sm text-ink-500 leading-snug mt-0.5">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-400">
          © {new Date().getFullYear()} NexoEscolar · Todos los derechos reservados
        </p>
      </aside>

      {/* ── Right — form panel ── */}
      <main className="flex-1 min-h-screen relative overflow-hidden flex flex-col items-center justify-start lg:justify-center px-4 py-10 sm:px-6">
        {/* Soft background accents (visible mainly on mobile) */}
        <div className="absolute pointer-events-none lg:hidden" style={{
          width: '70vw', height: '70vw', maxWidth: 520, maxHeight: 520,
          top: '-16%', right: '-18%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,183,133,0.45) 0%, transparent 70%)', filter: 'blur(40px)',
        }} />
        <div className="absolute pointer-events-none lg:hidden" style={{
          width: '60vw', height: '60vw', maxWidth: 440, maxHeight: 440,
          bottom: '-14%', left: '-16%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(178,214,164,0.4) 0%, transparent 70%)', filter: 'blur(40px)',
        }} />

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-7">
            <Logo variant="lockup" size={34} />
          </div>

          {/* Heading */}
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-[1.7rem] font-extrabold text-ink-900 tracking-tight">
              Iniciá sesión
            </h2>
            <p className="text-sm text-ink-500 mt-1.5">
              Ingresá a tu cuenta de familia o del colegio.
            </p>
          </div>

          {/* Card */}
          <div
            className="w-full relative bg-white border border-warm-line rounded-3xl px-6 py-7 sm:px-8 sm:py-8"
            style={{ boxShadow: '0 12px 44px -12px rgba(201,138,80,0.22), 0 2px 10px -4px rgba(201,138,80,0.12)' }}
          >
            {/* Access type selector */}
            <div className="flex rounded-2xl bg-cream-100 border border-peach-100 p-1 gap-1">
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
                    className="group text-left rounded-xl border border-warm-line bg-white hover:border-peach-200 hover:bg-peach-50/50 transition p-2.5"
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

          {/* Footer note — mobile only (desktop has it in the brand panel) */}
          <p className="lg:hidden mt-6 text-[11px] text-ink-300 text-center">
            © {new Date().getFullYear()} NexoEscolar · Todos los derechos reservados
          </p>
        </div>
      </main>
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
