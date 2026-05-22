import React from 'react';

interface P { size?: number; className?: string; strokeWidth?: number; }
const base = (size = 18, sw = 2) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const I = {
  Home: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>,
  List: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
  Plus: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M12 5v14M5 12h14" /></svg>,
  Calendar: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>,
  Clock: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  User: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>,
  Users: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /><circle cx="17" cy="9" r="2.8" /><path d="M14 20c0-2.5 1.6-4.6 4-5.6" /></svg>,
  Shield: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M12 3l8 3v6c0 4.5-3.4 8.5-8 9-4.6-.5-8-4.5-8-9V6l8-3z" /></svg>,
  Search: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
  Check: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M4 12l5 5L20 6" /></svg>,
  Close: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M5 5l14 14M19 5L5 19" /></svg>,
  Eye: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  EyeOff: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M2 12s3.5-7 10-7c2 0 3.8.6 5.3 1.5M22 12s-3.5 7-10 7c-2 0-3.8-.6-5.3-1.5" /><path d="M3 3l18 18" /></svg>,
  Bell: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" /><path d="M10 21a2 2 0 004 0" /></svg>,
  Logout: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h12" /></svg>,
  Edit: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M4 20h4l11-11-4-4L4 16v4z" /></svg>,
  Trash: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" /></svg>,
  ChevronRight: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M9 6l6 6-6 6" /></svg>,
  ChevronLeft: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M15 6l-6 6 6 6" /></svg>,
  Mail: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></svg>,
  Lock: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>,
  Phone: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.5 2.6a2 2 0 01-.5 2L8 9.6a16 16 0 006 6l1.3-1.3a2 2 0 012-.5c.8.2 1.7.4 2.6.5A2 2 0 0122 16.9z" /></svg>,
  Upload: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M12 17V3M5 10l7-7 7 7" /><path d="M3 21h18" /></svg>,
  Filter: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M4 5h16l-6 8v6l-4-2v-4L4 5z" /></svg>,
  Door: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16" /><path d="M3 21h14M11 12h.01M15 21V8l5 1v12" /></svg>,
  Sparkle: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" /></svg>,
  AlertTriangle: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>,
  CheckCircle: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>,
  ArrowRight: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M5 12h14M13 5l7 7-7 7" /></svg>,
  ArrowLeft: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M19 12H5M11 5l-7 7 7 7" /></svg>,
  Chart: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M3 3v16a2 2 0 002 2h16" /><path d="M8 16v-5M13 16V7M18 16v-3" /></svg>,
  TrendingUp: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>,
  Trophy: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M7 4h10v5a5 5 0 01-10 0V4z" /><path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M9 21h6M12 17v4" /></svg>,
  PieChart: ({ size, className, strokeWidth }: P) => <svg {...base(size, strokeWidth)} className={className}><path d="M12 3a9 9 0 109 9h-9V3z" /><path d="M12 3v9h9A9 9 0 0012 3z" /></svg>,
};
