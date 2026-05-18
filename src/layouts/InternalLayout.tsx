import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../services/auth';
import { I } from '../components/Icons';

const NAV = [
  { to: '/cole', label: 'Dashboard', icon: I.Home, end: true },
  { to: '/cole/autorizaciones', label: 'Autorizaciones', icon: I.List },
];

export function InternalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        </nav>
        <div className="p-3 border-t border-warm-line">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 h-11 rounded-2xl text-sm font-semibold text-ink-700 hover:bg-cream-100">
            <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={28} />
            <div className="flex-1 text-left leading-tight">
              <div className="text-sm">{user?.full_name}</div>
              <div className="text-[11px] text-ink-400 font-normal">{roleLabel(user?.role ?? '')}</div>
            </div>
            <I.Logout size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-warm-line">
          <div className="px-4 h-16 flex items-center justify-between">
            <Logo variant="lockup" size={34} />
            <button onClick={logout} className="h-10 w-10 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500" aria-label="Cerrar sesión">
              <Avatar name={user?.full_name ?? ''} color={user?.avatar_color ?? undefined} size={32} />
            </button>
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
    </div>
  );
}

export function roleLabel(r: string) {
  return ({
    family: 'Familia', preceptor: 'Preceptor/a', secretary: 'Secretaría',
    gate: 'Portería', admin: 'Dirección',
  } as Record<string, string>)[r] ?? r;
}
