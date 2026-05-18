import React from 'react';

export function EmptyState({
  icon, title, description, action,
}: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-soft border border-peach-200/50 flex items-center justify-center text-peach-500">
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      {description && <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 gap-3 text-ink-500">
      <svg className="animate-spin text-peach-500" width="22" height="22" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-6 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-coral-100 text-coral-600 flex items-center justify-center mb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 10v5M12 18v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="font-semibold text-ink-900">Algo salió mal</div>
      <div className="text-sm text-ink-500 mt-1">{message}</div>
      {onRetry && <button className="mt-3 text-sm font-semibold text-peach-700 hover:underline" onClick={onRetry}>Reintentar</button>}
    </div>
  );
}
