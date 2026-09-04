import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { expenseService } from '../services/expenseService'
import { cashService } from '../services/cashService'
import { fmt, methodLabels, formatNumberWithDots, parseFormattedNumber } from '../utils/format'
import { BentoStatCard } from '../components/BentoCard'
import {
  TrendingUp,
  DollarSign,
  Plus,
  Wallet,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const categoryLabels = {
  PAYROLL: 'Nómina',
  UTILITIES: 'Servicios públicos',
  RENT: 'Arriendo',
  SUPPLIES: 'Insumos',
  MAINTENANCE: 'Mantenimiento',
  TRANSPORT: 'Transporte',
  OTHER: 'Otros',
}

const PAYABLE = []  // expenses no tienen estados payable como citas

export default function ExpensesPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [cashOpen, setCashOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal de creación
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    category: 'SUPPLIES',
    paymentMethod: 'CASH',
    description: '',
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const [expRes, cashRes] = await Promise.allSettled([
        expenseService.getAll(user.companyId),
        cashService.getOpen(user.companyId),
      ])
      if (expRes.status === 'fulfilled') setExpenses(expRes.value.data || [])
      if (cashRes.status === 'fulfilled') setCashOpen(cashRes.value.data)
    } catch (e) {
      toast.error('Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }
    setSaving(true)
    try {
      await expenseService.create(user.companyId, {
        amount: parseFloat(form.amount),
        category: form.category,
        paymentMethod: form.paymentMethod,
        description: form.description || null,
      })
      toast.success('Gasto registrado')
      setShowForm(false)
      setForm({ amount: '', category: 'SUPPLIES', paymentMethod: 'CASH', description: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el gasto')
    } finally {
      setSaving(false)
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayTotal = expenses
    .filter((x) => String(x.expenseDate).startsWith(todayStr))
    .reduce((acc, x) => acc + (parseFloat(x.amount) || 0), 0)
  const cashTotal = expenses.reduce((acc, x) => acc + (x.paymentMethod === 'CASH' ? parseFloat(x.amount) || 0 : 0), 0)
  const grandTotal = expenses.reduce((acc, x) => acc + (parseFloat(x.amount) || 0), 0)

  const filtered = expenses.filter(
    (x) =>
      x.description?.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabels[x.category]?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-apple-secondary mt-1">
            {expenses.length} gastos registrados
            {cashOpen && ' · Caja abierta: puedes registrar gastos'}
            {!cashOpen && ' · ⚠️ Caja cerrada: no se pueden registrar nuevos gastos'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!cashOpen}
          className="btn-primary w-full sm:w-auto py-3 rounded-xl text-lg font-medium transition-colors"
          style={{ opacity: cashOpen ? 1 : 0.5, cursor: cashOpen ? 'pointer' : 'not-available' }}
        >
          <Plus className="w-5 h-5 mr-2" />Nuevo gasto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <BentoStatCard icon={DollarSign} label="Total histórico" value={fmt(grandTotal)} color="red" />
        <BentoStatCard icon={TrendingUp} label="Gastado hoy" value={fmt(todayTotal)} color="brand" />
        <BentoStatCard icon={Wallet} label="Salido en efectivo" value={fmt(cashTotal)} color="blue" />
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-secondary" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Buscar por descripción o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla de gastos */}
      <div className="bg-[var(--apple-card)] border border-apple-border rounded-2xl overflow-x-auto">
        <table className="w-full text-base min-w-[600px]">
          <thead>
            <tr className="text-apple-secondary border-b border-apple-border">
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Categoría</th>
              <th className="text-left py-3 px-4">Método</th>
              <th className="text-left py-3 px-4">Descripción</th>
              <th className="text-right py-3 px-4">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x) => (
              <tr key={x.id} className="border-b border-stone-300/50 hover:bg-apple-hover/40">
                <td className="py-3 px-4 text-apple-secondary">{String(x.expenseDate).replace('T', ' ').slice(0, 16)}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-brand-600 rounded text-base font-medium">
                    {categoryLabels[x.category] || x.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-apple-text">{methodLabels[x.paymentMethod]}</td>
                <td className="py-3 px-4 text-apple-secondary truncate max-w-xs">{x.description || '—'}</td>
                <td className="py-3 px-4 text-right font-bold text-red-600">-{fmt(x.amount)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-center text-apple-secondary">
                  No hay gastos {search ? 'con esa búsqueda' : 'registrados aún'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo gasto */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Registrar gasto</h3>
              <button onClick={() => setShowForm(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
<form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Monto</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      value={formatNumberWithDots(form.amount)}
                      onChange={(e) => setForm({ ...form, amount: parseFormattedNumber(e.target.value) })}
                      required
                      style={{ minHeight: '48px' }}
                      aria-label="Monto del gasto"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-apple-secondary">$</span>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-apple-secondary ml-2">{fmt(form.amount)}</span>
                  </div>
                </div>
                <div>
                  <label className="label">Método de pago</label>
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
                <label className="label">Categoría</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ minHeight: '48px' }}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Descripción</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ minHeight: '48px' }}
                  placeholder="Ej: Compra de shampoo profesional"
                />
              </div>
              <p className="text-base text-apple-secondary">
                El gasto se vinculará automáticamente a la caja abierta actual.
              </p>
              <button
                type="submit"
                disabled={saving || form.amount.trim() === '' || parseFloat(form.amount) <= 0}
                className="btn-primary w-full justify-center py-3 rounded-xl text-lg font-medium transition-colors"
                style={{ opacity: saving || form.amount.trim() === '' || parseFloat(form.amount) <= 0 ? 0.5 : 1 }}
              >
                {saving ? 'Guardando...' : 'Registrar gasto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}