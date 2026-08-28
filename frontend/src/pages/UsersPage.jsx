import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { companyService } from '../services/companyService'
import { Users, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  RECEPTIONIST: 'Recepcionista',
  EMPLOYEE: 'Empleado',
}

const ROLE_OPTIONS = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST', 'EMPLOYEE']

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyId: user.companyId,
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN',
  })

  useEffect(() => {
    loadUsers()
    loadCompanies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = async () => {
    try {
      if (user.role === 'SUPER_ADMIN') {
        const { data: comps } = await companyService.getAll()
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
      const { data } = await companyService.getAll()
      setCompanies(data || [])
    } catch (e) {
      // No crítico
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.companyId) return toast.error('Selecciona la empresa')
    if (!form.fullName.trim()) return toast.error('El nombre es requerido')
    if (!form.email.trim()) return toast.error('El email es requerido')
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')

    setSaving(true)
    try {
      await authService.createUser({
        companyId: parseInt(form.companyId),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      toast.success('Usuario creado')
      setShowCreate(false)
      setForm({ companyId: user.companyId, fullName: '', email: '', password: '', role: 'ADMIN' })
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario')
    } finally {
      setSaving(false)
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
          <p className="text-gray-500 mt-1">
            {users.length} {user.role === 'SUPER_ADMIN' ? 'usuarios (todas las empresas)' : 'usuarios en la empresa'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" />Crear usuario
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bento-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-600/20 text-brand-400 rounded-xl flex items-center justify-center font-bold">
                  {u.fullName?.charAt(0) || u.email?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  u.role === 'SUPER_ADMIN'
                    ? 'bg-brand-600/30 text-brand-400 font-semibold'
                    : 'bg-brand-600/20 text-brand-400'
                }`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  u.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-700/50 text-gray-500'
                }`}>
                  {u.status === 'ACTIVE' ? 'Activo' : u.status}
                </span>
              </div>
              {companyName(u.companyId) && (user.role === 'SUPER_ADMIN' || companyName(u.companyId) !== user?.companyName) && (
                <p className="text-xs text-gray-500 mt-2 truncate">Empresa: {companyName(u.companyId)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Crear usuario</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-300">
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
                <select className="input-field" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
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
