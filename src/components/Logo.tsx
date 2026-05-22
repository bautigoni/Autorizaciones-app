import React, { useId } from 'react';

/**
 * NexoEscolar brand logo — pure SVG, transparent background, crisp at any size.
 *
 * variant="lockup"  — horizontal: icon + "NexoEscolar" wordmark (default)
 * variant="stacked" — icon on top, wordmark below
 * variant="mark"    — standalone icon inside a soft rounded-square (app-icon look)
 * variant="mono"    — standalone icon in solid white (for dark surfaces)
 *
 * `size` is the icon HEIGHT in px. The wordmark scales with it.
 */
interface LogoProps {
  size?: number;
  variant?: 'lockup' | 'stacked' | 'mark' | 'mono';
  tagline?: boolean;
  className?: string;
}

/** The brand mark: a heart (care) with a verified checkmark (authorization). */
function Mark({ size, tone = 'gradient' }: { size: number; tone?: 'gradient' | 'white' }) {
  const id = useId().replace(/:/g, '');
  const heartPath =
    'M24 40.5C24 40.5 6.5 30.2 6.5 18.4C6.5 12.5 11 8.8 15.6 8.8' +
    'C19.3 8.8 22.4 11.1 24 14C25.6 11.1 28.7 8.8 32.4 8.8' +
    'C37 8.8 41.5 12.5 41.5 18.4C41.5 30.2 24 40.5 24 40.5Z';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="NexoEscolar"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {tone === 'gradient' && (
        <defs>
          <linearGradient id={`${id}-h`} x1="8" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA04A" />
            <stop offset="0.42" stopColor="#FF7A2E" />
            <stop offset="1" stopColor="#46B98A" />
          </linearGradient>
        </defs>
      )}
      <path d={heartPath} fill={tone === 'white' ? '#FFFFFF' : `url(#${id}-h)`} />
      <path
        d="M16.4 23.2L21.6 28.4L31.8 16.8"
        stroke={tone === 'white' ? '#FF7A2E' : '#FFFFFF'}
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Wordmark({ size, tagline }: { size: number; tagline?: boolean }) {
  return (
    <div style={{ lineHeight: 1, display: 'flex', flexDirection: 'column', gap: size * 0.1 }}>
      <span
        style={{
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: size * 0.62,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#2A2520' }}>Nexo</span>
        <span
          style={{
            background: 'linear-gradient(90deg, #E96416 0%, #FF7A2E 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Escolar
        </span>
      </span>
      {tagline && (
        <span
          style={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontWeight: 700,
            fontSize: size * 0.205,
            letterSpacing: '0.13em',
            lineHeight: 1,
            color: '#7AB169',
            whiteSpace: 'nowrap',
          }}
        >
          CONECTA · AUTORIZA · CUIDA
        </span>
      )}
    </div>
  );
}

export function Logo({ size = 40, variant = 'lockup', tagline = false, className }: LogoProps) {
  if (variant === 'mark') {
    const pad = size * 0.2;
    const box = size;
    return (
      <div
        className={className}
        style={{
          width: box,
          height: box,
          borderRadius: box * 0.26,
          background: 'linear-gradient(150deg, #FFFCF7 0%, #FDF3E6 100%)',
          border: '1px solid #EBDFCB',
          boxShadow: '0 4px 14px -4px rgba(201,138,80,0.30)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Mark size={box - pad * 2} />
      </div>
    );
  }

  if (variant === 'mono') {
    return (
      <span className={className} style={{ display: 'inline-flex' }}>
        <Mark size={size} tone="white" />
      </span>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={className}
        style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.22 }}
      >
        <Mark size={size} />
        <Wordmark size={size * 0.86} tagline={tagline} />
      </div>
    );
  }

  // lockup
  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3 }}
    >
      <Mark size={size} />
      <Wordmark size={size} tagline={tagline} />
    </div>
  );
}
