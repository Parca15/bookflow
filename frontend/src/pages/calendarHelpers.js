export { fmt, clientName, addMinutes, statusColors, statusLabels, methodLabels } from '../utils/format'

export const statusDots = {
  SCHEDULED: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
}

export const PAYABLE = ['SCHEDULED', 'COMPLETED']
