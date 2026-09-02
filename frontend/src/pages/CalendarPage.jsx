import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { clientService } from '../services/clientService'
import { employeeService } from '../services/employeeService'
import { catalogService } from '../services/catalogService'
import { paymentService } from '../services/paymentService'
import { companyService } from '../services/companyService'
import { cashService } from '../services/cashService'
import { promotionService } from '../services/promotionService'
import InvoicePDF from '../components/InvoicePDF'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CheckSquare,
  Square,
  Clock,
  CreditCard,
  FileText,
  CalendarDays,
  DollarSign,
  CheckCircle,
  XCircle,
  UserX,
  Ticket,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isToday, isSameDay, format, addMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val || 0)
}

function clientName(c) {
  return `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Cliente #${c.id}`
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const statusColors = {
  SCHEDULED: 'bg-blue-500/20 text-blue-600 border-blue-500/40',
  COMPLETED: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40',
  CANCELLED: 'bg-red-500/20 text-red-600 border-red-500/40',
  NO_SHOW: 'bg-orange-500/20 text-orange-600 border-orange-500/40',
}

const statusLabels = {
  SCHEDULED: 'Programada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

const statusDots = {
  SCHEDULED: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-orange-400',
}

const methodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
}

const PAYABLE = ['SCHEDULED', 'COMPLETED']

export default function CalendarPage() {
  const { user } = useAuth()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])
  const [catalog, setCatalog] = useState([])
  const [company, setCompany] = useState(null)
  const [cashOpen, setCashOpen] = useState(null)
  const [loading, setLoading] = useState(true)

  const [clientMap, setClientMap] = useState({})
  const [employeeMap, setEmployeeMap] = useState({})

  // Modales
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [savingCreate, setSavingCreate] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isPayFull, setIsPayFull] = useState(false)

  // Formulario crear cita
  const todayStr = new Date().toISOString().split('T')[0]
  const [createForm, setCreateForm] = useState({
    clientId: '', employeeId: '', appointmentDate: todayStr,
    startTime: '09:00', notes: '', serviceIds: [],
  })

  // Formulario pago
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', notes: '' })
  const [payments, setPayments] = useState([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [balance, setBalance] = useState(0)
  const [savingPayment, setSavingPayment] = useState(false)

  // Cupón de descuento
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  // Tracking de citas pagadas
  const [paidAppointments, setPaidAppointments] = useState(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [aptRes, clientRes, empRes, catRes, compRes, cashRes] = await Promise.allSettled([
        appointmentService.getAll(user.companyId),
        clientService.getAll(user.companyId),
        employeeService.getAll(user.companyId),
        catalogService.getAll(user.companyId),
        companyService.getById(user.companyId),
        cashService.getOpen(user.companyId),
      ])
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || [])
      if (clientRes.status === 'fulfilled') {
        const list = clientRes.value.data || []
        setClients(list)
        const map = {}
        list.forEach((c) => { map[c.id] = clientName(c) })
        setClientMap(map)
      }
      if (empRes.status === 'fulfilled') {
        const list = empRes.value.data || []
        setEmployees(list.filter((e) => e.status === 'ACTIVE'))
        const map = {}
        list.forEach((e) => { map[e.id] = e.name })
        setEmployeeMap(map)
      }
      if (catRes.status === 'fulfilled') setCatalog((catRes.value.data || []).filter((c) => c.status === 'ACTIVE'))
      if (compRes.status === 'fulfilled') setCompany(compRes.value.data)
      if (cashRes.status === 'fulfilled') setCashOpen(cashRes.value.data)
    } catch (e) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // === Calendario ===
  const monthStart = startOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const getAppointmentsForDate = (date) => {
    const key = format(date, 'yyyy-MM-dd')
    return appointments
      .filter((a) => a.appointmentDate === key)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }

  const getStatusCounts = (date) => {
    const dayApts = getAppointmentsForDate(date)
    const counts = {}
    dayApts.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1
    })
    return counts
  }

  const selectedDayApts = getAppointmentsForDate(selectedDate)

  // === Crear cita ===
  const openCreateForm = (date) => {
    if (clients.length === 0) return toast.error('Primero registra un cliente')
    if (employees.length === 0) return toast.error('Primero registra un empleado')
    if (catalog.length === 0) return toast.error('Primero crea servicios en el catálogo')
    const dateStr = format(date, 'yyyy-MM-dd')
    setCreateForm({
      clientId: '', employeeId: '', appointmentDate: dateStr,
      startTime: '09:00', notes: '', serviceIds: [],
    })
    setShowCreateForm(true)
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
      setShowCreateForm(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la cita')
    } finally {
      setSavingCreate(false)
    }
  }

  // === Cupón ===
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón')
      return
    }
    try {
      const { data } = await promotionService.getByCode(user.companyId, couponCode.trim())
      if (data.status !== 'ACTIVE') {
        setCouponError('Este cupón no está activo')
        setAppliedCoupon(null)
        return
      }
      const now = new Date()
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      if (now < start || now > end) {
        setCouponError('Este cupón no está vigente')
        setAppliedCoupon(null)
        return
      }
      if (data.maxUses && data.usedCount >= data.maxUses) {
        setCouponError('Este cupón ya alcanzó su límite de usos')
        setAppliedCoupon(null)
        return
      }
      setAppliedCoupon(data)
      setCouponError('')
      toast.success(`Cupón "${data.name}" aplicado`)
    } catch (e) {
      setCouponError('Cupón no encontrado')
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponError('')
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    const subtotal = selectedAppointment?.totalPrice || 0
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return subtotal * (appliedCoupon.discountValue / 100)
    }
    return Math.min(appliedCoupon.discountValue, subtotal)
  }

  const discountAmount = calculateDiscount()
  const totalWithDiscount = Math.max(0, (selectedAppointment?.totalPrice || 0) - discountAmount)
  const balanceWithDiscount = Math.max(0, totalWithDiscount - totalPaid)

  // === Pago ===
  const openPaymentModal = async (apt, payFull = false) => {
    setSelectedAppointment(apt)
    setIsPayFull(payFull)
    setPaymentForm({ amount: '', paymentMethod: 'CASH', notes: '' })
    setShowPaymentModal(true)
    try {
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, apt.id),
        paymentService.getTotalPaid(user.companyId, apt.id),
        paymentService.getBalance(user.companyId, apt.id),
      ])
      setPayments(listRes.data || [])
      setTotalPaid(totalRes.data ?? 0)
      const currentBalance = balanceRes.data ?? 0
      setBalance(currentBalance)
      if (currentBalance <= 0) {
        setPaidAppointments((prev) => new Set([...prev, apt.id]))
      }
      setPaymentForm((f) => ({
        ...f,
        amount: payFull ? String(currentBalance || '') : '',
      }))
    } catch (e) {
      toast.error('Error al cargar pagos')
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    const amountToPay = appliedCoupon ? balanceWithDiscount : parseFloat(paymentForm.amount)
    if (!amountToPay || amountToPay <= 0) {
      return toast.error('Ingresa un monto válido')
    }
    setSavingPayment(true)
    try {
      const notes = [
        paymentForm.notes,
        appliedCoupon ? `Cupón: ${appliedCoupon.code} (-${fmt(discountAmount)})` : '',
      ].filter(Boolean).join(' | ')

      await paymentService.create(user.companyId, selectedAppointment.id, {
        amount: amountToPay,
        paymentMethod: paymentForm.paymentMethod,
        notes: notes || null,
      })
      toast.success('Pago registrado')
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, selectedAppointment.id),
        paymentService.getTotalPaid(user.companyId, selectedAppointment.id),
        paymentService.getBalance(user.companyId, selectedAppointment.id),
      ])
      setPayments(listRes.data || [])
      setTotalPaid(totalRes.data ?? 0)
      setBalance(balanceRes.data ?? 0)
      setPaymentForm({ amount: '', paymentMethod: paymentForm.paymentMethod, notes: '' })
      removeCoupon()
      if ((balanceRes.data ?? 0) <= 0) {
        setPaidAppointments((prev) => new Set([...prev, selectedAppointment.id]))
      }
      cashService.getOpen(user.companyId).then((r) => setCashOpen(r.data)).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el pago')
    } finally {
      setSavingPayment(false)
    }
  }

  // === Cambiar estado ===
  const handleStatusChange = async (apt, action) => {
    try {
      await action(user.companyId, apt.id)
      toast.success('Estado actualizado')
      loadData()
    } catch (e) {
      toast.error('Error al actualizar estado')
    }
  }

  // === Factura PDF ===
  const openInvoiceModal = async (apt) => {
    setSelectedAppointment(apt)
    setShowInvoiceModal(true)
    // Cargar pagos si no están cargados
    if (showPaymentModal) return
    try {
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, apt.id),
        paymentService.getTotalPaid(user.companyId, apt.id),
        paymentService.getBalance(user.companyId, apt.id),
      ])
      setPayments(listRes.data || [])
      setTotalPaid(totalRes.data ?? 0)
      setBalance(balanceRes.data ?? 0)
    } catch (e) {
      // silently fail, PDF will show without payment data
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-apple-secondary mt-1">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="btn-secondary px-3 py-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }} className="btn-secondary px-3 py-2">
            Hoy
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn-secondary px-3 py-2">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => openCreateForm(selectedDate)} className="btn-primary ml-2">
            <Plus className="w-5 h-5" />Nueva cita
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mb-4 text-base">
        {Object.entries(statusLabels).map(([k, label]) => (
          <span key={k} className={`px-2 py-1 rounded-lg border ${statusColors[k]}`}>{label}</span>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Grid del calendario */}
        <div className="flex-1">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-4">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                <div key={d} className="text-center text-base text-apple-secondary font-medium py-2">{d}</div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const inMonth = isSameMonth(day, currentDate)
                const today = isToday(day)
                const selected = isSameDay(day, selectedDate)
                const counts = getStatusCounts(day)
                const totalDay = Object.values(counts).reduce((a, b) => a + b, 0)
                const dotEntries = Object.entries(counts).slice(0, 4)

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    className={`relative rounded-xl flex flex-col items-center justify-center p-2 min-h-[72px] transition-all duration-150 ${
                      selected
                        ? 'bg-brand-500/15 ring-2 ring-brand-500'
                        : inMonth
                          ? 'bg-stone-100 hover:bg-brand-500/10'
                          : 'bg-transparent opacity-40'
                    } ${today ? 'ring-2 ring-brand-500' : ''}`}
                  >
                    <span className={`text-base ${today ? 'text-brand-600 font-bold' : inMonth ? 'text-apple-text' : 'text-apple-secondary'}`}>
                      {format(day, 'd')}
                    </span>
                    {totalDay > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dotEntries.map(([status, count]) => (
                          <span
                            key={status}
                            className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`}
                            title={`${count} ${statusLabels[status]}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral - Citas del día */}
        <div className="w-80 shrink-0">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-base font-semibold capitalize">
                  {format(selectedDate, 'EEEE', { locale: es })}
                </p>
                <p className="text-sm text-apple-secondary">
                  {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              <CalendarDays className="w-5 h-5 text-brand-600" />
            </div>

            {selectedDayApts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 text-apple-secondary opacity-40" />
                <p className="text-sm text-apple-secondary">No hay citas este día</p>
                <button
                  onClick={() => openCreateForm(selectedDate)}
                  className="btn-primary mt-3 text-sm px-4 py-2"
                >
                  <Plus className="w-4 h-4" />Nueva cita
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-apple-secondary mb-3">
                  {selectedDayApts.length} cita{selectedDayApts.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {selectedDayApts.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-stone-100 rounded-xl p-3 hover:bg-stone-200/60 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-apple-secondary" />
                          <span className="text-sm font-medium">{apt.startTime?.slice(0, 5)}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[apt.status]}`}>
                          {statusLabels[apt.status]}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">
                        {clientMap[apt.clientId] || `Cliente #${apt.clientId}`}
                      </p>
                      {apt.services && apt.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apt.services.map((s, i) => (
                            <span key={i} className="text-xs text-apple-secondary bg-white/60 px-1.5 py-0.5 rounded">
                              {s.catalogName}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm font-semibold text-emerald-600 mt-1">{fmt(apt.totalPrice)}</p>
                      {apt.status === 'SCHEDULED' && (
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleStatusChange(apt, appointmentService.complete)}
                            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />Completar
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt, appointmentService.noShow)}
                            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 transition-colors"
                          >
                            <UserX className="w-3 h-3" />No asistió
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt, appointmentService.cancel)}
                            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-3 h-3" />Cancelar
                          </button>
                        </div>
                      )}
                      {apt.status !== 'SCHEDULED' && (
                        <div className="flex gap-1 mt-2">
                          {PAYABLE.includes(apt.status) && (apt.totalPrice || 0) > 0 && (
                            <>
                              <button
                                onClick={() => openPaymentModal(apt, true)}
                                disabled={!cashOpen || paidAppointments.has(apt.id)}
                                className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  !cashOpen || paidAppointments.has(apt.id)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30'
                                }`}
                              >
                                <DollarSign className="w-3 h-3" />Pagar
                              </button>
                              <button
                                onClick={() => openPaymentModal(apt, false)}
                                disabled={!cashOpen || paidAppointments.has(apt.id)}
                                className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  !cashOpen || paidAppointments.has(apt.id)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />Abonar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openInvoiceModal(apt)}
                            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-apple-hover text-apple-secondary hover:bg-stone-200 transition-colors"
                          >
                            <FileText className="w-3 h-3" />Factura
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openCreateForm(selectedDate)}
                  className="btn-primary w-full mt-3 justify-center text-sm py-2"
                >
                  <Plus className="w-4 h-4" />Nueva cita
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal crear cita */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Nueva cita — {format(new Date(createForm.appointmentDate + 'T12:00:00'), "d 'de' MMMM", { locale: es })}</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cliente</label>
                  <select
                    className="input-field"
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                    style={{ minHeight: '48px' }}
                  >
                    <option value="">Seleccionar...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{clientName(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Empleado</label>
                  <select
                    className="input-field"
                    value={createForm.employeeId}
                    onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                    style={{ minHeight: '48px' }}
                  >
                    <option value="">Seleccionar...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Fecha</label>
                  <input
                    type="date"
                    className="input-field"
                    value={createForm.appointmentDate}
                    onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                    required
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <div>
                  <label className="label">Inicio</label>
                  <input
                    type="time"
                    className="input-field"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                    required
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label className="label">Fin (estimado)</label>
                <input
                  type="time"
                  className="input-field"
                  value={totalMinutes > 0 ? addMinutes(createForm.startTime, totalMinutes) : createForm.startTime}
                  readOnly
                  style={{ minHeight: '48px', backgroundColor: 'var(--apple-surface)', cursor: 'default' }}
                />
              </div>

              <div>
                <label className="label">Servicios</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-apple-border rounded-xl p-3">
                  {catalog.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleService(c.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        createForm.serviceIds.includes(c.id)
                          ? 'bg-brand-500/20 text-brand-600'
                          : 'bg-apple-hover text-apple-secondary hover:bg-stone-100'
                      }`}
                    >
                      {createForm.serviceIds.includes(c.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                      <span className="truncate">{c.name}</span>
                      <span className="text-apple-secondary shrink-0">{c.durationMinutes}min</span>
                      <span className="ml-auto font-medium shrink-0">{fmt(c.price)}</span>
                    </button>
                  ))}
                  {catalog.length === 0 && (
                    <p className="text-sm text-apple-secondary text-center py-2">No hay servicios en el catálogo</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Notas (opcional)</label>
                <input
                  type="text"
                  className="input-field"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  style={{ minHeight: '48px' }}
                  placeholder="Ej: cliente alérgico a ciertos productos"
                />
              </div>

              <div className="bg-stone-100/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-apple-secondary">Duración: {totalMinutes} min · Fin: {totalMinutes > 0 ? addMinutes(createForm.startTime, totalMinutes) : '—'}</p>
                  <p className="text-sm text-apple-text">{selectedServices.map((s) => s.name).join(' + ') || 'Sin servicios'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-apple-secondary">Total</p>
                  <p className="text-lg font-bold text-emerald-600">{fmt(totalPrice)}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingCreate || !createForm.clientId || !createForm.employeeId || createForm.serviceIds.length === 0}
                className="btn-primary w-full justify-center py-3 rounded-xl text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingCreate ? 'Creando...' : 'Crear cita'}
                <Plus className="w-5 h-5 ml-2" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {showPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Cita #{selectedAppointment.id} — {clientMap[selectedAppointment.clientId] || `Cliente #${selectedAppointment.clientId}`}
              </h3>
              <button onClick={() => { setShowPaymentModal(false); removeCoupon() }} className="text-apple-secondary hover:text-apple-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen */}
            <div className="bg-stone-100 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Total cita</span>
                <span className="font-bold text-sm">{fmt(selectedAppointment.totalPrice)}</span>
              </div>
              {appliedCoupon && (
                <>
                  <div className="flex items-center justify-between text-brand-600">
                    <span className="text-sm flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Cupón {appliedCoupon.code}</span>
                    <span className="text-sm font-semibold">-{fmt(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-300 pt-1">
                    <span className="text-sm font-medium text-apple-secondary">Total con descuento</span>
                    <span className="font-bold text-sm">{fmt(totalWithDiscount)}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Pagado</span>
                <span className="font-bold text-sm text-emerald-600">{fmt(totalPaid)}</span>
              </div>
              <div className={`flex items-center justify-between border-t border-stone-300 pt-1 ${(appliedCoupon ? balanceWithDiscount : balance) <= 0 ? 'bg-emerald-50 -mx-3 -mb-3 px-3 pb-3 pt-1 rounded-b-xl' : ''}`}>
                <span className="text-sm font-medium text-apple-secondary">Saldo</span>
                <span className={`font-bold text-sm ${(appliedCoupon ? balanceWithDiscount : balance) <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fmt(appliedCoupon ? balanceWithDiscount : balance)}
                </span>
              </div>
            </div>

            {/* Mensaje pagado */}
            {(appliedCoupon ? balanceWithDiscount : balance) <= 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Cita pagada completamente</span>
              </div>
            )}

            {/* Cupón de descuento */}
            {PAYABLE.includes(selectedAppointment.status) && (appliedCoupon ? balanceWithDiscount : balance) > 0 && (
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-brand-600" />
                      <div>
                        <span className="text-sm font-semibold text-brand-700">{appliedCoupon.code}</span>
                        <span className="text-xs text-brand-500 ml-2">
                          {appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : fmt(appliedCoupon.discountValue)}
                        </span>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-brand-400 hover:text-brand-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                      disabled={savingPayment}
                      style={{ minHeight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={handleValidateCoupon}
                      className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
                      disabled={savingPayment || !couponCode.trim()}
                    >
                      <Ticket className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              </div>
            )}

            {/* Formulario abono */}
            {PAYABLE.includes(selectedAppointment.status) && cashOpen && (appliedCoupon ? balanceWithDiscount : balance) > 0 && (
              <form onSubmit={handlePayment} className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">
                      {appliedCoupon ? 'Monto del descuento' : isPayFull ? 'Monto a pagar' : 'Monto del abono'}
                    </label>
                    {appliedCoupon ? (
                      <input
                        type="text"
                        className="input-field bg-stone-100"
                        value={fmt(discountAmount)}
                        readOnly
                        style={{ minHeight: '48px', cursor: 'default' }}
                      />
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={balance}
                        className="input-field"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                        style={{ minHeight: '48px' }}
                        disabled={savingPayment}
                      />
                    )}
                  </div>
                  <div>
                    <label className="label">Método</label>
                    <select
                      className="input-field"
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      style={{ minHeight: '48px' }}
                    >
                      {Object.entries(methodLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Notas (opcional)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    style={{ minHeight: '48px' }}
                    placeholder="Ej: Abono parcial"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowPaymentModal(false); removeCoupon() }} className="btn-secondary flex-1 justify-center py-3 rounded-xl">
                    Cancelar
                  </button>
                  <button type="submit" disabled={savingPayment} className="btn-primary flex-1 justify-center py-3 rounded-xl disabled:opacity-50">
                    <DollarSign className="w-4 h-4 mr-1" />{savingPayment ? 'Guardando...' : appliedCoupon ? 'Aplicar descuento' : isPayFull ? 'Pagar completo' : 'Registrar abono'}
                  </button>
                </div>
              </form>
            )}
            {PAYABLE.includes(selectedAppointment.status) && !cashOpen && balance > 0 && (
              <p className="text-sm text-yellow-600 bg-yellow-500/10 rounded-xl p-3 mb-6">
                Abre la caja para poder registrar pagos.
              </p>
            )}

            {/* Botón factura */}
            <button
              onClick={() => { setShowPaymentModal(false); removeCoupon(); openInvoiceModal(selectedAppointment) }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-apple-hover text-apple-secondary rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors mb-4"
            >
              <FileText className="w-4 h-4" />Ver factura / Descargar PDF
            </button>

            {/* Historial */}
            <h4 className="font-semibold text-sm text-apple-secondary uppercase tracking-wide mb-3">Historial de pagos</h4>
            <div className="space-y-2">
              {payments.length === 0 && (
                <p className="text-apple-secondary text-sm">Sin pagos registrados aún.</p>
              )}
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-stone-100 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{methodLabels[p.paymentMethod]}</p>
                    <p className="text-xs text-apple-secondary">
                      {String(p.paymentDate).replace('T', ' ').slice(0, 16)}{p.notes ? ` · ${p.notes}` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-600">{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal factura PDF */}
      {showInvoiceModal && selectedAppointment && (
        <InvoicePDF
          appointment={selectedAppointment}
          client={clients.find((c) => c.id === selectedAppointment.clientId)}
          company={company}
          services={selectedAppointment.services || []}
          payments={payments}
          totalPaid={totalPaid}
          balance={balance}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  )
}
