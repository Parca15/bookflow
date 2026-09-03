import { BentoCard } from '../components/BentoCard'
import { fmt, methodLabels, methodIcons } from './cashRegisterHelpers'

export default function PaymentBreakdown({ cashRegister }) {
  if (!cashRegister) return null

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <BentoCard>
        <h3 className="font-semibold mb-3 text-apple-text">Ingresos por método</h3>
        <div className="space-y-2">
          {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => {
            const Icon = methodIcons[method]
            const key = `total${method.charAt(0) + method.slice(1).toLowerCase()}Payments`
            const value = cashRegister[key] || 0
            return (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-apple-secondary">{methodLabels[method]}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{fmt(value)}</span>
              </div>
            )
          })}
        </div>
      </BentoCard>

      <BentoCard>
        <h3 className="font-semibold mb-3 text-apple-text">Gastos por método</h3>
        <div className="space-y-2">
          {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => {
            const Icon = methodIcons[method]
            const key = `total${method.charAt(0) + method.slice(1).toLowerCase()}Expenses`
            const value = cashRegister[key] || 0
            return (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-apple-secondary">{methodLabels[method]}</span>
                </div>
                <span className="text-sm font-semibold text-red-500">{fmt(value)}</span>
              </div>
            )
          })}
        </div>
      </BentoCard>
    </div>
  )
}
