import { BentoCard } from '../components/BentoCard'
import { methodIcons, methodColors, methodBg, fmt } from './dashboardHelpers'
import { BarChart3 } from 'lucide-react'

export default function PaymentMethods({ dailyReport }) {
  const maxPayment = Math.max(
    dailyReport?.cashPayments || 0,
    dailyReport?.cardPayments || 0,
    dailyReport?.transferPayments || 0,
    dailyReport?.otherPayments || 0,
    1
  )

  return (
    <BentoCard>
      <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-brand-500" />Pagos por método
      </h3>
      <div className="space-y-3">
        {[
          { key: 'cashPayments', label: 'Efectivo', method: 'CASH' },
          { key: 'cardPayments', label: 'Tarjeta', method: 'CARD' },
          { key: 'transferPayments', label: 'Transferencia', method: 'TRANSFER' },
          { key: 'otherPayments', label: 'Otro', method: 'OTHER' },
        ].map(({ key, label, method }) => {
          const Icon = methodIcons[method]
          const value = dailyReport?.[key] || 0
          const pct = maxPayment > 0 ? (value / maxPayment) * 100 : 0
          return (
            <div key={method}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${methodColors[method]}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm font-semibold">{fmt(value)}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div className={`${methodBg[method]} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}
