import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { clientService } from '../services/clientService'
import { BentoCard } from '../components/BentoCard'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { Users, Plus, Edit2, Trash2, RotateCcw, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  firstName: '', lastName: '', documentType: 'CC', documentNumber: '',
  email: '', phone: '', address: '',
}

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, danger: false })

  useEffect(() => { loadClients() }, [])

  const loadClients = async (pageNum = page) => {
    try {
      const { data } = await clientService.getPaged(user.companyId, pageNum, 20)
      setClients(data.content || [])
      setTotalPages(data.totalPages || 1)
      setPage(data.number || 0)
    } catch (e) {
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingClient(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (client) => {
    setEditingClient(client)
    setForm({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      documentType: client.documentType || 'CC',
      documentNumber: client.documentNumber || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName.trim()) return toast.error('El nombre es requerido')
    if (!form.lastName.trim()) return toast.error('El apellido es requerido')

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      documentType: form.documentType.trim() || null,
      documentNumber: form.documentNumber.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    }
    setSaving(true)
    try {
      if (editingClient) {
        await clientService.update(user.companyId, editingClient.id, payload)
        toast.success('Cliente actualizado')
      } else {
        await clientService.create(user.companyId, payload)
        toast.success('Cliente creado')
      }
      setShowForm(false)
      setEditingClient(null)
      loadClients()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client) => {
    setConfirmState({
      isOpen: true,
      title: 'Desactivar cliente',
      message: `¿Desactivar a "${client.firstName} ${client.lastName}"? Podrás reactivarlo después.`,
      danger: false,
      onConfirm: async () => {
        try {
          await clientService.delete(user.companyId, client.id)
          toast.success('Cliente desactivado')
          loadClients()
        } catch (e) {
          toast.error('Error al desactivar')
        }
      },
    })
  }

  const handleDeletePermanent = async (client) => {
    setConfirmState({
      isOpen: true,
      title: 'Eliminar permanentemente',
      message: `¿ELIMINAR PERMANENTEMENTE a "${client.firstName} ${client.lastName}"?\n\nSe eliminarán también todas sus citas, pagos e facturas asociadas.\n\nEsta acción NO se puede deshacer.`,
      danger: true,
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          await clientService.deletePermanent(user.companyId, client.id)
          toast.success('Cliente eliminado permanentemente')
          loadClients()
        } catch (e) {
          toast.error(e.response?.data?.message || 'Error al eliminar')
        }
      },
    })
  }

  const handleActivate = async (client) => {
    try {
      await clientService.activate(user.companyId, client.id)
      toast.success('Cliente reactivado')
      loadClients()
    } catch (e) {
      toast.error('Error al reactivar')
    }
  }

  const fullName = (c) => `${c.firstName || ''} ${c.lastName || ''}`.trim()

  const filtered = clients.filter((c) =>
    fullName(c).toLowerCase().includes(search.toLowerCase()) ||
    c.documentNumber?.includes(search)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-apple-secondary mt-0.5 text-base">
            {clients.filter((c) => c.status === 'ACTIVE').length} activos de {clients.length}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-5 h-5" />Nuevo cliente
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-secondary" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <BentoCard key={client.id}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  client.status === 'ACTIVE' ? 'bg-brand-500/20 text-brand-600' : 'bg-apple-hover text-apple-secondary'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-apple-text">{fullName(client)}</p>
                  <p className="text-base text-apple-secondary">{client.documentNumber || 'Sin documento'}</p>
                </div>
              </div>
              {client.status !== 'ACTIVE' && (
                <span className="px-2 py-0.5 rounded text-base bg-apple-hover text-apple-secondary">Inactivo</span>
              )}
            </div>

            <div className="space-y-0.5 text-base text-apple-secondary mb-4">
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
              {client.address && <p>{client.address}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(client)}
                className="flex-1 px-3 py-1.5 bg-apple-hover text-apple-text rounded-lg text-base font-medium hover:bg-stone-100 flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3 h-3" />Editar
              </button>
              {client.status === 'ACTIVE' ? (
                <>
                  <button
                    onClick={() => handleDelete(client)}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-600 rounded-lg text-base font-medium hover:bg-amber-500/40"
                    title="Desactivar"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                    <button
                      onClick={() => handleDeletePermanent(client)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleActivate(client)}
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
        <div className="text-center py-10 text-apple-secondary">
          <Users className="w-10 h-10 mx-auto mb-4 opacity-50" />
          <p>No hay clientes{search ? ' con esa búsqueda' : ''}</p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadClients(p)} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: 'rgba(30,30,46,0.06)' }}>
          <div className="absolute inset-0" onClick={() => { setShowForm(false); setEditingClient(null) }} />
          <div className="relative material-modal p-3 w-full max-w-md shadow-apple-lg max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-apple-text text-lg">{editingClient ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button onClick={() => { setShowForm(false); setEditingClient(null) }} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre</label>
                  <input className="input-field" value={form.firstName} maxLength={100}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input className="input-field" value={form.lastName} maxLength={100}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo doc.</label>
                  <select className="input-field" value={form.documentType}
                    onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="label">Documento</label>
                  <input className="input-field" value={form.documentNumber} maxLength={30}
                    onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" value={form.email} maxLength={120}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input-field" value={form.phone} maxLength={30}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">Dirección</label>
                  <input className="input-field" value={form.address} maxLength={250}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-2.5 disabled:opacity-50">
                {saving ? 'Guardando...' : editingClient ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
        confirmText={confirmState.confirmText}
      />
    </div>
  )
}