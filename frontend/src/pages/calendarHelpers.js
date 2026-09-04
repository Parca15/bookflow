export { fmt, clientName, addMinutes, statusColors, statusLabels, methodLabels } from '../utils/format'

export const statusDots = {
  SCHEDULED: 'bg-blue-500',
  CONFIRMED: 'bg-indigo-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-orange-400',
}

export const PAYABLE = ['SCHEDULED', 'CONFIRMED', 'COMPLETED']
