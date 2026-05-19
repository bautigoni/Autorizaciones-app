import React from 'react';

/**
 * NexoEscolar brand logo component.
 * All assets are in /brand/ (public/brand/).
 *
 * variant="lockup"  — horizontal lockup: icon + "NexoEscolar" + tagline (default)
 * variant="stacked" — stacked lockup: icon on top, text below
 * variant="mark"    — standalone icon mark on light rounded-square bg
 * variant="mono"    — standalone icon mark on dark rounded-square bg (for dark surfaces)
 *
 * size controls the rendered HEIGHT (px). Width scales automatically.
 */
interface LogoProps {
  size?: number;
  variant?: 'lockup' | 'stacked' | 'mark' | 'mono';
  className?: string;
}

export function Logo({ size = 40, variant = 'lockup', className }: LogoProps) {
  const base: React.CSSProperties = { display: 'block', flexShrink: 0 };

  switch (variant) {
    case 'mark':
      return (
        <img
          src="/brand/logo-app-icon-light.png"
          alt="NexoEscolar"
          draggable={false}
          style={{ height: size, width: 'auto', ...base }}
          className={className}
        />
      );

    case 'mono':
      return (
        <img
          src="/brand/logo-app-icon-dark.png"
          alt="NexoEscolar"
          draggable={false}
          style={{ height: size, width: 'auto', ...base }}
          className={className}
        />
      );

    case 'stacked':
      return (
        <img
          src="/brand/logo-stacked.png"
          alt="NexoEscolar"
          draggable={false}
          style={{ height: size * 1.4, width: 'auto', ...base }}
          className={className}
        />
      );

    case 'lockup':
    default:
      // Use pre-scaled version: sm (320×73) for ≤48px, md (480×110) for ≤80px, lg otherwise
      const src =
        size <= 48 ? '/brand/logo-horizontal-sm.png' :
        size <= 80 ? '/brand/logo-horizontal-md.png' :
        '/brand/logo-horizontal-lg.png';
      return (
        <img
          src={src}
          alt="NexoEscolar"
          draggable={false}
          style={{ height: size, width: 'auto', ...base }}
          className={className}
        />
      );
  }
}
