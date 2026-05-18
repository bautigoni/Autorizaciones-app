import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-gradient-to-br from-peach-400 to-peach-600 text-white shadow-glow hover:brightness-105 active:brightness-95',
  secondary: 'bg-white border border-warm-line text-ink-900 hover:bg-cream-100 hover:border-peach-300',
  soft:      'bg-peach-100 text-peach-700 hover:bg-peach-200 border border-peach-200/60',
  ghost:     'bg-transparent text-ink-700 hover:bg-cream-100',
  success:   'bg-gradient-to-br from-sage-300 to-sage-600 text-white shadow-soft hover:brightness-105',
  danger:    'bg-gradient-to-br from-coral-300 to-coral-600 text-white shadow-soft hover:brightness-105',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-4 text-sm rounded-2xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
};

export function Button({
  variant = 'primary', size = 'md', full, icon, loading, className = '',
  disabled, children, ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        variants[variant], sizes[size], full ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
          <path d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
