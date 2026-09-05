import { X, Ticket, CheckCircle } from 'lucide-react'
import { fmt } from './calendarHelpers'

export default function CouponModal({
  isOpen,
  onClose,
  appointment,
  onApplyCoupon,
  onRemoveCoupon,
  saving,
}) {
  if (!isOpen || !appointment) return null

  const hasCoupon = Boolean(appointment.promotionId && appointment.couponCode)
  const totalPrice = appointment.totalPrice || 0
  const discount = appointment.couponDiscountAmount || 0
  const totalAfterDiscount = Math.max(0, totalPrice - discount)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-600" />
            Cupón
          </h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-apple-secondary mb-4">
          Cita #{appointment.id} · Total {fmt(totalPrice)}
        </p>

        {hasCoupon ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-700">
                  Cupón {appointment.couponCode} aplicado
                </p>
                <p className="text-xs text-emerald-600">
                  Descuento: -{fmt(discount)}
                </p>
              </div>
            </div>

            <div className="bg-stone-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-apple-secondary">Total cita</span>
                <span className="font-medium">{fmt(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-brand-600">
                <span>Cupón {appointment.couponCode}</span>
                <span className="font-semibold">-{fmt(discount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-300 pt-1">
                <span className="text-sm font-medium text-apple-secondary">Total con descuento</span>
                <span className="font-bold">{fmt(totalAfterDiscount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 justify-center py-3 rounded-xl"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={onRemoveCoupon}
                disabled={saving}
                className="flex-1 justify-center py-3 rounded-xl bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Quitando...' : 'Quitar cupón'}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const code = e.target.code.value.trim()
              if (code) onApplyCoupon(code)
            }}
            className="space-y-4"
          >
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-3">
              <p className="text-xs text-brand-700">
                El cupón descuenta el saldo pendiente de la cita. No se registra como pago en caja.
              </p>
            </div>

            <div>
              <label className="label">Código de cupón</label>
              <input
                type="text"
                name="code"
                className="input-field uppercase"
                placeholder="Ej: VERANO20"
                autoFocus
                required
                disabled={saving}
                style={{ minHeight: '48px' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 justify-center py-3 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 justify-center py-3 rounded-xl disabled:opacity-50"
              >
                <Ticket className="w-4 h-4 mr-1" />
                {saving ? 'Aplicando...' : 'Aplicar cupón'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}