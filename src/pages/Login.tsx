import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { useAuth } from '../services/auth';
import { useToast } from '../components/Toast';
import { I } from '../components/Icons';

const DEMO_ACCOUNTS = [
  { role: 'Familia',     email: 'maria@familia.edu',    tone: 'from-peach-300 to-peach-500' },
  { role: 'Preceptor',   email: 'preceptor@cole.edu',   tone: 'from-sage-300 to-sage-500' },
  { role: 'Secretaría',  email: 'secretaria@cole.edu',  tone: 'from-coral-300 to-coral-500' },
  { role: 'Portería',    email: 'porteria@cole.edu',    tone: 'from-ink-300 to-ink-500' },
  { role: 'Dirección',   email: 'direccion@cole.edu',   tone: 'from-peach-400 to-coral-500' },
];

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');

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
    setEmail(addr); setPassword('demo');
    setTimeout(() => login(addr, 'demo').then(u => {
      toast.push({ tone: 'success', title: `Sesión iniciada · ${u.full_name}` });
      navigate('/', { replace: true });
    }).catch(e => setErr(e.message)), 50);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero */}
      <div className="lg:flex-1 hero-gradient relative overflow-hidden p-8 lg:p-12 flex flex-col">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-coral-300/30 blur-3xl" />
        <div className="relative">
          <Logo variant="lockup" size={48} className="text-white [&_div]:!text-white" />
        </div>
        <div className="relative mt-auto max-w-md">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight">
            Retiros escolares, <span className="text-cream-100">simples y seguros.</span>
          </h1>
          <p className="text-white/90 mt-4 text-base lg:text-lg leading-relaxed">
            Familias, secretaría y portería trabajando con la misma información, sin papeles ni mensajes sueltos.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-white/95">
            {[
              { n: '+98%', t: 'de retiros validados sin fricción' },
              { n: '3 seg', t: 'para confirmar en portería' },
              { n: '0', t: 'autorizaciones perdidas' },
            ].map(s => (
              <div key={s.n} className="rounded-2xl bg-white/15 backdrop-blur-sm p-3 border border-white/20">
                <div className="text-xl font-extrabold">{s.n}</div>
                <div className="text-xs mt-1 leading-tight">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="lg:flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex justify-center"><Logo variant="lockup" size={44} /></div>
          <div className="card p-7 lg:p-9">
            <h2 className="text-2xl font-extrabold text-ink-900">Iniciar sesión</h2>
            <p className="text-sm text-ink-500 mt-1">Accedé con tu correo registrado en el colegio.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Input
                label="Correo electrónico"
                type="email"
                required
                placeholder="tu@familia.edu"
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
                  <button type="button" onClick={() => setShowPw(p => !p)} className="text-ink-400 hover:text-peach-500" aria-label="Mostrar contraseña">
                    {showPw ? <I.EyeOff size={18} /> : <I.Eye size={18} />}
                  </button>
                }
                error={err || undefined}
              />
              <div className="flex items-center justify-between">
                <Checkbox checked={remember} onChange={setRemember} label="Recordarme" size="sm" />
                <button type="button" className="text-sm font-semibold text-peach-700 hover:underline">¿Olvidaste?</button>
              </div>
              <Button type="submit" full size="lg" loading={loading}>
                Entrar
                <I.ArrowRight size={18} />
              </Button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-warm-line" />
              <span className="text-xs text-ink-400 font-medium">o probá una cuenta demo</span>
              <div className="flex-1 h-px bg-warm-line" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.email}
                  onClick={() => quickLogin(a.email)}
                  type="button"
                  className="group text-left rounded-2xl border border-warm-line bg-white hover:border-peach-300 transition p-2.5"
                >
                  <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${a.tone} mb-2`} />
                  <div className="text-xs font-bold text-ink-900">{a.role}</div>
                  <div className="text-[10px] text-ink-400 truncate">{a.email}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-4 text-center">Contraseña demo para todas las cuentas: <code className="bg-cream-100 px-1.5 py-0.5 rounded font-mono text-peach-700">demo</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
