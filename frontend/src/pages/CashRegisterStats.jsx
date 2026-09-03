import { BentoStatCard } from '../components/BentoCard'
import { fmt } from './cashRegisterHelpers'
import { DollarSign, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'

export default function CashRegisterStats({ cashRegister }) {
  if (!cashRegister) return null
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <BentoStatCard icon={DollarSign} label="Apertura" value={fmt(cashRegister.openingAmount)} color="blue" />
      <BentoStatCard icon={ArrowDownRight} label="Ingresos" value={fmt(cashRegister.totalPayments)} color="green" />
      <BentoStatCard icon={ArrowUpRight} label="Gastos" value={fmt(cashRegister.totalExpenses)} color="orange" />
      <BentoStatCard icon={TrendingUp} label="Neto" value={fmt(cashRegister.netResult)} color="brand" />
    </div>
  )
}
