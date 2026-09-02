import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { paymentService } from '../services/paymentService'
import { clientService } from '../services/clientService'
import { cashService } from '../services/cashService'
import { BentoCard } from '../components/BentoCard'
import {
  CreditCard,
  Calendar,
  Clock,
  DollarSign,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusLabels = {
  SCHEDULED: 'Programada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

const methodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
}

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

// Estados desde los que se puede registrar un abono
const PAYABLE = ['SCHEDULED', 'COMPLETED']

export default function PaymentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [clientMap, setClientMap] = useState({})
  const [cashOpen, setCashOpen] = useState(null)
  const [filter, setFilter] = useState('payable')
  const [loading, setLoading] = useState(true)

  // Modal de pago
  const [selected, setSelected] = useState(null)
  const [payments, setPayments] = useState([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [balance, setBalance] = useState(0)
  const [form, setForm] = useState({ amount: '', paymentMethod: 'CASH', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const [aptRes, cashRes, clientRes] = await Promise.allSettled([
        appointmentService.getAll(user.companyId),
        cashService.getOpen(user.companyId),
        clientService.getAll(user.companyId),
      ])
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data)
      if (cashRes.status === 'fulfilled') setCashOpen(cashRes.value.data)
      if (clientRes.status === 'fulfilled') {
        const map = {}
        ;(clientRes.value.data || []).forEach((c) => { map[c.id] = c.fullName })
        setClientMap(map)
      }
    } catch (e) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const openPaymentModal = async (appointment) => {
    setSelected(appointment)
    setForm({ amount: '', paymentMethod: 'CASH', notes: '' })
    try {
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, appointment.id),
        paymentService.getTotalPaid(user.companyId, appointment.id),
        paymentService.getBalance(user.companyId, appointment.id),
      ])
      setPayments(listRes.data || [])
      setTotalPaid(totalRes.data ?? 0)
      setBalance(balanceRes.data ?? 0)
      setForm((f) => ({ ...f, amount: String(balanceRes.data ?? '') }))
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al cargar pagos de la cita')
    }
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }
    setSaving(true)
    try {
      await paymentService.create(user.companyId, selected.id, {
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        notes: form.notes || null,
      })
      toast.success('Pago registrado')
      // Refrescar datos del modal y del cliente abierto en caja
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, selected.id),
        paymentService.getTotalPaid(user.companyId, selected.id),
        paymentService.getBalance(user.companyId, selected.id),
      ])
      setPayments(listRes.data || [])
      setTotalPaid(totalRes.data ?? 0)
      setBalance(balanceRes.data ?? 0)
      setForm({ amount: '', paymentMethod: form.paymentMethod, notes: '' })
      cashService.getOpen(user.companyId).then((r) => setCashOpen(r.data)).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el pago')
    } finally {
      setSaving(false)
    }
  }

  const payableCount = appointments.filter(
    (a) => PAYABLE.includes(a.status) && (a.totalPrice || 0) > 0
  ).length

  const filtered =
    filter === 'all'
      ? appointments
      : filter === 'payable'
        ? appointments.filter(
            (a) => PAYABLE.includes(a.status) && (a.totalPrice || 0) > 0
          )
        : appointments.filter((a) => a.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-apple-secondary mt-1">
            {payableCount} citas pendientes de pago
            {!cashOpen && ' · ⚠️ No hay caja abierta: no se pueden registrar pagos'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          ['payable', 'Por pagar'],
          ['all', 'Todas'],
          ['SCHEDULED', statusLabels.SCHEDULED],
          ['COMPLETED', statusLabels.COMPLETED],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-brand-600 text-white'
                : 'bg-apple-card text-apple-secondary hover:bg-apple-card'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid de citas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((apt) => (
          <BentoCard key={apt.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold">
                  {clientMap[apt.clientId] || `Cliente #${apt.clientId}`}
                </p>
                <p className="text-sm text-apple-secondary">
                  Cita #{apt.id} · {apt.services?.length || 0} servicios
                </p>
              </div>
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400">
                {statusLabels[apt.status]}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-apple-secondary mb-4">
              <Calendar className="w-4 h-4" />
              <span>{apt.appointmentDate}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{apt.startTime}</span>
            </div>

            {apt.services?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {apt.services.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-apple-card rounded text-xs text-gray-300">
                    {s.catalogName}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-400">{fmt(apt.totalPrice)}</span>
              {PAYABLE.includes(apt.status) && (apt.totalPrice || 0) > 0 ? (
                <button
                  onClick={() => openPaymentModal(apt)}
                  disabled={!cashOpen}
                  className={`btn-primary px-4 py-2 ${!cashOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CreditCard className="w-4 h-4" />Abonar
                </button>
              ) : (
                <button
                  onClick={() => openPaymentModal(apt)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Ver pagos
                </button>
              )}
            </div>
          </BentoCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-apple-secondary">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay citas con este filtro</p>
        </div>
      )}

      {/* Modal de pago */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Cita #{selected.id} — {clientMap[selected.clientId] || `Cliente #${selected.clientId}`}
              </h3>
              <button onClick={() => setSelected(null)} className="text-apple-secondary hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-apple-card rounded-xl p-3 text-center">
                <p className="text-xs text-apple-secondary">Total cita</p>
                <p className="font-bold">{fmt(selected.totalPrice)}</p>
              </div>
              <div className="bg-apple-card rounded-xl p-3 text-center">
                <p className="text-xs text-apple-secondary">Pagado</p>
                <p className="font-bold text-emerald-400">{fmt(totalPaid)}</p>
              </div>
              <div className="bg-apple-card rounded-xl p-3 text-center">
                <p className="text-xs text-apple-secondary">Saldo</p>
                <p className={`font-bold ${balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{fmt(balance)}</p>
              </div>
            </div>

            {/* Formulario abono */}
            {PAYABLE.includes(selected.status) && cashOpen && (
              <form onSubmit={handlePay} className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Monto del abono</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={balance}
                      className="input-field"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      style={{ minHeight: '48px' }}
                      aria-label="Monto del abono"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="label">Método</label>
                    <select
                      className="input-field"
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
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
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={{ minHeight: '48px' }}
                    placeholder="Ej: Corte de cabello"
                  />
                </div>
                <button type="submit" disabled={saving} className={`btn-primary w-full justify-center ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <DollarSign className="w-4 h-4" />{saving ? 'Guardando...' : 'Registrar pago'}
                </button>
              </form>
            )}
            {PAYABLE.includes(selected.status) && !cashOpen && balance > 0 && (
              <p className="text-sm text-yellow-400 bg-yellow-500/10 rounded-xl p-3 mb-6">
                Abre la caja para poder registrar pagos.
              </p>
            )}

            {/* Historial */}
            <h4 className="font-semibold text-sm text-apple-secondary uppercase tracking-wide mb-3">Historial de pagos</h4>
            <div className="space-y-2">
              {(payments.length === 0) && (
                <p className="text-apple-secondary text-sm">Sin pagos registrados aún.</p>
              )}
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-apple-card/60 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{methodLabels[p.paymentMethod]}</p>
                    <p className="text-xs text-apple-secondary">
                      {String(p.paymentDate).replace('T', ' ').slice(0, 16)}{p.notes ? ` · ${p.notes}` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-400">{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}