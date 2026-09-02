import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { roleService } from '../services/roleService'
import { BentoCard } from '../components/BentoCard'
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Lock,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const MODULE_LABELS = {
  DASHBOARD: 'Dashboard',
  CALENDAR: 'Calendario',
  EXPENSES: 'Gastos',
  CASH_REGISTER: 'Caja',
  CLIENTS: 'Clientes',
  CATALOG: 'Catálogo',
  EMPLOYEES: 'Empleados',
  PROMOTIONS: 'Promociones',
  COMPANIES: 'Empresas',
  USERS: 'Usuarios',
  REPORTS: 'Reportes',
}

const MODULE_ICONS = {
  DASHBOARD: '📊',
  CALENDAR: '📅',
  EXPENSES: '💸',
  CASH_REGISTER: '💰',
  CLIENTS: '👥',
  CATALOG: '✂️',
  EMPLOYEES: '🧑‍💼',
  PROMOTIONS: '🏷️',
  COMPANIES: '🏢',
  USERS: '🔑',
  REPORTS: '📈',
}

function getLevelColor(level) {
  if (level >= 100) return 'bg-purple-500/20 text-purple-600'
  if (level >= 80) return 'bg-blue-500/20 text-blue-600'
  if (level >= 60) return 'bg-emerald-500/20 text-emerald-600'
  if (level >= 40) return 'bg-amber-500/20 text-amber-600'
  return 'bg-stone-200 text-stone-600'
}

const EMPTY_FORM = { name: '', displayName: '', level: 50, permissions: [] }

export default function RolesPage() {
  const { user } = useAuth()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const userLevel = user?.roleLevel || 0

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const { data } = await roleService.getAll(user.companyId)
      setRoles(data || [])
    } catch (e) {
      toast.error('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (role) => {
    setEditing(role)
    setForm({
      name: role.name,
      displayName: role.displayName || role.name,
      level: role.level,
      permissions: [...(role.permissions || [])],
    })
    setShowForm(true)
  }

  const togglePermission = (module) => {
    setForm((prev) => {
      const has = prev.permissions.includes(module)
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== module)
          : [...prev.permissions, module],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es requerido')
    if (form.level >= userLevel) return toast.error('El nivel debe ser menor al tuyo')
    if (form.permissions.length === 0) return toast.error('Selecciona al menos un permiso')

    const payload = {
      name: form.name.trim(),
      displayName: form.displayName.trim() || form.name.trim(),
      level: form.level,
      permissions: form.permissions,
    }

    setSaving(true)
    try {
      if (editing) {
        await roleService.update(editing.id, payload)
        toast.success('Rol actualizado')
      } else {
        await roleService.create(user.companyId, payload)
        toast.success('Rol creado')
      }
      setShowForm(false)
      loadRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role) => {
    if (role.isSystem) return toast.error('No se pueden eliminar roles del sistema')
    if (role.userCount > 0) return toast.error('No se puede eliminar un rol con usuarios asignados')
    if (!confirm(`¿Eliminar el rol "${role.displayName || role.name}"?`)) return

    try {
      await roleService.delete(role.id)
      toast.success('Rol eliminado')
      loadRoles()
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles y permisos</h1>
          <p className="text-apple-secondary mt-1">
            {roles.length} roles · Tu nivel: {userLevel}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary" disabled={userLevel <= 20}>
          <Plus className="w-5 h-5" />Nuevo rol
        </button>
      </div>

      {/* Lista de roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <BentoCard key={role.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getLevelColor(role.level)}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{role.displayName || role.name}</p>
                  <p className="text-xs text-apple-secondary">Nivel {role.level}</p>
                </div>
              </div>
              {role.isSystem && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-stone-200 text-stone-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" />Sistema
                </span>
              )}
            </div>

            {/* Permisos */}
            <div className="mb-3">
              <p className="text-xs text-apple-secondary mb-2">Permisos ({role.permissions?.length || 0})</p>
              <div className="flex flex-wrap gap-1">
                {(role.permissions || []).slice(0, 6).map((perm) => (
                  <span key={perm} className="px-2 py-0.5 rounded text-xs bg-brand-500/10 text-brand-600">
                    {MODULE_LABELS[perm] || perm}
                  </span>
                ))}
                {(role.permissions?.length || 0) > 6 && (
                  <span className="px-2 py-0.5 rounded text-xs bg-stone-200 text-stone-600">
                    +{role.permissions.length - 6} más
                  </span>
                )}
              </div>
            </div>

            {/* Usuarios */}
            <div className="flex items-center gap-1 text-xs text-apple-secondary mb-3">
              <Users className="w-3 h-3" />
              {role.userCount || 0} usuario(s)
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(role)}
                disabled={role.isSystem && userLevel < 100}
                className="flex-1 px-3 py-1.5 bg-apple-hover text-apple-text rounded-lg text-xs font-medium hover:bg-stone-100 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Edit2 className="w-3 h-3" />Editar
              </button>
              {!role.isSystem && (
                <button
                  onClick={() => handleDelete(role)}
                  disabled={role.userCount > 0}
                  className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-xs font-medium hover:bg-red-500/40 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </BentoCard>
        ))}
      </div>

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar rol' : 'Nuevo rol'}</h3>
              <button onClick={() => setShowForm(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre (identificador)</label>
                  <input
                    type="text"
                    maxLength={50}
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                    placeholder="EJ: CAJERO"
                    required
                    disabled={!!editing}
                  />
                </div>
                <div>
                  <label className="label">Nombre para mostrar</label>
                  <input
                    type="text"
                    maxLength={100}
                    className="input-field"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Ej: Cajero"
                  />
                </div>
              </div>
              <div>
                <label className="label">Nivel jerárquico (máximo: {userLevel - 1})</label>
                <input
                  type="number"
                  min={1}
                  max={userLevel - 1}
                  className="input-field"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-apple-secondary mt-1">
                  Solo puedes crear roles con nivel menor al tuyo ({userLevel})
                </p>
              </div>

              {/* Permisos */}
              <div>
                <label className="label">Permisos del módulo</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(MODULE_LABELS).map(([key, label]) => {
                    const hasPermission = user?.permissions?.includes(key)
                    const isSelected = form.permissions.includes(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => hasPermission && togglePermission(key)}
                        disabled={!hasPermission}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          isSelected
                            ? 'bg-brand-500/20 text-brand-600 border border-brand-500/30'
                            : hasPermission
                              ? 'bg-apple-hover text-apple-secondary hover:bg-stone-100 border border-transparent'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-stone-300 shrink-0" />
                        )}
                        <span className="truncate">{MODULE_ICONS[key]} {label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-apple-secondary mt-2">
                  Solo puedes asignar permisos que tú tienes
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
