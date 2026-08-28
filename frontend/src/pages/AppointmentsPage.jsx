import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { clientService } from '../services/clientService'
import { employeeService } from '../services/employeeService'
import { catalogService } from '../services/catalogService'
import { BentoCard } from '../components/BentoCard'
import {
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  UserX,
  X,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfWeek, addDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

const statusColors = {
  SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  CONFIRMED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/40',
  NO_SHOW: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
}

const statusLabels = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

const START_HOUR = 7
const END_HOUR = 21
const HOUR_HEIGHT = 56
const PX_PER_MIN = HOUR_HEIGHT / 60

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function clientName(c) {
  return `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Cliente #${c.id}`
}

// Devuelve { sh, sm, duration } en minutos para posicionar el bloque
function getSlot(apt) {
  const [sh, sm] = (apt.startTime || '09:00').slice(0, 5).split(':').map(Number)
  let duration = 60
  if (apt.endTime) {
    const [eh, em] = apt.endTime.slice(0, 5).split(':').map(Number)
    duration = eh * 60 + em - (sh * 60 + sm)
    if (duration <= 0) duration = 60
  } else if (apt.totalDurationMinutes) {
    duration = apt.totalDurationMinutes
  }
  return { sh, sm, duration }
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [clientMap, setClientMap] = useState({})
  const [employeeMap, setEmployeeMap] = useState({})
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)

  const [anchorDate, setAnchorDate] = useState(new Date())
  const [showCreate, setShowCreate] = useState(false)
  const [savingCreate, setSavingCreate] = useState(false)
  const todayStr = new Date().toISOString().split('T')[0]
  const [createForm, setCreateForm] = useState({
    clientId: '', employeeId: '', appointmentDate: todayStr,
    startTime: '09:00', notes: '', serviceIds: [],
  })

  const [selectedApt, setSelectedApt] = useState(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      const [aptRes, clientRes, empRes, catRes] = await Promise.allSettled([
        appointmentService.getAll(user.companyId),
        clientService.getAll(user.companyId),
        employeeService.getAll(user.companyId),
        catalogService.getAll(user.companyId),
      ])
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || [])
      if (empRes.status === 'fulfilled') {
        const list = empRes.value.data || []
        setEmployees(list.filter((e) => e.status === 'ACTIVE'))
        const map = {}
        list.forEach((e) => { map[e.id] = e.name })
        setEmployeeMap(map)
      }
      if (catRes.status === 'fulfilled') {
        setCatalog((catRes.value.data || []).filter((c) => c.status === 'ACTIVE'))
      }
      if (clientRes.status === 'fulfilled') {
        const list = clientRes.value.data || []
        setClients(list)
        const map = {}
        list.forEach((c) => { map[c.id] = clientName(c) })
        setClientMap(map)
      }
    } catch (e) {
      toast.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  // ===== Calendario =====
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dateKey = (d) => format(d, 'yyyy-MM-dd')

  const byDay = {}
  appointments.forEach((apt) => {
    const key = apt.appointmentDate
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(apt)
  })

  // Asignar "carriles" y concurrencia real a citas superpuestas de un mismo día
  Object.values(byDay).forEach((list) => {
    list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    const lanes = []
    list.forEach((apt) => {
      const { sh, sm, duration } = getSlot(apt)
      const start = sh * 60 + sm
      const end = start + duration
      let placed = false
      for (let i = 0; i < lanes.length; i++) {
        if (start >= lanes[i]) {
          apt._lane = i
          lanes[i] = end
          placed = true
          break
        }
      }
      if (!placed) {
        apt._lane = lanes.length
        lanes.push(end)
      }
    })
    // Concurrencia: cuántas citas se solapan realmente con esta
    list.forEach((apt) => {
      const { sh, sm, duration } = getSlot(apt)
      const start = sh * 60 + sm
      const end = start + duration
      let conc = 0
      list.forEach((o) => {
        const { sh: oh, sm: om, duration: od } = getSlot(o)
        const os = oh * 60 + om
        const oe = os + od
        if (start < oe && os < end) conc++
      })
      apt._concurrency = conc
    })
  })

  const handleDayClick = (day, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const minutesFromStart = Math.max(0, Math.floor(y / PX_PER_MIN))
    let hour = START_HOUR + Math.floor(minutesFromStart / 60)
    let minute = minutesFromStart % 60
    minute = minute < 30 ? 0 : 30
    if (hour >= END_HOUR) hour = END_HOUR - 1
    openCreate(dateKey(day), `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }

  // ===== Crear cita =====
  const openCreate = (prefillDate = todayStr, prefillTime = '09:00', prefillEmployee = '') => {
    if (clients.length === 0) return toast.error('Primero registra un cliente')
    if (employees.length === 0) return toast.error('Primero registra un empleado con horario')
    if (catalog.length === 0) return toast.error('Primero crea servicios en el catálogo')
    setCreateForm({
      clientId: '', employeeId: prefillEmployee,
      appointmentDate: prefillDate, startTime: prefillTime,
      notes: '', serviceIds: [],
    })
    setShowCreate(true)
  }

  const toggleService = (id) => {
    setCreateForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter((x) => x !== id)
        : [...f.serviceIds, id],
    }))
  }

  const selectedServices = catalog.filter((c) => createForm.serviceIds.includes(c.id))
  const totalPrice = selectedServices.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0)
  const totalMinutes = selectedServices.reduce((acc, s) => acc + (parseInt(s.durationMinutes) || 0), 0)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.clientId) return toast.error('Selecciona el cliente')
    if (!createForm.employeeId) return toast.error('Selecciona el empleado')
    if (createForm.serviceIds.length === 0) return toast.error('Selecciona al menos un servicio')

    setSavingCreate(true)
    try {
      await appointmentService.create(user.companyId, {
        clientId: parseInt(createForm.clientId),
        employeeId: parseInt(createForm.employeeId),
        appointmentDate: createForm.appointmentDate,
        startTime: createForm.startTime,
        notes: createForm.notes.trim() || null,
        services: createForm.serviceIds.map((id) => ({ catalogId: id })),
      })
      toast.success('Cita creada')
      setShowCreate(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la cita')
    } finally {
      setSavingCreate(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      await action(user.companyId, id)
      toast.success('Cita actualizada')
      setSelectedApt(null)
      loadData()
    } catch (e) {
      toast.error('Error al actualizar cita')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Citas</h1>
          <p className="text-gray-500 mt-1">
            {format(weekStart, "d 'de' MMMM", { locale: es })} – {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAnchorDate(addDays(anchorDate, -7))} className="btn-secondary px-3 py-2">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setAnchorDate(new Date())} className="btn-secondary px-3 py-2">
            <RotateCcw className="w-4 h-4" />Hoy
          </button>
          <button onClick={() => setAnchorDate(addDays(anchorDate, 7))} className="btn-secondary px-3 py-2">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => openCreate()} className="btn-primary ml-2">
            <Plus className="w-4 h-4" />Nueva cita
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {Object.entries(statusLabels).map(([k, label]) => (
          <span key={k} className={`px-2 py-1 rounded-lg border ${statusColors[k]}`}>{label}</span>
        ))}
      </div>

      {/* Calendario */}
      <div className="flex rounded-2xl border border-gray-800 overflow-hidden bg-gray-900/40">
        {/* Columna de horas */}
        <div className="w-16 shrink-0 border-r border-gray-800">
          <div className="h-12 border-b border-gray-800" />
          {hours.map((h) => (
            <div key={h} className="text-right pr-2 text-xs text-gray-500" style={{ height: HOUR_HEIGHT }}>
              <span className="-translate-y-2 inline-block">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        {/* Días */}
        <div className="grid grid-cols-7 flex-1">
          {days.map((day) => {
            const key = dateKey(day)
            const dayApts = byDay[key] || []
            return (
              <div key={key} className="border-r border-gray-800 last:border-r-0 flex flex-col">
                {/* Header día */}
                <div className={`h-12 border-b border-gray-800 flex flex-col items-center justify-center ${isToday(day) ? 'bg-brand-600/10' : ''}`}>
                  <span className="text-xs text-gray-500 capitalize">{format(day, 'EEEE', { locale: es })}</span>
                  <span className={`text-sm font-semibold ${isToday(day) ? 'text-brand-400' : ''}`}>{format(day, 'd')}</span>
                </div>

                {/* Cuerpo con huecos clicables */}
                <div
                  className="relative cursor-pointer"
                  style={{ height: totalHeight }}
                  onClick={(e) => handleDayClick(day, e)}
                >
                  {/* Líneas de hora */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                      backgroundSize: `100% ${HOUR_HEIGHT}px`,
                    }}
                  />

                  {/* Citas */}
                  {dayApts.map((apt) => {
                    const { sh, sm, duration } = getSlot(apt)
                    const top = (sh * 60 + sm - START_HOUR * 60) * PX_PER_MIN
                    const height = Math.max(24, duration * PX_PER_MIN - 2)
                    const laneW = 100 / (apt._concurrency || 1)
                    const laneLeft = (apt._lane || 0) * laneW
                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedApt(apt) }}
                        className={`absolute rounded-lg border px-2 py-1 overflow-hidden hover:brightness-125 transition ${statusColors[apt.status]}`}
                        style={{
                          top, height,
                          left: `${laneLeft + 0.5}%`,
                          width: `${laneW - 1}%`,
                        }}
                        title={`${clientMap[apt.clientId] || ''} · ${apt.startTime}`}
                      >
                        <p className="text-xs font-semibold truncate">{clientMap[apt.clientId] || `Cliente #${apt.clientId}`}</p>
                        <p className="text-[10px] truncate opacity-80">{apt.startTime} · {employeeMap[apt.employeeId] || `#${apt.employeeId}`}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay citas. Haz clic en un horario del calendario para agendar.</p>
        </div>
      )}

      {/* Modal crear cita */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Nueva cita</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cliente</label>
                  <select className="input-field" value={createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{clientName(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Empleado</label>
                  <select className="input-field" value={createForm.employeeId}
                    onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Fecha</label>
                  <input type="date" className="input-field" value={createForm.appointmentDate}
                    min={todayStr}
                    onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Inicio</label>
                  <input type="time" className="input-field" value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Fin (estimado)</label>
                  <input type="time" className="input-field opacity-60" disabled
                    value={totalMinutes > 0 ? addMinutes(createForm.startTime, totalMinutes) : createForm.startTime} />
                </div>
              </div>

              <div>
                <label className="label">Servicios ({selectedServices.length})</label>
                <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto border border-gray-800 rounded-xl p-3">
                  {catalog.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleService(c.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        createForm.serviceIds.includes(c.id)
                          ? 'bg-brand-600/20 text-brand-300'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {createForm.serviceIds.includes(c.id)
                        ? <CheckSquare className="w-3 h-3 shrink-0" />
                        : <Square className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{c.name}</span>
                      <span className="text-gray-500 shrink-0">{c.durationMinutes}min</span>
                      <span className="ml-auto font-medium shrink-0">{fmt(c.price)}</span>
                    </button>
                  ))}
                  {catalog.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No hay servicios en el catálogo</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Notas (opcional)</label>
                <input type="text" className="input-field" value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Ej: cliente alérgico a ciertos productos" />
              </div>

              <div className="bg-gray-800/60 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Duración: {totalMinutes} min · Fin estimado: {addMinutes(createForm.startTime, totalMinutes)}</p>
                  <p className="text-sm text-gray-300">{selectedServices.map((s) => s.name).join(' + ') || 'Sin servicios'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-xl font-bold text-emerald-400">{fmt(totalPrice)}</p>
                </div>
              </div>

              <button type="submit" disabled={savingCreate} className="btn-primary w-full justify-center disabled:opacity-50">
                {savingCreate ? 'Creando...' : 'Crear cita'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle de cita */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Cita #{selectedApt.id}</h3>
              <button onClick={() => setSelectedApt(null)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Cliente</span>
                <span className="text-sm font-medium">{clientMap[selectedApt.clientId] || `Cliente #${selectedApt.clientId}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Empleado</span>
                <span className="text-sm">{employeeMap[selectedApt.employeeId] || `#${selectedApt.employeeId}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Fecha y hora</span>
                <span className="text-sm">{selectedApt.appointmentDate} · {selectedApt.startTime} - {selectedApt.endTime || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[selectedApt.status]}`}>
                  {statusLabels[selectedApt.status]}
                </span>
              </div>
              {selectedApt.services && selectedApt.services.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedApt.services.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                      {s.serviceName}
                    </span>
                  ))}
                </div>
              )}
              {selectedApt.notes && (
                <p className="text-sm text-gray-400 italic">"{selectedApt.notes}"</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedApt.status === 'SCHEDULED' && (
                <button onClick={() => handleAction(selectedApt.id, appointmentService.confirm)}
                  className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/30">
                  <CheckCircle className="w-3 h-3 inline mr-1" />Confirmar
                </button>
              )}
              {selectedApt.status === 'CONFIRMED' && (
                <button onClick={() => handleAction(selectedApt.id, appointmentService.start)}
                  className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30">
                  <PlayCircle className="w-3 h-3 inline mr-1" />Iniciar
                </button>
              )}
              {selectedApt.status === 'IN_PROGRESS' && (
                <button onClick={() => handleAction(selectedApt.id, appointmentService.complete)}
                  className="flex-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                  <CheckCircle className="w-3 h-3 inline mr-1" />Completar
                </button>
              )}
              {['SCHEDULED', 'CONFIRMED'].includes(selectedApt.status) && (
                <>
                  <button onClick={() => handleAction(selectedApt.id, appointmentService.cancel)}
                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30">
                    <XCircle className="w-3 h-3 inline mr-1" />Cancelar
                  </button>
                  <button onClick={() => handleAction(selectedApt.id, appointmentService.noShow)}
                    className="flex-1 px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/30">
                    <UserX className="w-3 h-3 inline mr-1" />No asistió
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
