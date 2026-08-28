import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { promotionService } from '../services/promotionService'
import { catalogService } from '../services/catalogService'
import { BentoStatCard } from '../components/BentoCard'
import {
  Percent,
  Tag,
  Ticket,
  Plus,
  Edit2,
  X,
  Search,
  CheckSquare,
  Square,
} from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_LABELS = { DISCOUNT: 'Descuento', PACKAGE: 'Paquete', COUPON: 'Cupón' }
const TYPE_ICONS = { DISCOUNT: Percent, PACKAGE: Tag, COUPON: Ticket }

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

function discountText(promo) {
  return promo.discountType === 'PERCENTAGE'
    ? `-${promo.discountValue}%`
    : `-${fmt(promo.discountValue)}`
}

// local datetime para <input type="datetime-local">
function toLocalInput(iso) {
  if (!iso) return ''
  return String(iso).slice(0, 16)
}

export default function PromotionsPage() {
  const { user } = useAuth()
  const [promotions, setPromotions] = useState([])
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')
  const [codeSearch, setCodeSearch] = useState('')
  const [codeResult, setCodeResult] = useState(null)

  // Modal crear/editar
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const now = new Date()
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: '',
    code: '',
    startDate: toLocalInput(defaultStart.toISOString()),
    endDate: toLocalInput(new Date(now.getTime() + 30 * 86400000 - now.getTimezoneOffset() * 60000).toISOString()),
    minPurchase: '',
    maxUses: '',
    serviceIds: [],
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const [promoRes, catRes] = await Promise.allSettled([
        promotionService.getAll(user.companyId),
        catalogService.getAll(user.companyId),
      ])
      if (promoRes.status === 'fulfilled') setPromotions(promoRes.value.data || [])
      else toast.error('Error al cargar promociones')
      if (catRes.status === 'fulfilled') setCatalog(catRes.value.data || [])
      // eslint-disable-next-line no-empty
    } catch (e) {} finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm((f) => ({ ...f, name: '', description: '', type: 'DISCOUNT', discountValue: '', code: '', minPurchase: '', maxUses: '', serviceIds: [] }))
    setShowForm(true)
  }

  const openEdit = (promo) => {
    setEditing(promo)
    setForm({
      name: promo.name || '',
      description: promo.description || '',
      type: promo.type,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue ?? ''),
      code: promo.code || '',
      startDate: toLocalInput(promo.startDate),
      endDate: toLocalInput(promo.endDate),
      minPurchase: promo.minPurchase ? String(promo.minPurchase) : '',
      maxUses: promo.maxUses != null ? String(promo.maxUses) : '',
      serviceIds: (promo.services || []).map((s) => s.serviceId),
    })
    setShowForm(true)
  }

  const toggleService = (id) => {
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter((x) => x !== id)
        : [...f.serviceIds, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es requerido')
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) return toast.error('Valor de descuento inválido')
    if (!form.startDate || !form.endDate) return toast.error('Define la vigencia')
    if (form.startDate >= form.endDate) return toast.error('La fecha fin debe ser mayor a la inicio')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      code: form.code.trim().toUpperCase() || null,
      startDate: form.startDate,
      endDate: form.endDate,
      minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      serviceIds: form.serviceIds,
    }
    setSaving(true)
    try {
      if (editing) {
        await promotionService.update(user.companyId, editing.id, payload)
        toast.success('Promoción actualizada')
      } else {
        await promotionService.create(user.companyId, payload)
        toast.success('Promoción creada')
      }
      setShowForm(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (promo) => {
    if (!confirm(`¿Desactivar "${promo.name}"?`)) return
    try {
      await promotionService.deactivate(user.companyId, promo.id)
      toast.success('Promoción desactivada')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al desactivar')
    }
  }

  const handleCodeSearch = async (e) => {
    e.preventDefault()
    if (!codeSearch.trim()) return
    try {
      const { data } = await promotionService.getByCode(user.companyId, codeSearch.trim())
      setCodeResult(data)
    } catch (err) {
      setCodeResult(null)
      toast('No existe cupón con ese código')
    }
  }

  const filtered =
    filter === 'active'
      ? promotions.filter((p) => p.status === 'ACTIVE')
      : promotions

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
          <h1 className="text-3xl font-bold">Promociones</h1>
          <p className="text-gray-500 mt-1">
            {promotions.filter((p) => p.status === 'ACTIVE').length} activas de {promotions.length}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />Nueva promoción
        </button>
      </div>

      {/* Buscador por código de cupón */}
      <form onSubmit={handleCodeSearch} className="flex gap-2 mb-6 max-w-md">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            className="input-field pl-10 uppercase"
            placeholder="Validar cupón por código..."
            value={codeSearch}
            onChange={(e) => setCodeSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary px-4">Buscar</button>
      </form>

      {codeResult && (
        <BentoStatCard
          icon={Ticket}
          label={codeResult.name}
          value={`${discountText(codeResult)} · ${TYPE_LABELS[codeResult.type]}`}
          color={codeResult.status === 'ACTIVE' ? 'green' : 'red'}
        />
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6 mt-2">
        {[['active', 'Activas'], ['all', 'Todas']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === key ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid promociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((promo) => {
          const Icon = TYPE_ICONS[promo.type] || Tag
          const usagePct = promo.maxUses ? Math.min(100, Math.round((promo.usedCount / promo.maxUses) * 100)) : null
          return (
            <div key={promo.id} className={`bg-gray-900 rounded-2xl border p-5 transition-colors ${
              promo.status === 'ACTIVE' ? 'border-gray-800 hover:border-gray-700' : 'border-gray-800/50 opacity-60'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    promo.status === 'ACTIVE' ? 'bg-brand-600/20 text-brand-400' : 'bg-gray-800 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{promo.name}</p>
                    <p className="text-xs text-gray-500">{TYPE_LABELS[promo.type]}</p>
                  </div>
                </div>
                {promo.code && (
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-xs font-mono text-brand-300">
                    {promo.code}
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold text-emerald-400 mb-2">{discountText(promo)}</p>

              {promo.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
              )}

              <div className="space-y-1 mb-3 text-xs text-gray-500">
                <p>📅 {String(promo.startDate).slice(0, 16).replace('T', ' ')} → {String(promo.endDate).slice(0, 16).replace('T', ' ')}</p>
                {promo.minPurchase != null && promo.minPurchase > 0 && (
                  <p>🛒 Compra mínima: {fmt(promo.minPurchase)}</p>
                )}
                {usagePct != null && (
                  <div>
                    <p>🎟️ Usos: {promo.usedCount}/{promo.maxUses}</p>
                    <div className="h-1 bg-gray-800 rounded-full mt-1">
                      <div className="h-1 bg-brand-500 rounded-full" style={{ width: `${usagePct}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {promo.services?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {promo.services.map((s) => (
                    <span key={s.serviceId} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                      {s.serviceName}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => openEdit(promo)}
                  className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />Editar
                </button>
                {promo.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleDeactivate(promo)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30"
                  >
                    Desactivar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Percent className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay promociones {filter === 'active' ? 'activas' : ''}. Crea la primera</p>
        </div>
      )}

      {/* Modal crear/editar promoción */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editing ? 'Editar promoción' : 'Nueva promoción'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input type="text" maxLength={150} className="input-field" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Corte de temporada" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo</label>
                  <select className="input-field" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Tipo de descuento</label>
                  <select className="input-field" value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto fijo (COP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Valor del descuento</label>
                  <input type="number" step="0.01" min="0.01" className="input-field"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === 'PERCENTAGE' ? '20' : '10000'} required />
                </div>
                <div>
                  <label className="label">Código (opcional)</label>
                  <input type="text" maxLength={50} className="input-field uppercase font-mono"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="VERANO2026" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Inicio</label>
                  <input type="datetime-local" className="input-field" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Fin</label>
                  <input type="datetime-local" className="input-field" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Compra mínima (opcional)</label>
                  <input type="number" step="100" min="0" className="input-field"
                    value={form.minPurchase}
                    onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                    placeholder="50000" />
                </div>
                <div>
                  <label className="label">Límite de usos (opcional)</label>
                  <input type="number" min="0" className="input-field"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="100" />
                </div>
              </div>

              {/* Servicios asociados */}
              {catalog.length > 0 && (
                <div>
                  <label className="label">Servicios aplicables</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-44 overflow-y-auto border border-gray-800 rounded-xl p-3">
                    {catalog.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleService(c.id)}
                        disabled={c.status !== 'ACTIVE'}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors disabled:opacity-40 ${
                          form.serviceIds.includes(c.id)
                            ? 'bg-brand-600/20 text-brand-300'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {form.serviceIds.includes(c.id)
                          ? <CheckSquare className="w-3 h-3 shrink-0" />
                          : <Square className="w-3 h-3 shrink-0" />}
                        <span className="truncate">{c.name}</span>
                        <span className="ml-auto shrink-0">{fmt(c.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
