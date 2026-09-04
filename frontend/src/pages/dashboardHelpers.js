import { DollarSign, CreditCard, ArrowRightLeft, CircleDollarSign } from 'lucide-react'
export { fmt, methodLabels } from '../utils/format'

export const STATUS_MAP = {
  SCHEDULED: { label: 'Programada', color: 'bg-blue-500/20 text-blue-600' },
  COMPLETED: { label: 'Completada', color: 'bg-emerald-500/20 text-emerald-600' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500/20 text-red-600' },
}

export const methodIcons = {
  CASH: DollarSign,
  CARD: CreditCard,
  TRANSFER: ArrowRightLeft,
  OTHER: CircleDollarSign,
}

export const methodColors = {
  CASH: 'text-emerald-600',
  CARD: 'text-blue-600',
  TRANSFER: 'text-brand-600',
  OTHER: 'text-purple-600',
}

export const methodBg = {
  CASH: 'bg-emerald-500',
  CARD: 'bg-blue-500',
  TRANSFER: 'bg-brand-500',
  OTHER: 'bg-purple-500',
}
