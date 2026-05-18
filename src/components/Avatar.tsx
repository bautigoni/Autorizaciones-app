import React from 'react';

interface Props { name: string; color?: string | null; size?: number; className?: string; }

export function Avatar({ name, color, size = 36, className = '' }: Props) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const bg = color ?? '#FFB785';
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shrink-0 ${className}`}
      style={{
        width: size, height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${bg}, ${shade(bg, -15)})`,
        boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.08)`,
      }}
    >{initials || '·'}</div>
  );
}

function shade(hex: string, percent: number) {
  const f = hex.replace('#', '');
  const num = parseInt(f, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
