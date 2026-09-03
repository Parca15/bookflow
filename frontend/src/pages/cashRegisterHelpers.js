export const fmt = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0)

export const methodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
}

export const methodIcons = {
  CASH: DollarSign,
  CARD: CreditCard,
  TRANSFER: ArrowRightLeft,
  OTHER: CircleDollarSign,
}

import { DollarSign, CreditCard, ArrowRightLeft, CircleDollarSign } from 'lucide-react'
