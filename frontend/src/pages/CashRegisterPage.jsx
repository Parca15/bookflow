import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cashService } from '../services/cashService'
import { BentoCard, BentoStatCard } from '../components/BentoCard'
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  Unlock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CashRegisterPage() {
  const { user } = useAuth()
  const [cashRegister, setCashRegister] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showClose, setShowClose] = useState(false)
  const [closingAmount, setClosingAmount] = useState('')

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
      console.error(e)
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

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0)

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
          <p className="text-gray-500 mt-1">
            {cashRegister ? 'Caja abierta' : 'Sin caja abierta'}
          </p>
        </div>
        <div className="flex gap-2">
          {!cashRegister ? (
            <button onClick={handleOpen} className="btn-primary">
              <Unlock className="w-4 h-4" />Abrir caja
            </button>
          ) : (
            <button onClick={() => setShowClose(true)} className="btn-primary bg-red-600 hover:bg-red-700">
              <Lock className="w-4 h-4" />Cerrar caja
            </button>
          )}
        </div>
      </div>

      {cashRegister && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <BentoStatCard icon={DollarSign} label="Apertura" value={formatCurrency(cashRegister.openingAmount)} color="blue" />
          <BentoStatCard icon={ArrowDownRight} label="Pagos" value={formatCurrency(cashRegister.totalPayments)} color="green" />
          <BentoStatCard icon={ArrowUpRight} label="Gastos" value={formatCurrency(cashRegister.totalExpenses)} color="orange" />
          <BentoStatCard icon={TrendingUp} label="Neto" value={formatCurrency(cashRegister.netResult)} color="brand" />
        </div>
      )}

      {/* Close modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Cerrar caja</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Efectivo esperado: <span className="font-bold text-white">{formatCurrency(cashRegister.expectedCashAmount)}</span>
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
                  <p className={`text-sm mt-2 ${
                    parseFloat(closingAmount) >= (cashRegister.expectedCashAmount || 0)
                      ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    Diferencia: {formatCurrency(parseFloat(closingAmount) - (cashRegister.expectedCashAmount || 0))}
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

      {/* History */}
      <BentoCard>
        <h3 className="font-semibold mb-4">Historial de cajas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-3">ID</th>
                <th className="text-left py-3">Apertura</th>
                <th className="text-left py-3">Monto apertura</th>
                <th className="text-left py-3">Cierre</th>
                <th className="text-left py-3">Monto cierre</th>
                <th className="text-left py-3">Esperado</th>
                <th className="text-left py-3">Diferencia</th>
                <th className="text-left py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((cr) => (
                <tr key={cr.id} className="border-b border-gray-800/50">
                  <td className="py-3">{cr.id}</td>
                  <td className="py-3">{cr.openingDate?.split('T')[0]}</td>
                  <td className="py-3">{formatCurrency(cr.openingAmount)}</td>
                  <td className="py-3">{cr.closingDate?.split('T')[0] || '-'}</td>
                  <td className="py-3">{cr.closingAmount ? formatCurrency(cr.closingAmount) : '-'}</td>
                  <td className="py-3">{cr.expectedCashAmount ? formatCurrency(cr.expectedCashAmount) : '-'}</td>
                  <td className={`py-3 font-medium ${
                    (cr.cashDifference || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {cr.cashDifference != null ? formatCurrency(cr.cashDifference) : '-'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      cr.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
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
    </div>
  )
}
