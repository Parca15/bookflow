import { fmt } from './cashRegisterHelpers'
import { X } from 'lucide-react'

export default function CloseCashModal({ isOpen, onClose, onConfirm, closingAmount, setClosingAmount, expectedCash }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Cerrar caja</h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-base text-apple-secondary mb-2">
              Efectivo esperado: <span className="font-bold text-emerald-600">{fmt(expectedCash)}</span>
            </p>
            <label className="label">Monto de cierre (efectivo fisico)</label>
            <input
              type="number" className="input-field" value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)} placeholder="0"
            />
            {closingAmount && (
              <p className={`text-base mt-2 ${parseFloat(closingAmount) >= (expectedCash || 0) ? 'text-emerald-600' : 'text-red-600'}`}>
                Diferencia: {fmt(parseFloat(closingAmount) - (expectedCash || 0))}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onConfirm} className="btn-primary flex-1 justify-center">Cerrar caja</button>
            <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
