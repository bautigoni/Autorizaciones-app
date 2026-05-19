import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import type { AppNotification } from '@shared/types';
import { I } from './Icons';
import { relative } from '../utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  auth_approved:  { icon: <I.CheckCircle size={16} />, color: 'text-sage-600',  bg: 'bg-sage-100'    },
  auth_rejected:  { icon: <I.Close size={16} />,       color: 'text-coral-600', bg: 'bg-coral-50'    },
  auth_observed:  { icon: <I.AlertTriangle size={16}/>, color: 'text-amber-600', bg: 'bg-amber-50'   },
  auth_completed: { icon: <I.Shield size={16} />,      color: 'text-ink-500',   bg: 'bg-cream-100'   },
  auth_pending:   { icon: <I.Clock size={16} />,       color: 'text-peach-600', bg: 'bg-peach-50'    },
  auth_cancelled: { icon: <I.Close size={16} />,       color: 'text-ink-400',   bg: 'bg-cream-100'   },
  info:           { icon: <I.Bell size={16} />,        color: 'text-peach-600', bg: 'bg-peach-50'    },
};

export function NotificationDrawer({ open, onClose, onCountChange }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const basePath = user?.role === 'family' ? '/familia' : '/cole';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setNotifs(data);
      onCountChange?.(data.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  async function handleMarkAllRead() {
    await api.markAllNotificationsRead();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    onCountChange?.(0);
  }

  async function handleClick(n: AppNotification) {
    if (!n.read) {
      await api.markNotificationRead(n.id);
      setNotifs(prev => {
        const updated = prev.map(x => x.id === n.id ? { ...x, read: true } : x);
        onCountChange?.(updated.filter(x => !x.read).length);
        return updated;
      });
    }
    onClose();
    if (n.authorization_id) {
      navigate(`${basePath}/autorizaciones/${n.authorization_id}`);
    }
  }

  if (!open) return null;

  const unread = notifs.filter(n => !n.read).length;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gradient-to-br from-white to-cream-50 shadow-2xl border-l border-warm-line flex flex-col animate-[slideInR_.2s_ease]">

        {/* Header */}
        <div className="px-5 py-4 border-b border-warm-line flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-ink-900">Notificaciones</h3>
            {unread > 0 && (
              <p className="text-xs text-ink-500 mt-0.5">{unread} sin leer</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-peach-600 hover:text-peach-700 px-2.5 py-1.5 rounded-xl hover:bg-peach-50 transition"
              >
                Marcar leídas
              </button>
            )}
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500"
              aria-label="Cerrar"
            >
              <I.Close size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16 text-ink-400">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {!loading && notifs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-peach-50 border border-peach-200/60 flex items-center justify-center text-peach-400 mb-4">
                <I.Bell size={24} />
              </div>
              <p className="font-semibold text-ink-800">Sin notificaciones</p>
              <p className="text-sm text-ink-400 mt-1 max-w-xs">
                Cuando haya novedades sobre tus autorizaciones, aparecerán aquí.
              </p>
            </div>
          )}

          {!loading && notifs.length > 0 && (
            <div className="divide-y divide-warm-line/60">
              {notifs.map(n => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={[
                      'w-full text-left flex gap-3.5 px-5 py-4 transition hover:bg-cream-50 active:bg-cream-100',
                      !n.read ? 'bg-peach-50/30' : '',
                    ].join(' ')}
                  >
                    <div className={`h-9 w-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      {cfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm leading-snug ${!n.read ? 'font-bold text-ink-900' : 'font-semibold text-ink-700'}`}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div className="text-xs text-ink-500 mt-0.5 leading-relaxed line-clamp-2">
                          {n.body}
                        </div>
                      )}
                      <div className="text-[11px] text-ink-400 mt-1.5">{relative(n.created_at)}</div>
                    </div>
                    {!n.read && (
                      <div className="h-2 w-2 rounded-full bg-peach-500 mt-2 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideInR {
          from { transform: translateX(24px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
