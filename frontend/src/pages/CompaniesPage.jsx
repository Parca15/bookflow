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

const DOC_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'RUT', label: 'RUT' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
]

const DOC_TYPE_MAP = {}
DOC_TYPES.forEach((d) => { DOC_TYPE_MAP[d.value] = d.label })

const EMPTY_FORM = { businessName: '', documentType: 'NIT', documentNumber: '', email: '', phone: '', address: '' }

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
      documentType: item.documentType || 'NIT',
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
      documentType: form.documentType,
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
    if (!confirm(`¿Desactivar "${item.businessName}"? Podrás reactivarla después.`)) return
    try {
      await companyService.delete(item.id)
      toast.success('Empresa desactivada')
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al desactivar')
    }
  }

  const handleDeletePermanent = async (item) => {
    if (!confirm(`⚠️ ¿ELIMINAR PERMANENTEMENTE "${item.businessName}"?\n\nEsta acción eliminará TODOS los datos de la empresa:\n- Usuarios\n- Clientes\n- Citas\n- Pagos\n- Gastos\n- Catálogo\n- Empleados\n- Roles\n\nEsta acción NO se puede deshacer.`)) return
    if (!confirm('¿Estás ABSOLUTAMENTE seguro? Escribe "ELIMINAR" mentalmente y confirma.')) return
    try {
      await companyService.deletePermanent(item.id)
      toast.success('Empresa eliminada permanentemente')
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-apple-secondary mt-1">
            {items.filter((i) => i.status === 'ACTIVE').length} activas de {items.length}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-5 h-5" />Nueva empresa
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-secondary" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Buscar empresa..."
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
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.businessName}</p>
                  <p className="text-base text-apple-secondary">#{item.id}</p>
                </div>
              </div>
              {item.status !== 'ACTIVE' && (
                <span className="px-2 py-0.5 rounded text-base bg-apple-hover text-apple-secondary">Inactiva</span>
              )}
            </div>

            <div className="space-y-1 mb-4 text-base text-apple-secondary">
              {item.documentNumber && <p>🪪 {DOC_TYPE_MAP[item.documentType] || item.documentType}: {item.documentNumber}</p>}
              {item.email && <p>✉️ {item.email}</p>}
              {item.phone && <p>📞 {item.phone}</p>}
              {item.address && <p>📍 {item.address}</p>}
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
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-600 rounded-lg text-base font-medium hover:bg-amber-500/40"
                  title="Desactivar"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleActivate(item)}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-600 rounded-lg text-base font-medium hover:bg-emerald-500/40"
                    title="Reactivar"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  {user.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => handleDeletePermanent(item)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          </BentoCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-apple-secondary">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay empresas{search ? ' con esa búsqueda' : '. Crea la primera'}</p>
        </div>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar empresa' : 'Nueva empresa'}</h3>
              <button onClick={() => setShowForm(false)} className="text-apple-secondary hover:text-apple-text">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo de documento</label>
                  <select
                    className="input-field"
                    value={form.documentType}
                    onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                  >
                    {DOC_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Número de documento</label>
                  <input
                    type="text"
                    maxLength={30}
                    className="input-field"
                    value={form.documentNumber}
                    onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    placeholder={form.documentType === 'NIT' ? 'Ej: 900123456' : 'Ej: 1234567890'}
                  />
                </div>
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
