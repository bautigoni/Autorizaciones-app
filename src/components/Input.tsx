import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, suffix, className = '', ...rest }, ref
) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-sm font-semibold text-ink-700">{label}</div>}
      <div className={[
        'flex items-center gap-2 rounded-2xl border bg-white transition',
        'h-12 px-3.5 focus-within:shadow-ring',
        error ? 'border-coral-500' : 'border-warm-line focus-within:border-peach-400',
      ].join(' ')}>
        {icon && <span className="text-ink-400 shrink-0">{icon}</span>}
        <input
          ref={ref}
          className={[
            'flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-300',
            'text-[15px]', className,
          ].join(' ')}
          {...rest}
        />
        {suffix}
      </div>
      {(error || hint) && (
        <div className={`mt-1.5 text-xs ${error ? 'text-coral-600' : 'text-ink-400'}`}>
          {error ?? hint}
        </div>
      )}
    </label>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; hint?: string; error?: string;
}
export function Textarea({ label, hint, error, className = '', ...rest }: TextareaProps) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-sm font-semibold text-ink-700">{label}</div>}
      <textarea
        className={[
          'w-full rounded-2xl border bg-white px-3.5 py-3 outline-none transition text-[15px]',
          'focus:shadow-ring resize-none',
          error ? 'border-coral-500' : 'border-warm-line focus:border-peach-400',
          className,
        ].join(' ')}
        rows={3}
        {...rest}
      />
      {(error || hint) && (
        <div className={`mt-1.5 text-xs ${error ? 'text-coral-600' : 'text-ink-400'}`}>{error ?? hint}</div>
      )}
    </label>
  );
}
