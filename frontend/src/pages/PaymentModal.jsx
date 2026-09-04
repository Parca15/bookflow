import { X, CheckCircle, DollarSign, FileText, Ticket } from 'lucide-react'
import { fmt, methodLabels, PAYABLE } from './calendarHelpers'
import { formatNumberWithDots, parseFormattedNumber } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function PaymentModal({
  isOpen, onClose, appointment, clientMap, payments, totalPaid, balance,
  paymentForm, setPaymentForm, onPayment, saving, couponCode, setCouponCode,
  appliedCoupon, couponError, onValidateCoupon, onRemoveCoupon, discountAmount,
  totalWithDiscount, balanceWithDiscount, cashOpen, isPayFull, onOpenInvoice
}) {
  const navigate = useNavigate()
  if (!isOpen || !appointment) return null

  const currentBalance = appliedCoupon ? balanceWithDiscount : balance

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cashOpen) {
      toast.error('Debes abrir caja para registrar pagos')
      onClose()
      navigate('/cash')
      return
    }
    onPayment(e)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">
            Cita #{appointment.id} — {clientMap[appointment.clientId] || `Cliente #${appointment.clientId}`}
          </h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-stone-100 rounded-xl p-3 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-apple-secondary">Total cita</span>
            <span className="font-bold text-sm">{fmt(appointment.totalPrice)}</span>
          </div>
          {appliedCoupon && (
            <>
              <div className="flex items-center justify-between text-brand-600">
                <span className="text-sm flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Cupón {appliedCoupon.code}</span>
                <span className="text-sm font-semibold">-{fmt(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-300 pt-1">
                <span className="text-sm font-medium text-apple-secondary">Total con descuento</span>
                <span className="font-bold text-sm">{fmt(totalWithDiscount)}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-apple-secondary">Pagado</span>
            <span className="font-bold text-sm text-emerald-600">{fmt(totalPaid)}</span>
          </div>
          <div className={`flex items-center justify-between border-t border-stone-300 pt-1 ${currentBalance <= 0 ? 'bg-emerald-50 -mx-3 -mb-3 px-3 pb-3 pt-1 rounded-b-xl' : ''}`}>
            <span className="text-sm font-medium text-apple-secondary">Saldo</span>
            <span className={`font-bold text-sm ${currentBalance <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmt(currentBalance)}
            </span>
          </div>
        </div>

        {currentBalance <= 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Cita pagada completamente</span>
          </div>
        )}

        {PAYABLE.includes(appointment.status) && currentBalance > 0 && (
          <div className="mb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-brand-600" />
                  <div>
                    <span className="text-sm font-semibold text-brand-700">{appliedCoupon.code}</span>
                    <span className="text-xs text-brand-500 ml-2">
                      {appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : fmt(appliedCoupon.discountValue)}
                    </span>
                  </div>
                </div>
                <button onClick={onRemoveCoupon} className="text-brand-400 hover:text-brand-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Código de cupón"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()) }}
                  onKeyDown={(e) => e.key === 'Enter' && onValidateCoupon()}
                  disabled={saving}
                  style={{ minHeight: '48px' }}
                />
                <button
                  type="button"
                  onClick={onValidateCoupon}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
                  disabled={saving || !couponCode.trim()}
                >
                  <Ticket className="w-4 h-4" />
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>
        )}

        {PAYABLE.includes(appointment.status) && cashOpen && currentBalance > 0 && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  {appliedCoupon ? 'Monto del descuento' : isPayFull ? 'Monto a pagar' : 'Monto del abono'}
                </label>
                {appliedCoupon ? (
                  <input
                    type="text"
                    className="input-field bg-stone-100"
                    value={fmt(discountAmount)}
                    readOnly
                    style={{ minHeight: '48px', cursor: 'default' }}
                  />
                ) : (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-field"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: formatNumberWithDots(e.target.value) })}
                    required
                    style={{ minHeight: '48px' }}
                    disabled={saving}
                  />
                )}
              </div>
              <div>
                <label className="label">Método</label>
                <select
                  className="input-field"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  style={{ minHeight: '48px' }}
                >
                  {Object.entries(methodLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Notas (opcional)</label>
              <input
                type="text"
                className="input-field"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                style={{ minHeight: '48px' }}
                placeholder="Ej: Abono parcial"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3 rounded-xl">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3 rounded-xl disabled:opacity-50">
                <DollarSign className="w-4 h-4 mr-1" />{saving ? 'Guardando...' : appliedCoupon ? 'Aplicar descuento' : isPayFull ? 'Pagar completo' : 'Registrar abono'}
              </button>
            </div>
          </form>
        )}

        {PAYABLE.includes(appointment.status) && !cashOpen && balance > 0 && (
          <p className="text-sm text-yellow-600 bg-yellow-500/10 rounded-xl p-3 mb-6">
            Abre la caja para poder registrar pagos.
          </p>
        )}

        <button
          onClick={() => { onClose(); onOpenInvoice(appointment) }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-apple-hover text-apple-secondary rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors mb-4"
        >
          <FileText className="w-4 h-4" />Ver factura / Descargar PDF
        </button>

        <h4 className="font-semibold text-sm text-apple-secondary uppercase tracking-wide mb-3">Historial de pagos</h4>
        <div className="space-y-2">
          {payments.length === 0 && (
            <p className="text-apple-secondary text-sm">Sin pagos registrados aún.</p>
          )}
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-stone-100 rounded-xl px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{methodLabels[p.paymentMethod]}</p>
                <p className="text-xs text-apple-secondary">
                  {String(p.paymentDate).replace('T', ' ').slice(0, 16)}{p.notes ? ` · ${p.notes}` : ''}
                </p>
              </div>
              <span className="font-bold text-emerald-600">{fmt(p.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
