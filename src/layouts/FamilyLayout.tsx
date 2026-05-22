import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../services/auth';
import { I } from '../components/Icons';
import { api } from '../services/api';
import { NotificationDrawer } from '../components/NotificationDrawer';

export function FamilyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await api.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  const navItems = [
    { to: '/familia', label: 'Inicio', icon: I.Home, end: true },
    { to: '/familia/autorizaciones', label: 'Mis solicitudes', icon: I.List },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-warm-line">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-16 lg:h-[72px] flex items-center justify-between gap-6">
          <button onClick={() => navigate('/familia')} className="shrink-0" aria-label="Ir al inicio">
            <span className="sm:hidden"><Logo variant="lockup" size={26} /></span>
            <span className="hidden sm:inline-flex lg:hidden"><Logo variant="lockup" size={31} /></span>
            <span className="hidden lg:inline-flex"><Logo variant="lockup" size={37} /></span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-peach-50 text-peach-700 border border-peach-200/60'
                        : 'text-ink-500 hover:text-ink-800 hover:bg-cream-100'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Desktop CTA */}
            <button
              onClick={() => navigate('/familia/autorizaciones/nueva')}
              className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-br from-peach-400 to-peach-600 text-white text-sm font-semibold shadow-soft hover:brightness-110 active:scale-95 transition"
            >
              <I.Plus size={16} />
              Nueva autorización
            </button>

            {/* Notifications bell */}
            <button
              className="h-10 w-10 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500 relative transition"
              aria-label="Notificaciones"
              onClick={() => setNotifsOpen(true)}
            >
              <I.Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-coral-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar — desktop only */}
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 px-2 h-10 rounded-full hover:bg-cream-100 transition"
              aria-label="Cerrar sesión"
            >
              <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={32} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content — extra bottom padding on mobile for FAB + nav */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-36 md:pb-12">
        <Outlet />
      </main>

      {/* ── Mobile FAB — sits above the bottom nav bar ── */}
      <div
        className="md:hidden fixed z-40 left-1/2 -translate-x-1/2"
        style={{ bottom: '84px' }}
      >
        <button
          onClick={() => navigate('/familia/autorizaciones/nueva')}
          aria-label="Nueva autorización"
          className="flex items-center gap-2 h-12 px-5 rounded-full bg-gradient-to-br from-peach-400 to-peach-600 text-white text-sm font-bold shadow-glow hover:brightness-110 active:scale-95 transition-all"
          style={{ boxShadow: '0 4px 20px -2px rgba(242,106,75,0.5)' }}
        >
          <I.Plus size={18} strokeWidth={2.5} />
          Nueva autorización
        </button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-lg border-t border-warm-line"
        style={{ boxShadow: '0 -4px 28px -4px rgba(0,0,0,0.10)' }}
      >
        <div className="max-w-md mx-auto grid grid-cols-3 h-[72px]">

          {/* Inicio */}
          <NavLink to="/familia" end className="flex flex-col items-center justify-center gap-1 h-full">
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-peach-50' : ''}`}>
                  <I.Home size={22} className={isActive ? 'text-peach-600' : 'text-ink-400'} />
                </div>
                <span className={`text-[11px] font-semibold leading-none ${isActive ? 'text-peach-600' : 'text-ink-400'}`}>
                  Inicio
                </span>
              </>
            )}
          </NavLink>

          {/* Solicitudes */}
          <NavLink to="/familia/autorizaciones" className="flex flex-col items-center justify-center gap-1 h-full">
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-peach-50' : ''}`}>
                  <I.List size={22} className={isActive ? 'text-peach-600' : 'text-ink-400'} />
                </div>
                <span className={`text-[11px] font-semibold leading-none ${isActive ? 'text-peach-600' : 'text-ink-400'}`}>
                  Solicitudes
                </span>
              </>
            )}
          </NavLink>

          {/* Perfil */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center justify-center gap-1 h-full text-ink-400 hover:text-ink-600 transition-colors"
          >
            <div className="rounded-full ring-2 ring-transparent">
              <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={26} />
            </div>
            <span className="text-[11px] font-semibold leading-none">Perfil</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile profile sheet ── */}
      {profileOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setProfileOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-warm-line" />
            </div>
            <div className="px-6 pt-4 pb-10">
              {/* User info */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={52} />
                <div>
                  <div className="font-bold text-ink-900 text-base leading-tight">{user?.full_name}</div>
                  <div className="text-sm text-ink-500 mt-0.5">Familia</div>
                  {user?.phone && (
                    <div className="text-xs text-ink-400 mt-1 flex items-center gap-1.5">
                      <I.Phone size={12} />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => { setProfileOpen(false); setNotifsOpen(true); }}
                  className="w-full flex items-center gap-3 h-12 px-4 rounded-2xl border border-warm-line bg-white text-ink-700 hover:bg-cream-50 transition font-semibold text-sm"
                >
                  <div className="relative shrink-0">
                    <I.Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-coral-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-coral-100 text-coral-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 h-12 px-4 rounded-2xl border border-warm-line bg-white text-coral-600 hover:bg-coral-50 transition font-semibold text-sm"
                >
                  <I.Logout size={18} className="shrink-0" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications drawer */}
      <NotificationDrawer
        open={notifsOpen}
        onClose={() => setNotifsOpen(false)}
        onCountChange={setUnreadCount}
      />
    </div>
  );
}
