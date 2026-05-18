export function formatDateLong(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}
export function formatDateShort(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}
export function formatDateTime(iso: string): string {
  const d = new Date(iso.replace(' ', 'T'));
  return d.toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function relative(iso: string): string {
  const t = new Date(iso.replace(' ', 'T')).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
  return formatDateTime(iso);
}
export function todayISO(): string { return new Date().toISOString().slice(0, 10); }
export function isPast(date: string, time: string): boolean {
  const d = new Date(`${date}T${time}:00`); return d.getTime() < Date.now();
}
