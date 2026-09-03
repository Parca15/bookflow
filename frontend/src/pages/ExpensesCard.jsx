import { BentoCard } from '../components/BentoCard'
import { fmt } from './dashboardHelpers'
import { ArrowDownRight } from 'lucide-react'

export default function ExpensesCard({ dailyReport }) {
  return (
    <BentoCard>
      <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
        <ArrowDownRight className="w-4 h-4 text-red-500" />Gastos hoy
      </h3>
      <div className="space-y-2">
        {[
          { label: 'Efectivo', value: dailyReport?.cashExpenses },
          { label: 'Tarjeta', value: dailyReport?.cardExpenses },
          { label: 'Transferencia', value: dailyReport?.transferExpenses },
          { label: 'Otro', value: dailyReport?.otherExpenses },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-apple-secondary">{label}</span>
            <span className="text-sm font-semibold text-red-500">{fmt(value)}</span>
          </div>
        ))}
        <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
          <span className="text-sm font-medium">Total gastos</span>
          <span className="text-sm font-bold text-red-600">{fmt(dailyReport?.totalExpenses)}</span>
        </div>
      </div>
    </BentoCard>
  )
}
