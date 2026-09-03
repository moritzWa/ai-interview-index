/** Coarse relative time. Deliberately low-resolution so server and client agree. */
export function when(unix: number): string {
  const mins = Math.max(0, Math.round((Date.now() / 1000 - unix) / 60))
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / (60 * 24))}d ago`
}
