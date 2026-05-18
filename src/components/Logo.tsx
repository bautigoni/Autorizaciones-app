import React from 'react';

interface LogoProps { size?: number; variant?: 'mark' | 'lockup' | 'mono'; className?: string; }

export function Logo({ size = 40, variant = 'mark', className }: LogoProps) {
  const mark = (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="ssg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB785" />
          <stop offset="100%" stopColor="#FF7A2E" />
        </linearGradient>
        <linearGradient id="ssg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFBF5" />
          <stop offset="100%" stopColor="#FFF4EC" />
        </linearGradient>
      </defs>
      <path d="M32 4 L54 12 V30 C54 44 44 54 32 60 C20 54 10 44 10 30 V12 Z" fill="url(#ssg)" />
      <path d="M32 9 L49 15.2 V30 C49 41 41 49 32 54 C23 49 15 41 15 30 V15.2 Z" fill="url(#ssg2)" />
      <path d="M22.5 32.5 L29 39 L42 25.5" stroke="#FF7A2E" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="32" cy="32" r="20" stroke="#FFE6D4" strokeWidth="1.4" fill="none" opacity="0.6" />
    </svg>
  );

  const monoMark = (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <path d="M32 4 L54 12 V30 C54 44 44 54 32 60 C20 54 10 44 10 30 V12 Z" fill="currentColor" />
      <path d="M22.5 32.5 L29 39 L42 25.5" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  if (variant === 'mono') return monoMark;
  if (variant === 'mark') return mark;

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      {mark}
      <div className="leading-tight">
        <div className="font-display font-extrabold text-ink-900" style={{ fontSize: size * 0.46 }}>Salida Segura</div>
        <div className="text-ink-400 font-medium" style={{ fontSize: size * 0.28 }}>autorizaciones escolares</div>
      </div>
    </div>
  );
}
