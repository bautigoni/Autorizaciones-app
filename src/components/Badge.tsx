import React from 'react';
import type { AuthStatus } from '@shared/types';

const STATUS_MAP: Record<AuthStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: 'Pendiente',  bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  approved:  { label: 'Aprobada',   bg: 'bg-sage-100',  text: 'text-sage-600',   dot: 'bg-sage-500' },
  observed:  { label: 'Observada',  bg: 'bg-peach-100', text: 'text-peach-700',  dot: 'bg-peach-500' },
  rejected:  { label: 'Rechazada',  bg: 'bg-coral-100', text: 'text-coral-600',  dot: 'bg-coral-500' },
  completed: { label: 'Retirado',   bg: 'bg-sage-100',  text: 'text-sage-600',   dot: 'bg-sage-600' },
  expired:   { label: 'Vencida',    bg: 'bg-ink-300/20', text: 'text-ink-500',   dot: 'bg-ink-400' },
  cancelled: { label: 'Cancelada',  bg: 'bg-ink-300/20', text: 'text-ink-500',   dot: 'bg-ink-400' },
};

interface Props { status: AuthStatus; size?: 'sm' | 'md'; }

export function StatusBadge({ status, size = 'md' }: Props) {
  const s = STATUS_MAP[status];
  const sz = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={['inline-flex items-center gap-1.5 rounded-full font-semibold', s.bg, s.text, sz].join(' ')}>
      <span className={['h-1.5 w-1.5 rounded-full', s.dot].join(' ')} />
      {s.label}
    </span>
  );
}

export function statusLabel(s: AuthStatus) { return STATUS_MAP[s].label; }

export function Pill({
  children, tone = 'neutral', className = '',
}: { children: React.ReactNode; tone?: 'neutral' | 'peach' | 'sage' | 'coral'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-cream-100 text-ink-700 border border-warm-line',
    peach: 'bg-peach-100 text-peach-700 border border-peach-200',
    sage: 'bg-sage-100 text-sage-600 border border-sage-100',
    coral: 'bg-coral-100 text-coral-600 border border-coral-100',
  };
  return (
    <span className={['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', tones[tone], className].join(' ')}>
      {children}
    </span>
  );
}
