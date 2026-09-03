export function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val || 0)
}

export function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function clientName(c) {
  return `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Cliente #${c.id}`
}

export function getSlot(apt) {
  const [sh, sm] = (apt.startTime || '09:00').slice(0, 5).split(':').map(Number)
  let duration = 60
  if (apt.endTime) {
    const [eh, em] = apt.endTime.slice(0, 5).split(':').map(Number)
    duration = eh * 60 + em - (sh * 60 + sm)
    if (duration <= 0) duration = 60
  } else if (apt.totalDurationMinutes) {
    duration = apt.totalDurationMinutes
  }
  return { sh, sm, duration }
}

export const statusColors = {
  SCHEDULED: 'bg-blue-500/20 text-blue-600 border-blue-500/40',
  CONFIRMED: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/40',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40',
  COMPLETED: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40',
  CANCELLED: 'bg-red-500/20 text-red-600 border-red-500/40',
  NO_SHOW: 'bg-orange-500/20 text-orange-600 border-orange-500/40',
}

export const statusLabels = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

export const START_HOUR = 7
export const END_HOUR = 21
export const HOUR_HEIGHT = 56
export const PX_PER_MIN = HOUR_HEIGHT / 60
