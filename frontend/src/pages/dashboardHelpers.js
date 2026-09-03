export const STATUS_MAP = {
  SCHEDULED: { label: 'Programada', color: 'bg-blue-500/20 text-blue-600' },
  COMPLETED: { label: 'Completada', color: 'bg-emerald-500/20 text-emerald-600' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500/20 text-red-600' },
  NO_SHOW: { label: 'No asistió', color: 'bg-amber-500/20 text-amber-600' },
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

import { DollarSign, CreditCard, ArrowRightLeft, CircleDollarSign } from 'lucide-react'

export const fmt = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0)
