import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { clientService } from '../services/clientService'
import { employeeService } from '../services/employeeService'
import { catalogService } from '../services/catalogService'
import LoadingSpinner from '../components/LoadingSpinner'
import WeeklyCalendar from './WeeklyCalendar'
import AppointmentDetailModal from './AppointmentDetailModal'
import CreateAppointmentModal from './CreateAppointmentModal'
import { clientName, fmt, addMinutes, statusLabels, statusColors, START_HOUR, PX_PER_MIN, getSlot } from './appointmentsHelpers'
import { Plus, ChevronLeft, ChevronRight, RotateCcw, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

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
    clientId: '', employeeId: '', appointmentDate: todayStr, startTime: '09:00', notes: '', serviceIds: [],
  })

  const [selectedApt, setSelectedApt] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [aptRes, clientRes, empRes, catRes] = await Promise.allSettled([
        appointmentService.getAll(user.companyId), clientService.getAll(user.companyId),
        employeeService.getAll(user.companyId), catalogService.getAll(user.companyId),
      ])
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || [])
      if (empRes.status === 'fulfilled') {
        const list = empRes.value.data || []
        setEmployees(list.filter((e) => e.status === 'ACTIVE'))
        const map = {}; list.forEach((e) => { map[e.id] = e.name }); setEmployeeMap(map)
      }
      if (catRes.status === 'fulfilled') setCatalog((catRes.value.data || []).filter((c) => c.status === 'ACTIVE'))
      if (clientRes.status === 'fulfilled') {
        const list = clientRes.value.data || []; setClients(list)
        const map = {}; list.forEach((c) => { map[c.id] = clientName(c) }); setClientMap(map)
      }
    } catch (e) { toast.error('Error al cargar citas') } finally { setLoading(false) }
  }

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dateKey = (d) => format(d, 'yyyy-MM-dd')

  const byDay = {}
  appointments.forEach((apt) => {
    const key = apt.appointmentDate
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(apt)
  })

  Object.values(byDay).forEach((list) => {
    list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    const lanes = []
    list.forEach((apt) => {
      const { sh, sm, duration } = getSlot(apt)
      const start = sh * 60 + sm; const end = start + duration
      let placed = false
      for (let i = 0; i < lanes.length; i++) {
        if (start >= lanes[i]) { apt._lane = i; lanes[i] = end; placed = true; break }
      }
      if (!placed) { apt._lane = lanes.length; lanes.push(end) }
    })
    list.forEach((apt) => {
      const { sh, sm, duration } = getSlot(apt)
      const start = sh * 60 + sm; const end = start + duration
      let conc = 0
      list.forEach((o) => {
        const { sh: oh, sm: om, duration: od } = getSlot(o)
        const os = oh * 60 + om; const oe = os + od
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
    if (hour >= 21) hour = 20
    openCreate(dateKey(day), `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }

  const openCreate = (prefillDate = todayStr, prefillTime = '09:00') => {
    if (clients.length === 0) return toast.error('Primero registra un cliente')
    if (employees.length === 0) return toast.error('Primero registra un empleado con horario')
    if (catalog.length === 0) return toast.error('Primero crea servicios en el catálogo')
    setCreateForm({ clientId: '', employeeId: '', appointmentDate: prefillDate, startTime: prefillTime, notes: '', serviceIds: [] })
    setShowCreate(true)
  }

  const toggleService = (id) => {
    setCreateForm((f) => ({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id] }))
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
        clientId: parseInt(createForm.clientId), employeeId: parseInt(createForm.employeeId),
        appointmentDate: createForm.appointmentDate, startTime: createForm.startTime,
        notes: createForm.notes.trim() || null, services: createForm.serviceIds.map((id) => ({ catalogId: id })),
      })
      toast.success('Cita creada'); setShowCreate(false); loadData()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al crear la cita') } finally { setSavingCreate(false) }
  }

  const handleAction = async (id, action) => {
    try {
      const actionMap = { complete: appointmentService.complete, cancel: appointmentService.cancel }
      await actionMap[action](user.companyId, id)
      toast.success('Cita actualizada'); setSelectedApt(null); loadData()
    } catch (e) { toast.error('Error al actualizar cita') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Citas</h1>
          <p className="text-apple-secondary mt-1">
            {format(weekStart, "d 'de' MMMM", { locale: es })} – {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAnchorDate(addDays(anchorDate, -7))} className="btn-secondary px-3 py-2"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setAnchorDate(new Date())} className="btn-secondary px-3 py-2"><RotateCcw className="w-5 h-5" />Hoy</button>
          <button onClick={() => setAnchorDate(addDays(anchorDate, 7))} className="btn-secondary px-3 py-2"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => openCreate()} className="btn-primary ml-2"><Plus className="w-5 h-5" />Nueva cita</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-base">
        {Object.entries(statusLabels).map(([k, label]) => (
          <span key={k} className={`px-2 py-1 rounded-lg border ${statusColors[k]}`}>{label}</span>
        ))}
      </div>

      <WeeklyCalendar days={days} byDay={byDay} clientMap={clientMap} employeeMap={employeeMap} onSelectApt={setSelectedApt} onDayClick={handleDayClick} />

      {appointments.length === 0 && (
        <div className="text-center py-12 text-apple-secondary">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay citas. Haz clic en un horario del calendario para agendar.</p>
        </div>
      )}

      <CreateAppointmentModal isOpen={showCreate} onClose={() => setShowCreate(false)} createForm={createForm} setCreateForm={setCreateForm} clients={clients} employees={employees} catalog={catalog} selectedServices={selectedServices} totalPrice={totalPrice} totalMinutes={totalMinutes} onSave={handleCreate} saving={savingCreate} onToggleService={toggleService} />

      <AppointmentDetailModal appointment={selectedApt} clientMap={clientMap} employeeMap={employeeMap} onClose={() => setSelectedApt(null)} onAction={handleAction} />
    </div>
  )
}
