import React from 'react';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Checkbox({ checked, onChange, label, hint, disabled, size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  return (
    <label className={`inline-flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          dim, 'shrink-0 rounded-lg border-2 transition flex items-center justify-center',
          checked
            ? 'bg-gradient-to-br from-peach-400 to-peach-600 border-peach-500 shadow-sm'
            : 'border-warm-line bg-white hover:border-peach-300',
        ].join(' ')}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" className="text-white">
            <path d="M2.5 7.2L5.5 10.2L11.5 3.8" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {label && (
        <div className="leading-tight pt-0.5">
          <div className="text-sm text-ink-900">{label}</div>
          {hint && <div className="text-xs text-ink-400 mt-0.5">{hint}</div>}
        </div>
      )}
    </label>
  );
}

export function Radio({ checked, onChange, label, hint, disabled }: Props) {
  return (
    <label className={`inline-flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'h-6 w-6 shrink-0 rounded-full border-2 transition flex items-center justify-center',
          checked ? 'border-peach-500 bg-white' : 'border-warm-line bg-white hover:border-peach-300',
        ].join(' ')}
      >
        {checked && <span className="block h-3 w-3 rounded-full bg-gradient-to-br from-peach-400 to-peach-600" />}
      </button>
      {label && (
        <div className="leading-tight pt-0.5">
          <div className="text-sm text-ink-900">{label}</div>
          {hint && <div className="text-xs text-ink-400 mt-0.5">{hint}</div>}
        </div>
      )}
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled }: Props) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-7 w-12 rounded-full transition-colors',
          checked ? 'bg-gradient-to-r from-peach-400 to-peach-600' : 'bg-ink-300/40',
        ].join(' ')}
      >
        <span className={[
          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        ].join(' ')} />
      </button>
      {label && <span className="text-sm text-ink-900">{label}</span>}
    </label>
  );
}
