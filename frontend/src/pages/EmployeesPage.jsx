import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../services/employeeService'
import { BentoCard } from '../components/BentoCard'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CalendarClock,
  Search,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', documentNumber: '', email: '', phone: '', position: '' }

const DAY_LABELS = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

export default function EmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal empleado
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  // Modal horarios
  const [showSchedules, setShowSchedules] = useState(false)
  const [scheduleEmployee, setScheduleEmployee] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' })

  useEffect(() => {
    loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadEmployees = async () => {
    try {
      const { data } = await employeeService.getAll(user.companyId)
      setEmployees(data || [])
    } catch (e) {
      toast.error('Error al cargar empleados')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (emp) => {
    setEditing(emp)
    setForm({
      name: emp.name || '',
      documentNumber: emp.documentNumber || '',
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es requerido')
    if (!form.position.trim()) return toast.error('El cargo es requerido')

    const payload = {
      name: form.name.trim(),
      documentNumber: form.documentNumber.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      position: form.position.trim(),
    }
    setSaving(true)
    try {
      if (editing) {
        await employeeService.update(user.companyId, editing.id, payload)
        toast.success('Empleado actualizado')
      } else {
        await employeeService.create(user.companyId, payload)
        toast.success('Empleado creado')
      }
      setShowForm(false)
      loadEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (emp) => {
    if (!confirm(`¿Desactivar a "${emp.name}"? Podrás reactivarlo después.`)) return
    try {
      await employeeService.delete(user.companyId, emp.id)
      toast.success('Empleado desactivado')
      loadEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al desactivar')
    }
  }

  const handleActivate = async (emp) => {
    try {
      await employeeService.activate(user.companyId, emp.id)
      toast.success('Empleado reactivado')
      loadEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reactivar')
    }
  }

  // ===== Horarios =====
  const openSchedules = async (emp) => {
    setScheduleEmployee(emp)
    setSchedules([])
    setShowSchedules(true)
    try {
      const { data } = await employeeService.getSchedules(emp.id)
      setSchedules(data || [])
    } catch (e) {
      toast.error('Error al cargar horarios')
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    if (!scheduleEmployee) return
    if (scheduleForm.startTime >= scheduleForm.endTime) {
      return toast.error('La hora de inicio debe ser menor a la de fin')
    }
    try {
      await employeeService.createSchedule(scheduleEmployee.id, scheduleForm)
      toast.success('Horario agregado')
      const { data } = await employeeService.getSchedules(scheduleEmployee.id)
      setSchedules(data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar horario')
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('¿Eliminar este horario?')) return
    try {
      await employeeService.deleteSchedule(user.companyId, scheduleId)
      toast.success('Horario eliminado')
      setSchedules((s) => s.filter((x) => x.id !== scheduleId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar horario')
    }
  }

  const filtered = employees.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.documentNumber?.includes(search)
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
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-apple-secondary mt-1">
            {employees.filter((e) => e.status === 'ACTIVE').length} activos de {employees.length}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-5 h-5" />Nuevo empleado
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((emp) => (
          <BentoCard key={emp.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  emp.status === 'ACTIVE' ? 'bg-brand-500/20 text-brand-600' : 'bg-apple-hover text-apple-secondary'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{emp.name}</p>
                  <p className="text-base text-apple-secondary">{emp.position}</p>
                </div>
              </div>
              {emp.status !== 'ACTIVE' && (
                <span className="px-2 py-0.5 rounded text-base bg-apple-hover text-apple-secondary">Inactivo</span>
              )}
            </div>

            <div className="space-y-1 mb-4 text-base text-apple-secondary">
              {emp.documentNumber && <p>🪪 {emp.documentNumber}</p>}
              {emp.email && <p>✉️ {emp.email}</p>}
              {emp.phone && <p>📞 {emp.phone}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openSchedules(emp)}
                className="flex-1 px-3 py-1.5 bg-blue-500/20 text-blue-600 rounded-lg text-base font-medium hover:bg-blue-500/30 flex items-center justify-center gap-1"
              >
                <CalendarClock className="w-3 h-3" />Horarios
              </button>
              <button
                onClick={() => openEdit(emp)}
                className="px-3 py-1.5 bg-apple-hover text-apple-text rounded-lg text-base font-medium hover:bg-stone-100"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              {emp.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleDelete(emp)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(emp)}
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
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay empleados{search ? ' con esa búsqueda' : '. Crea el primero'}</p>
        </div>
      )}

      {/* Modal crear/editar empleado */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar empleado' : 'Nuevo empleado'}</h3>
              <button onClick={() => setShowForm(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre completo</label>
                  <input type="text" maxLength={150} className="input-field" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Cargo</label>
                  <input type="text" maxLength={100} className="input-field" value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Ej: Estilista" required />
                </div>
              </div>
              <div>
                <label className="label">Documento</label>
                <input type="text" maxLength={30} className="input-field" value={form.documentNumber}
                  onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input type="email" maxLength={120} className="input-field" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input type="text" maxLength={30} className="input-field" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal horarios */}
      {showSchedules && scheduleEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Horarios — {scheduleEmployee.name}</h3>
              <button onClick={() => setShowSchedules(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de horarios */}
            <div className="space-y-2 mb-4">
              {schedules.length === 0 && (
                <p className="text-apple-secondary text-base py-4 text-center">
                  Sin horarios definidos. El empleado no puede recibir citas aún.
                </p>
              )}
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-stone-100/60 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="w-5 h-5 text-brand-600" />
                    <span className="font-medium">{DAY_LABELS[s.dayOfWeek] || s.dayOfWeek}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-apple-text">{s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)}</span>
                    {s.status && s.status !== 'ACTIVE' && (
                      <span className="px-2 py-0.5 rounded text-base bg-apple-hover text-apple-secondary">{s.status}</span>
                    )}
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="px-2 py-1 bg-red-500/20 text-red-600 rounded hover:bg-red-500/40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario nuevo horario */}
            {scheduleEmployee.status === 'ACTIVE' && (
              <form onSubmit={handleAddSchedule} className="border-t border-apple-border pt-5">
                <p className="text-base font-medium mb-4">Agregar horario</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="label">Día</label>
                    <select className="input-field" value={scheduleForm.dayOfWeek}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}>
                      {Object.entries(DAY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Inicio</label>
                    <input type="time" className="input-field" value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Fin</label>
                    <input type="time" className="input-field" value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <Plus className="w-5 h-5" />Agregar horario
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
