import React, { useEffect, useRef, useState } from 'react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface Props<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  label?: string;
  placeholder?: string;
  full?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Select<T extends string | number>({
  value, options, onChange, label, placeholder, full, size = 'md', className = '',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = options.find(o => o.value === value);
  const h = size === 'sm' ? 'h-9 text-sm' : 'h-12 text-[15px]';

  return (
    <div ref={ref} className={`relative ${full ? 'w-full' : ''} ${className}`}>
      {label && <div className="mb-1.5 text-sm font-semibold text-ink-700">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center justify-between gap-2 rounded-2xl bg-white border transition w-full',
          'border-warm-line hover:border-peach-300 px-3.5',
          open ? 'shadow-ring border-peach-400' : '',
          h,
        ].join(' ')}
      >
        <span className={`flex items-center gap-2 truncate ${current ? 'text-ink-900' : 'text-ink-300'}`}>
          {current?.icon}
          {current?.label ?? placeholder ?? 'Seleccionar...'}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" className={`text-ink-400 transition ${open ? 'rotate-180' : ''}`}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white rounded-2xl border border-warm-line shadow-soft overflow-hidden">
          <div className="max-h-72 overflow-y-auto scrollbar-thin py-1">
            {options.map(o => {
              const active = o.value === value;
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={[
                    'w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition',
                    active ? 'bg-peach-50 text-peach-700' : 'hover:bg-cream-100 text-ink-900',
                  ].join(' ')}
                >
                  {o.icon}
                  <span className="flex-1">
                    <span className="block font-medium text-[14px]">{o.label}</span>
                    {o.hint && <span className="block text-xs text-ink-400">{o.hint}</span>}
                  </span>
                  {active && (
                    <svg width="16" height="16" viewBox="0 0 16 16" className="text-peach-500">
                      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
