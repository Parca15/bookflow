import { fmt, methodLabels, methodIcons } from './cashRegisterHelpers'
import { X } from 'lucide-react'

export default function CashDetailModal({ register, onClose }) {
  if (!register) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Caja #{register.id}</h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text"><X className="w-5 h-5" /></button>
        </div>

        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${register.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-500/20 text-apple-secondary'}`}>
          {register.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
        </span>

        <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
          <div>
            <p className="text-sm text-apple-secondary">Fecha apertura</p>
            <p className="text-sm font-medium">{register.openingDate?.replace('T', ' ').slice(0, 16)}</p>
          </div>
          <div>
            <p className="text-sm text-apple-secondary">Fecha cierre</p>
            <p className="text-sm font-medium">{register.closingDate?.replace('T', ' ').slice(0, 16) || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Apertura', value: fmt(register.openingAmount), color: 'text-blue-600' },
            { label: 'Cierre', value: register.closingAmount ? fmt(register.closingAmount) : '—' },
            { label: 'Esperado', value: register.expectedCashAmount ? fmt(register.expectedCashAmount) : '—' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-100 rounded-xl p-3 text-center">
              <p className="text-xs text-apple-secondary">{label}</p>
              <p className={`font-bold text-sm ${color || ''}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-sm text-emerald-600 mb-2">Ingresos</h4>
          <div className="grid grid-cols-2 gap-2">
            {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => {
              const Icon = methodIcons[method]
              const key = `total${method.charAt(0) + method.slice(1).toLowerCase()}Payments`
              return (
                <div key={method} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-emerald-600" /><span className="text-sm">{methodLabels[method]}</span></div>
                  <span className="text-sm font-semibold text-emerald-600">{fmt(register[key] || 0)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2 px-3 py-2 bg-emerald-100 rounded-lg">
            <span className="text-sm font-semibold">Total ingresos</span>
            <span className="text-sm font-bold text-emerald-600">{fmt(register.totalPayments)}</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-sm text-red-500 mb-2">Gastos</h4>
          <div className="grid grid-cols-2 gap-2">
            {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => {
              const Icon = methodIcons[method]
              const key = `total${method.charAt(0) + method.slice(1).toLowerCase()}Expenses`
              return (
                <div key={method} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-red-500" /><span className="text-sm">{methodLabels[method]}</span></div>
                  <span className="text-sm font-semibold text-red-500">{fmt(register[key] || 0)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2 px-3 py-2 bg-red-100 rounded-lg">
            <span className="text-sm font-semibold">Total gastos</span>
            <span className="text-sm font-bold text-red-500">{fmt(register.totalExpenses)}</span>
          </div>
        </div>

        <div className="bg-stone-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Resultado neto</span>
            <span className={`text-xl font-bold ${(register.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(register.netResult)}</span>
          </div>
          {register.cashDifference != null && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-300">
              <span className="text-sm text-apple-secondary">Diferencia en efectivo</span>
              <span className={`text-sm font-semibold ${(register.cashDifference || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(register.cashDifference)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
