import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../services/auth';
import { I } from '../components/Icons';
import { roleLabel } from './InternalLayout';

export function GateLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-ink-900 to-ink-700 text-white shadow-soft">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="mark" size={36} />
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight">Portería · Salida Segura</div>
              <div className="text-[11px] text-white/60 font-medium">Validación de retiros</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="h-2 w-2 rounded-full bg-sage-300 animate-pulse" />
              <span className="text-xs font-semibold">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-2 pl-2 pr-3 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold">
              <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={28} />
              <span className="hidden sm:inline">{roleLabel(user?.role ?? '')}</span>
              <I.Logout size={16} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
