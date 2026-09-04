import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { catalogService } from '../services/catalogService'
import { fmt, formatNumberWithDots, parseFormattedNumber } from '../utils/format'
import { BentoCard } from '../components/BentoCard'
import Pagination from '../components/Pagination'
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Clock,
  DollarSign,
  Search,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', price: '', durationMinutes: '' }

export default function CatalogPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadItems = async (pageNum = page) => {
    try {
      const { data } = await catalogService.getPaged(user.companyId, pageNum, 20)
      setItems(data.content || [])
      setTotalPages(data.totalPages || 1)
      setPage(data.number || 0)
    } catch (e) {
      toast.error('Error al cargar catálogo')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      price: String(item.price ?? ''),
      durationMinutes: String(item.durationMinutes ?? ''),
    })
    setShowForm(true)
  }

  const handlePriceChange = (e) => {
    const raw = parseFormattedNumber(e.target.value)
    setForm({ ...form, price: raw })
  }

  const handleDurationChange = (e) => {
    const raw = parseFormattedNumber(e.target.value)
    setForm({ ...form, durationMinutes: raw })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es requerido')
    if (!form.price || parseFloat(form.price) <= 0) return toast.error('Precio inválido')
    if (!form.durationMinutes || parseInt(form.durationMinutes) <= 0) return toast.error('Duración inválida')

    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      durationMinutes: parseInt(form.durationMinutes),
    }
    setSaving(true)
    try {
      if (editing) {
        await catalogService.update(user.companyId, editing.id, payload)
        toast.success('Servicio actualizado')
      } else {
        await catalogService.create(user.companyId, payload)
        toast.success('Servicio creado')
      }
      setShowForm(false)
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`¿Desactivar "${item.name}"? Podrás reactivarlo después.`)) return
    try {
      await catalogService.delete(user.companyId, item.id)
      toast.success('Servicio desactivado')
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al desactivar')
    }
  }

  const handleActivate = async (item) => {
    try {
      await catalogService.activate(user.companyId, item.id)
      toast.success('Servicio reactivado')
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reactivar')
    }
  }

  const filtered = items.filter((i) =>
    i.name?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold">Catálogo</h1>
          <p className="text-apple-secondary mt-1">
            {items.filter((i) => i.status === 'ACTIVE').length} servicios activos de {items.length}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-5 h-5" />Nuevo servicio
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-secondary" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <BentoCard key={item.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.status === 'ACTIVE' ? 'bg-brand-500/20 text-brand-600' : 'bg-apple-hover text-apple-secondary'
                }`}>
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-base text-apple-secondary">#{item.id}</p>
                </div>
              </div>
              {item.status !== 'ACTIVE' && (
                <span className="px-2 py-0.5 rounded text-base bg-apple-hover text-apple-secondary">Inactivo</span>
              )}
            </div>

            <div className="space-y-2 mb-4 text-base">
              <div className="flex items-center gap-2 text-apple-text">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="font-bold">{fmt(item.price)}</span>
              </div>
              <div className="flex items-center gap-2 text-apple-secondary">
                <Clock className="w-5 h-5" />
                <span>{item.durationMinutes} min</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(item)}
                className="flex-1 px-3 py-1.5 bg-apple-hover text-apple-text rounded-lg text-base font-medium hover:bg-stone-100 flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3 h-3" />Editar
              </button>
              {item.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleDelete(item)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(item)}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-600 rounded-lg text-base font-medium hover:bg-emerald-500/40"
                  title="Reactivar"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </BentoCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-apple-secondary">
          <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay servicios{search ? ' con esa búsqueda' : '. Crea el primero'}</p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadItems(p)} />

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar servicio' : 'Nuevo servicio'}</h3>
              <button onClick={() => setShowForm(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre del servicio</label>
                <input
                  type="text"
                  maxLength={150}
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Corte clásico"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Precio (COP)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-field"
                    value={formatNumberWithDots(form.price)}
                    onChange={handlePriceChange}
                    placeholder="30.000"
                    required
                  />
                </div>
                <div>
                  <label className="label">Duración (min)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-field"
                    value={formatNumberWithDots(form.durationMinutes)}
                    onChange={handleDurationChange}
                    placeholder="45"
                    required
                  />
                </div>
              </div>
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
