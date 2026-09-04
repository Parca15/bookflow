export { fmt, clientName, addMinutes, statusColors, statusLabels, methodLabels } from '../utils/format'

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

export const START_HOUR = 7
export const END_HOUR = 21
export const HOUR_HEIGHT = 56
export const PX_PER_MIN = HOUR_HEIGHT / 60
