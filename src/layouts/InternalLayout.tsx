import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../services/auth';
import { I } from '../components/Icons';
import { UserMenu } from '../components/UserMenu';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { api } from '../services/api';

const NAV = [
  { to: '/cole', label: 'Dashboard', icon: I.Home, end: true },
  { to: '/cole/autorizaciones', label: 'Autorizaciones', icon: I.List },
];

export function InternalLayout() {
  const { user, logout } = useAuth();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await api.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white/80 border-r border-warm-line backdrop-blur-sm">
        <div className="p-5 border-b border-warm-line">
          <Logo variant="lockup" size={38} />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 h-11 rounded-2xl text-sm font-semibold transition',
                    isActive
                      ? 'bg-gradient-to-r from-peach-100 to-peach-50 text-peach-700 shadow-sm border border-peach-200/60'
                      : 'text-ink-700 hover:bg-cream-100',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}

          {/* Notification button in sidebar */}
          <button
            onClick={() => setNotifsOpen(true)}
            className="w-full flex items-center gap-3 px-3 h-11 rounded-2xl text-sm font-semibold text-ink-700 hover:bg-cream-100 transition"
          >
            <div className="relative">
              <I.Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-coral-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-auto bg-coral-100 text-coral-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>
        <div className="p-3 border-t border-warm-line">
          <UserMenu
            name={user?.full_name ?? ''}
            role={roleLabel(user?.role ?? '')}
            avatarColor={user?.avatar_color ?? undefined}
            onLogout={logout}
            variant="row"
            dropUp
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-warm-line">
          <div className="px-4 h-16 flex items-center justify-between gap-3">
            <Logo variant="lockup" size={34} />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setNotifsOpen(true)}
                className="h-10 w-10 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500 relative"
                aria-label="Notificaciones"
              >
                <I.Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 rounded-full bg-coral-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <UserMenu
                name={user?.full_name ?? ''}
                role={roleLabel(user?.role ?? '')}
                avatarColor={user?.avatar_color ?? undefined}
                onLogout={logout}
              />
            </div>
          </div>
          <nav className="px-2 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition',
                      isActive ? 'bg-peach-100 text-peach-700' : 'text-ink-500 hover:bg-cream-100',
                    ].join(' ')
                  }
                >
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <NotificationDrawer
        open={notifsOpen}
        onClose={() => setNotifsOpen(false)}
        onCountChange={setUnreadCount}
      />
    </div>
  );
}

export function roleLabel(r: string) {
  return ({
    family: 'Familia', preceptor: 'Preceptor/a', secretary: 'Secretaría',
  } as Record<string, string>)[r] ?? r;
}
