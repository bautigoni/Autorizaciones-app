import React from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../services/auth';
import { UserMenu } from '../components/UserMenu';
import { roleLabel } from './InternalLayout';

export function GateLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-ink-900 to-ink-700 text-white shadow-soft">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="mark" size={36} />
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight">Portería · NexoEscolar</div>
              <div className="text-[11px] text-white/60 font-medium">Validación de retiros</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="h-2 w-2 rounded-full bg-sage-300 animate-pulse" />
              <span className="text-xs font-semibold">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
            </div>
            <UserMenu
              name={user?.full_name ?? ''}
              role={roleLabel(user?.role ?? '')}
              avatarColor={user?.avatar_color ?? undefined}
              onLogout={logout}
              variant="dark"
            />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
