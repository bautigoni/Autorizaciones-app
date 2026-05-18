import React, { createContext, useCallback, useContext, useState } from 'react';

type Tone = 'success' | 'error' | 'info';
interface Toast { id: number; title: string; description?: string; tone: Tone; }

const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

let counter = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = counter++;
    setItems(s => [...s, { ...t, id }]);
    setTimeout(() => setItems(s => s.filter(x => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed z-[60] top-4 right-4 flex flex-col gap-2 pointer-events-none">
        {items.map(t => {
          const tones: Record<Tone, string> = {
            success: 'from-sage-300 to-sage-600',
            error:   'from-coral-300 to-coral-600',
            info:    'from-peach-300 to-peach-500',
          };
          return (
            <div key={t.id} className="pointer-events-auto w-80 rounded-2xl bg-white border border-warm-line shadow-soft overflow-hidden animate-[slideIn_.2s_ease]">
              <div className={`h-1 bg-gradient-to-r ${tones[t.tone]}`} />
              <div className="px-4 py-3">
                <div className="font-semibold text-ink-900 text-sm">{t.title}</div>
                {t.description && <div className="text-xs text-ink-500 mt-0.5">{t.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast outside provider');
  return c;
}
