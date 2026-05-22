import React from 'react';

type Tone = 'peach' | 'sage' | 'amber' | 'ink';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  loading?: boolean;
}

const TONES: Record<Tone, string> = {
  peach: 'bg-peach-100 text-peach-700',
  sage: 'bg-sage-100 text-sage-600',
  amber: 'bg-amber-50 text-amber-600',
  ink: 'bg-cream-200 text-ink-600',
};

export function MetricCard({ icon, label, value, hint, tone = 'peach', loading }: Props) {
  return (
    <div className="card p-5">
      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${TONES[tone]}`}>
        {icon}
      </div>
      {loading ? (
        <div className="mt-3.5 h-8 w-20 rounded-lg bg-cream-200 animate-pulse" />
      ) : (
        <div className="text-2xl lg:text-3xl font-extrabold text-ink-900 mt-3 leading-none">{value}</div>
      )}
      <div className="text-sm font-semibold text-ink-500 mt-1.5">{label}</div>
      {hint && !loading && <div className="text-xs text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}
