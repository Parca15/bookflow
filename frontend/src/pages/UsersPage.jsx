import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { companyService } from '../services/companyService'
import { roleService } from '../services/roleService'
import { Users, X, Plus, Trash2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyId: user.companyId,
    fullName: '',
    email: '',
    password: '',
    roleId: '',
  })

  useEffect(() => {
    loadUsers()
    loadCompanies()
    loadRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = async () => {
    try {
      if (user.role === 'SUPER_ADMIN') {
        const { data: comps } = await companyService.getAllIncludingInactive()
        const lists = await Promise.all(
          (comps || []).map((c) =>
            authService.getUsersByCompany(c.id)
              .then((r) => r.data || [])
              .catch(() => [])
          )
        )
        setUsers(lists.flat())
      } else {
        const { data } = await authService.getUsersByCompany(user.companyId)
        setUsers(data || [])
      }
    } catch (e) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const { data } = await companyService.getAllIncludingInactive()
      setCompanies(data || [])
    } catch (e) {
      // No crítico
    }
  }

  const loadRoles = async () => {
    try {
      const { data } = await roleService.getAll(user.companyId)
      setRoles(data || [])
      if (data && data.length > 0 && !form.roleId) {
        setForm((prev) => ({ ...prev, roleId: data[0].id }))
      }
    } catch (e) {
      toast.error('Error al cargar roles')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.companyId) return toast.error('Selecciona la empresa')
    if (!form.fullName.trim()) return toast.error('El nombre es requerido')
    if (!form.email.trim()) return toast.error('El email es requerido')
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    if (!form.roleId) return toast.error('Selecciona un rol')

    setSaving(true)
    try {
      await authService.createUser({
        companyId: parseInt(form.companyId),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: parseInt(form.roleId),
      })
      toast.success('Usuario creado')
      setShowCreate(false)
      setForm({ companyId: user.companyId, fullName: '', email: '', password: '', roleId: '' })
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (u) => {
    if (!confirm(`¿Desactivar a "${u.fullName}"? No podrá iniciar sesión.`)) return
    try {
      await authService.deactivate(u.id)
      toast.success('Usuario desactivado')
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al desactivar')
    }
  }

  const handleActivate = async (u) => {
    try {
      await authService.activate(u.id)
      toast.success('Usuario reactivado')
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reactivar')
    }
  }

  const handleDelete = async (u) => {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE a "${u.fullName}"? Esta acción no se puede deshacer.`)) return
    try {
      await authService.delete(u.id)
      toast.success('Usuario eliminado permanentemente')
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const companyName = (id) => companies.find((c) => c.id === id)?.businessName

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-apple-secondary mt-1">
            {users.length} {user.role === 'SUPER_ADMIN' ? 'usuarios (todas las empresas)' : 'usuarios en la empresa'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-5 h-5" />Crear usuario
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-apple-secondary">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => (
            <div key={u.id} className="bento-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-500/20 text-brand-600 rounded-xl flex items-center justify-center font-bold">
                  {u.fullName?.charAt(0) || u.email?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{u.fullName}</p>
                  <p className="text-base text-apple-secondary truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-base ${
                  u.roleLevel >= 100
                    ? 'bg-brand-600/30 text-brand-600 font-semibold'
                    : 'bg-brand-500/20 text-brand-600'
                }`}>
                  {u.role}
                </span>
                <span className={`px-2 py-0.5 rounded text-base ${
                  u.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : 'bg-apple-hover text-apple-secondary'
                }`}>
                  {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {companyName(u.companyId) && (user.role === 'SUPER_ADMIN' || companyName(u.companyId) !== user?.companyName) && (
                <p className="text-base text-apple-secondary mb-3 truncate">Empresa: {companyName(u.companyId)}</p>
              )}
              <div className="flex gap-2">
                {u.id !== user.userId && (
                  <>
                    {u.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleDeactivate(u)}
                        className="flex-1 px-3 py-1.5 bg-amber-500/20 text-amber-600 rounded-lg text-base font-medium hover:bg-amber-500/40 flex items-center justify-center gap-1"
                        title="Desactivar"
                      >
                        <RotateCcw className="w-3 h-3" />Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(u)}
                        className="flex-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-600 rounded-lg text-base font-medium hover:bg-emerald-500/40 flex items-center justify-center gap-1"
                        title="Reactivar"
                      >
                        <RotateCcw className="w-3 h-3" />Reactivar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
                {u.id === user.userId && (
                  <span className="flex-1 px-3 py-1.5 bg-brand-500/10 text-brand-600 rounded-lg text-base font-medium text-center">
                    Tú
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Crear usuario</h3>
              <button onClick={() => setShowCreate(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Empresa</label>
                <select className="input-field" value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Nombre completo</label>
                <input className="input-field" value={form.fullName} maxLength={150}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={form.email} maxLength={120}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Contraseña</label>
                <input type="password" className="input-field" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <label className="label">Rol</label>
                <select className="input-field" value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                  <option value="">Seleccionar rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.displayName || r.name} (Nivel {r.level})</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
