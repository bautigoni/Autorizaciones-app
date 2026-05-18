import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../services/auth';
import { I } from '../components/Icons';

export function FamilyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-warm-line">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/familia')}>
            <Logo variant="lockup" size={36} />
          </button>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500 relative" aria-label="Notificaciones" onClick={() => navigate('/familia/autorizaciones')}>
              <I.Bell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-coral-500" />
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-2 h-10 rounded-full hover:bg-cream-100" aria-label="Cerrar sesión">
              <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={32} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-32 pt-4">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-lg border-t border-warm-line">
        <div className="max-w-2xl mx-auto grid grid-cols-3 relative">
          {[
            { to: '/familia', label: 'Inicio', icon: <I.Home size={20} />, end: true },
            { to: '/familia/autorizaciones', label: 'Solicitudes', icon: <I.List size={20} /> },
            { to: '#logout', label: 'Salir', icon: <I.Logout size={20} />, action: logout },
          ].map(item => {
            if (item.action) {
              return (
                <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-1 py-3 text-ink-400 hover:text-peach-600">
                  {item.icon}<span className="text-[11px] font-semibold">{item.label}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-3 transition ${isActive ? 'text-peach-700' : 'text-ink-400 hover:text-peach-600'}`
                }
              >
                {item.icon}<span className="text-[11px] font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
          {/* Floating action button */}
          <button
            onClick={() => navigate('/familia/autorizaciones/nueva')}
            aria-label="Nueva autorización"
            className="absolute -top-7 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-gradient-to-br from-peach-400 to-peach-600 text-white shadow-glow flex items-center justify-center hover:brightness-110 active:scale-95 transition"
          >
            <I.Plus size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}
