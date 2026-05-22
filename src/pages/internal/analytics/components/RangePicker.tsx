import React from 'react';
import type { AnalyticsRange } from '@shared/types';

export type RangeKey = '7d' | '30d' | '90d' | 'all';

const OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'all', label: 'Todo' },
];

/** Converts a preset key into an absolute {from,to} date range. */
export function rangeToDates(key: RangeKey): AnalyticsRange {
  if (key === 'all') return {};
  const days = key === '7d' ? 7 : key === '30d' ? 30 : 90;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days + 1);
  return { from: iso(from), to: iso(to) };
}

interface Props {
  value: RangeKey;
  onChange: (key: RangeKey) => void;
}

export function RangePicker({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Rango de fechas"
      className="inline-flex bg-cream-100 border border-warm-line rounded-2xl p-1 gap-1"
    >
      {OPTIONS.map(o => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={[
              'h-9 px-3.5 rounded-xl text-sm font-semibold transition',
              active ? 'bg-white shadow-sm text-peach-700' : 'text-ink-500 hover:text-ink-800',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
