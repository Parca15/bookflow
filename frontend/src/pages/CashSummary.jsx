import { BentoCard } from '../components/BentoCard'
import { fmt } from './cashRegisterHelpers'

export default function CashSummary({ cashRegister }) {
  if (!cashRegister) return null
  return (
    <BentoCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-apple-secondary">Efectivo esperado en caja</p>
          <p className="text-xl font-bold text-emerald-600">
            {fmt((cashRegister.openingAmount || 0) + (cashRegister.totalCashPayments || 0) - (cashRegister.totalCashExpenses || 0))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-apple-secondary">Apertura + Efectivo - Gastos efectivo</p>
          <p className="text-sm text-apple-secondary">
            {fmt(cashRegister.openingAmount)} + {fmt(cashRegister.totalCashPayments)} - {fmt(cashRegister.totalCashExpenses)}
          </p>
        </div>
      </div>
    </BentoCard>
  )
}
