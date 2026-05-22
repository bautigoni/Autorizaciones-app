import React from 'react';
import { LoadingState, EmptyState } from '../../../../components/States';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title, subtitle, icon, action, loading, empty,
  emptyTitle = 'Sin datos', emptyDescription = 'No hay actividad para el período seleccionado.',
  className = '', children,
}: Props) {
  return (
    <div className={`card p-5 sm:p-6 flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="h-9 w-9 rounded-xl bg-gradient-soft border border-peach-200/60 text-peach-600 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-ink-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <LoadingState />
        ) : empty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
