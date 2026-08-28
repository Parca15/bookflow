import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { companyService } from '../services/companyService'
import { BentoCard } from '../components/BentoCard'
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { businessName: '', documentNumber: '', email: '', phone: '', address: '' }

export default function CompaniesPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadItems = async () => {
    try {
      const { data } = await companyService.getAll()
      setItems(data || [])
    } catch (e) {
      toast.error('Error al cargar empresas')
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
      businessName: item.businessName || '',
      documentNumber: item.documentNumber || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.businessName.trim()) return toast.error('El nombre es requerido')

    const payload = {
      businessName: form.businessName.trim(),
      documentNumber: form.documentNumber.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) {
        await companyService.update(editing.id, payload)
        toast.success('Empresa actualizada')
      } else {
        await companyService.create(payload)
        toast.success('Empresa creada')
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
    if (!confirm(`¿Eliminar "${item.businessName}"?`)) return
    try {
      await companyService.delete(item.id)
      toast.success('Empresa eliminada')
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleActivate = async (item) => {
    try {
      await companyService.activate(item.id)
      toast.success('Empresa reactivada')
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reactivar')
    }
  }

  const filtered = items.filter((i) =>
    i.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    i.documentNumber?.includes(search)
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-gray-500 mt-1">
            {items.filter((i) => i.status === 'ACTIVE').length} activas de {items.length}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />Nueva empresa
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <BentoCard key={item.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.status === 'ACTIVE' ? 'bg-brand-600/20 text-brand-400' : 'bg-gray-800 text-gray-600'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.businessName}</p>
                  <p className="text-xs text-gray-500">#{item.id}</p>
                </div>
              </div>
              {item.status !== 'ACTIVE' && (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-700/50 text-gray-500">Inactiva</span>
              )}
            </div>

            <div className="space-y-1 mb-4 text-sm text-gray-400">
              {item.documentNumber && <p>🪪 {item.documentNumber}</p>}
              {item.email && <p>✉️ {item.email}</p>}
              {item.phone && <p>📞 {item.phone}</p>}
              {item.address && <p>📍 {item.address}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(item)}
                className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3 h-3" />Editar
              </button>
              {item.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleDelete(item)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(item)}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30"
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
        <div className="text-center py-12 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay empresas{search ? ' con esa búsqueda' : '. Crea la primera'}</p>
        </div>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editing ? 'Editar empresa' : 'Nueva empresa'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre de la empresa</label>
                <input
                  type="text"
                  maxLength={150}
                  className="input-field"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Ej: Salón Belleza"
                  required
                />
              </div>
              <div>
                <label className="label">Número de documento</label>
                <input
                  type="text"
                  maxLength={30}
                  className="input-field"
                  value={form.documentNumber}
                  onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    maxLength={120}
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="text"
                    maxLength={30}
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <input
                  type="text"
                  maxLength={250}
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
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
