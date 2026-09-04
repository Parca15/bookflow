export function fmt(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumberWithDots(value) {
  if (!value && value !== 0) return ''
  const str = String(value).replace(/\D/g, '')
  if (!str) return ''
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseFormattedNumber(formatted) {
  if (!formatted) return ''
  return formatted.replace(/\./g, '')
}

export function clientName(client) {
  if (!client) return 'Sin cliente'
  if (client.fullName) return client.fullName
  if (client.firstName || client.lastName) return `${client.firstName || ''} ${client.lastName || ''}`.trim()
  if (client.name) return client.name
  return 'Sin nombre'
}

export function addMinutes(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number)
  const totalMins = hours * 60 + mins + minutes
  const h = Math.floor(totalMins / 60) % 24
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-red-100 text-red-700',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

export const statusLabels = {
  SCHEDULED: 'Programada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
}

export const methodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
}

export const methodColors = {
  CASH: 'bg-green-100 text-green-700',
  CARD: 'bg-blue-100 text-blue-700',
  TRANSFER: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
}
