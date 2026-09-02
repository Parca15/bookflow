import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cashService } from '../services/cashService'
import { BentoCard, BentoStatCard } from '../components/BentoCard'
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  Unlock,
  X,
  CreditCard,
  ArrowRightLeft,
  CircleDollarSign,
} from 'lucide-react'
import toast from 'react-hot-toast'

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val || 0)
}

const methodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
}

const methodIcons = {
  CASH: DollarSign,
  CARD: CreditCard,
  TRANSFER: ArrowRightLeft,
  OTHER: CircleDollarSign,
}

export default function CashRegisterPage() {
  const { user } = useAuth()
  const [cashRegister, setCashRegister] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showClose, setShowClose] = useState(false)
  const [closingAmount, setClosingAmount] = useState('')
  const [selectedRegister, setSelectedRegister] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [openRes, histRes] = await Promise.allSettled([
        cashService.getOpen(user.companyId),
        cashService.getAll(user.companyId),
      ])
      if (openRes.status === 'fulfilled') setCashRegister(openRes.value.data)
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data)
    } catch (e) {
      toast.error('Error al cargar caja')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = async () => {
    const amount = prompt('Monto de apertura:')
    if (!amount) return
    try {
      await cashService.open(user.companyId, { openingAmount: parseFloat(amount) })
      toast.success('Caja abierta')
      loadData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al abrir caja')
    }
  }

  const handleClose = async () => {
    if (!closingAmount) return
    try {
      await cashService.close(user.companyId, cashRegister.id, {
        closingAmount: parseFloat(closingAmount),
      })
      toast.success('Caja cerrada')
      setShowClose(false)
      setClosingAmount('')
      loadData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al cerrar caja')
    }
  }

  const openDetail = async (register) => {
    try {
      const { data } = await cashService.getById(user.companyId, register.id)
      setSelectedRegister(data)
    } catch (e) {
      toast.error('Error al cargar detalle de caja')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Caja</h1>
          <p className="text-apple-secondary mt-1">
            {cashRegister ? 'Caja abierta' : 'Sin caja abierta'}
          </p>
        </div>
        <div className="flex gap-2">
          {!cashRegister ? (
            <button onClick={handleOpen} className="btn-primary">
              <Unlock className="w-5 h-5" />Abrir caja
            </button>
          ) : (
            <button onClick={() => setShowClose(true)} className="btn-primary bg-red-600 hover:bg-red-700">
              <Lock className="w-5 h-5" />Cerrar caja
            </button>
          )}
        </div>
      </div>

      {/* Resumen caja abierta */}
      {cashRegister && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <BentoStatCard icon={DollarSign} label="Apertura" value={fmt(cashRegister.openingAmount)} color="blue" />
            <BentoStatCard icon={ArrowDownRight} label="Ingresos" value={fmt(cashRegister.totalPayments)} color="green" />
            <BentoStatCard icon={ArrowUpRight} label="Gastos" value={fmt(cashRegister.totalExpenses)} color="orange" />
            <BentoStatCard icon={TrendingUp} label="Neto" value={fmt(cashRegister.netResult)} color="brand" />
          </div>

          {/* Desglose por método */}
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

          {/* Resumen final */}
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
        </>
      )}

      {/* Close modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Cerrar caja</h3>
            <div className="space-y-4">
              <div>
                <p className="text-base text-apple-secondary mb-2">
                  Efectivo esperado: <span className="font-bold text-emerald-600">{fmt(cashRegister.expectedCashAmount)}</span>
                </p>
                <label className="label">Monto de cierre (efectivo fisico)</label>
                <input
                  type="number"
                  className="input-field"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  placeholder="0"
                />
                {closingAmount && (
                  <p className={`text-base mt-2 ${
                    parseFloat(closingAmount) >= (cashRegister.expectedCashAmount || 0)
                      ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    Diferencia: {fmt(parseFloat(closingAmount) - (cashRegister.expectedCashAmount || 0))}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleClose} className="btn-primary flex-1 justify-center">
                  Cerrar caja
                </button>
                <button onClick={() => setShowClose(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      <BentoCard>
        <h3 className="font-semibold mb-4">Historial de cajas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-apple-secondary border-b border-apple-border">
                <th className="text-left py-3">ID</th>
                <th className="text-left py-3">Apertura</th>
                <th className="text-left py-3">Monto apertura</th>
                <th className="text-left py-3">Cierre</th>
                <th className="text-left py-3">Monto cierre</th>
                <th className="text-left py-3">Ingresos</th>
                <th className="text-left py-3">Gastos</th>
                <th className="text-left py-3">Neto</th>
                <th className="text-left py-3">Esperado</th>
                <th className="text-left py-3">Diferencia</th>
                <th className="text-left py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((cr) => (
                <tr
                  key={cr.id}
                  onClick={() => openDetail(cr)}
                  className="border-b border-stone-300/50 hover:bg-stone-100/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-medium">#{cr.id}</td>
                  <td className="py-3">{cr.openingDate?.split('T')[0]}</td>
                  <td className="py-3">{fmt(cr.openingAmount)}</td>
                  <td className="py-3">{cr.closingDate?.split('T')[0] || '-'}</td>
                  <td className="py-3">{cr.closingAmount ? fmt(cr.closingAmount) : '-'}</td>
                  <td className="py-3 text-emerald-600">{fmt(cr.totalPayments)}</td>
                  <td className="py-3 text-red-500">{fmt(cr.totalExpenses)}</td>
                  <td className={`py-3 font-medium ${(cr.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmt(cr.netResult)}
                  </td>
                  <td className="py-3">{cr.expectedCashAmount ? fmt(cr.expectedCashAmount) : '-'}</td>
                  <td className={`py-3 font-medium ${(cr.cashDifference || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {cr.cashDifference != null ? fmt(cr.cashDifference) : '-'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-base ${
                      cr.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-500/20 text-apple-secondary'
                    }`}>
                      {cr.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>

      {/* Modal detalle de caja */}
      {selectedRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Caja #{selectedRegister.id}</h3>
              <button onClick={() => setSelectedRegister(null)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedRegister.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-500/20 text-apple-secondary'
              }`}>
                {selectedRegister.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
              </span>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-apple-secondary">Fecha apertura</p>
                <p className="text-sm font-medium">{selectedRegister.openingDate?.replace('T', ' ').slice(0, 16)}</p>
              </div>
              <div>
                <p className="text-sm text-apple-secondary">Fecha cierre</p>
                <p className="text-sm font-medium">{selectedRegister.closingDate?.replace('T', ' ').slice(0, 16) || '—'}</p>
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-stone-100 rounded-xl p-3 text-center">
                <p className="text-xs text-apple-secondary">Apertura</p>
                <p className="font-bold text-sm text-blue-600">{fmt(selectedRegister.openingAmount)}</p>
              </div>
              <div className="bg-stone-100 rounded-xl p-3 text-center">
                <p className="text-xs text-apple-secondary">Cierre</p>
                <p className="font-bold text-sm">{selectedRegister.closingAmount ? fmt(selectedRegister.closingAmount) : '—'}</p>
              </div>
              <div className="bg-stone-100 rounded-xl p-3 text-center">
                <p className="text-xs text-apple-secondary">Esperado</p>
                <p className="font-bold text-sm">{selectedRegister.expectedCashAmount ? fmt(selectedRegister.expectedCashAmount) : '—'}</p>
              </div>
            </div>

            {/* Ingresos */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-emerald-600 mb-2">Ingresos</h4>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => {
                  const Icon = methodIcons[method]
                  const key = `total${method.charAt(0) + method.slice(1).toLowerCase()}Payments`
                  const value = selectedRegister[key] || 0
                  return (
                    <div key={method} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{methodLabels[method]}</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{fmt(value)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-2 px-3 py-2 bg-emerald-100 rounded-lg">
                <span className="text-sm font-semibold">Total ingresos</span>
                <span className="text-sm font-bold text-emerald-600">{fmt(selectedRegister.totalPayments)}</span>
              </div>
            </div>

            {/* Gastos */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-red-500 mb-2">Gastos</h4>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => {
                  const Icon = methodIcons[method]
                  const key = `total${method.charAt(0) + method.slice(1).toLowerCase()}Expenses`
                  const value = selectedRegister[key] || 0
                  return (
                    <div key={method} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{methodLabels[method]}</span>
                      </div>
                      <span className="text-sm font-semibold text-red-500">{fmt(value)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-2 px-3 py-2 bg-red-100 rounded-lg">
                <span className="text-sm font-semibold">Total gastos</span>
                <span className="text-sm font-bold text-red-500">{fmt(selectedRegister.totalExpenses)}</span>
              </div>
            </div>

            {/* Neto */}
            <div className="bg-stone-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Resultado neto</span>
                <span className={`text-xl font-bold ${(selectedRegister.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fmt(selectedRegister.netResult)}
                </span>
              </div>
              {selectedRegister.cashDifference != null && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-300">
                  <span className="text-sm text-apple-secondary">Diferencia en efectivo</span>
                  <span className={`text-sm font-semibold ${(selectedRegister.cashDifference || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmt(selectedRegister.cashDifference)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
