import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from './Avatar';
import { I } from './Icons';

interface UserMenuProps {
  name: string;
  role: string;
  avatarColor?: string;
  onLogout: () => void;
  /** 'icon' = avatar+chevron (header); 'row' = full sidebar row; 'dark' = header on dark bg */
  variant?: 'icon' | 'row' | 'dark';
  /** Open the dropdown upward (for elements near the bottom of the screen) */
  dropUp?: boolean;
}

export function UserMenu({
  name,
  role,
  avatarColor,
  onLogout,
  variant = 'icon',
  dropUp = false,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const triggerClass =
    variant === 'row'
      ? 'w-full flex items-center gap-3 px-3 h-11 rounded-2xl text-sm font-semibold text-ink-700 hover:bg-cream-100 transition'
      : variant === 'dark'
      ? 'flex items-center gap-2 pl-2 pr-3 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold transition'
      : 'flex items-center gap-1.5 px-2 h-10 rounded-full hover:bg-cream-100 transition';

  const dropdownPos = dropUp
    ? 'bottom-full mb-2 left-0'
    : 'top-full mt-2 right-0';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Menú de usuario"
        className={triggerClass}
      >
        <Avatar name={name} color={avatarColor} size={variant === 'row' ? 28 : 32} />

        {variant === 'row' && (
          <>
            <div className="flex-1 text-left leading-tight min-w-0">
              <div className="text-sm truncate">{name}</div>
              <div className="text-[11px] text-ink-400 font-normal">{role}</div>
            </div>
            <Chevron open={open} className="text-ink-400 shrink-0" />
          </>
        )}

        {variant === 'dark' && (
          <>
            <span className="hidden sm:inline text-white">{role}</span>
            <Chevron open={open} className="text-white/60" />
          </>
        )}

        {variant === 'icon' && (
          <Chevron open={open} className="text-ink-400" />
        )}
      </button>

      {open && (
        <div
          className={`absolute ${dropdownPos} w-56 bg-white rounded-2xl border border-warm-line z-50 overflow-hidden`}
          style={{ boxShadow: '0 8px 32px -8px rgba(201,138,80,0.22), 0 2px 8px -2px rgba(0,0,0,0.08)' }}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-warm-line" style={{ background: 'linear-gradient(135deg, #FFF4EC 0%, #FDF6EB 100%)' }}>
            <div className="flex items-center gap-3">
              <Avatar name={name} color={avatarColor} size={36} />
              <div className="min-w-0">
                <div className="font-bold text-sm text-ink-900 truncate">{name}</div>
                <div className="text-[11px] text-ink-400 font-medium mt-0.5">{role}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-1.5">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm text-ink-700 hover:bg-cream-100 transition text-left"
            >
              <I.User size={16} className="text-ink-400 shrink-0" />
              Mi perfil
            </button>

            <div className="h-px bg-warm-line mx-2 my-1" />

            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-semibold text-coral-600 hover:bg-coral-100/50 transition text-left"
            >
              <I.Logout size={16} className="shrink-0" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chevron({ open, className }: { open: boolean; className: string }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`${className} transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
