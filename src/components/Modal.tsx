import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  const w = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fadeIn_.18s_ease]">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={[
        'relative w-full bg-gradient-to-br from-white via-cream-50 to-cream-100',
        'rounded-t-4xl sm:rounded-3xl shadow-2xl border border-warm-line',
        'overflow-hidden flex flex-col max-h-[92vh]',
        w,
      ].join(' ')}>
        {title && (
          <div className="px-6 pt-6 pb-3">
            <h3 className="text-xl font-bold text-ink-900">{title}</h3>
            {description && <p className="text-sm text-ink-500 mt-1">{description}</p>}
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="px-6 py-4 bg-cream-50 border-t border-warm-line flex justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>,
    document.body
  );
}

export function Drawer({
  open, onClose, title, children, footer,
}: Omit<Props, 'size'>) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-br from-white to-cream-50 shadow-2xl border-l border-warm-line flex flex-col animate-[slideIn_.2s_ease]">
        {title && (
          <div className="px-6 py-4 border-b border-warm-line flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink-900">{title}</h3>
            <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 bg-cream-50 border-t border-warm-line flex justify-end gap-2">{footer}</div>}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>,
    document.body
  );
}
