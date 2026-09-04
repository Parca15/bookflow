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
import LoadingSpinner from '../components/LoadingSpinner'
import CalendarGrid from './CalendarGrid'
import DayPanel from './DayPanel'
import CreateAppointmentModal from './CreateAppointmentModal'
import PaymentModal from './PaymentModal'
import { clientName, fmt, PAYABLE } from './calendarHelpers'
import { formatNumberWithDots, parseFormattedNumber } from '../utils/format'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'

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

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [savingCreate, setSavingCreate] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isPayFull, setIsPayFull] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const [createForm, setCreateForm] = useState({
    clientId: '', employeeId: '', appointmentDate: todayStr,
    startTime: '09:00', notes: '', serviceIds: [],
  })

  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', notes: '' })
  const [payments, setPayments] = useState([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [balance, setBalance] = useState(0)
  const [savingPayment, setSavingPayment] = useState(false)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const [paidAppointments, setPaidAppointments] = useState(new Set())

  useEffect(() => { loadData() }, [])

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
    dayApts.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1 })
    return counts
  }

  const selectedDayApts = getAppointmentsForDate(selectedDate)

  const openCreateForm = (date) => {
    if (clients.length === 0) return toast.error('Primero registra un cliente')
    if (employees.length === 0) return toast.error('Primero registra un empleado')
    if (catalog.length === 0) return toast.error('Primero crea servicios en el catálogo')
    const dateStr = format(date, 'yyyy-MM-dd')
    setCreateForm({ clientId: '', employeeId: '', appointmentDate: dateStr, startTime: '09:00', notes: '', serviceIds: [] })
    setShowCreateForm(true)
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
      toast.success('Cita creada')
      setShowCreateForm(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la cita')
    } finally { setSavingCreate(false) }
  }

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Ingresa un código de cupón'); return }
    try {
      const { data } = await promotionService.getByCode(user.companyId, couponCode.trim())
      if (data.status !== 'ACTIVE') { setCouponError('Este cupón no está activo'); setAppliedCoupon(null); return }
      const now = new Date(); const start = new Date(data.startDate); const end = new Date(data.endDate)
      if (now < start || now > end) { setCouponError('Este cupón no está vigente'); setAppliedCoupon(null); return }
      if (data.maxUses && data.usedCount >= data.maxUses) { setCouponError('Este cupón ya alcanzó su límite de usos'); setAppliedCoupon(null); return }
      setAppliedCoupon(data); setCouponError(''); toast.success(`Cupón "${data.name}" aplicado`)
    } catch (e) { setCouponError('Cupón no encontrado'); setAppliedCoupon(null) }
  }

  const removeCoupon = () => { setCouponCode(''); setAppliedCoupon(null); setCouponError('') }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    const subtotal = selectedAppointment?.totalPrice || 0
    if (appliedCoupon.discountType === 'PERCENTAGE') return subtotal * (appliedCoupon.discountValue / 100)
    return Math.min(appliedCoupon.discountValue, subtotal)
  }

  const discountAmount = calculateDiscount()
  const totalWithDiscount = Math.max(0, (selectedAppointment?.totalPrice || 0) - discountAmount)
  const balanceWithDiscount = Math.max(0, totalWithDiscount - totalPaid)

  const openPaymentModal = async (apt, payFull = false) => {
    setSelectedAppointment(apt); setIsPayFull(payFull)
    setPaymentForm({ amount: '', paymentMethod: 'CASH', notes: '' }); setShowPaymentModal(true)
    try {
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, apt.id),
        paymentService.getTotalPaid(user.companyId, apt.id),
        paymentService.getBalance(user.companyId, apt.id),
      ])
      setPayments(listRes.data || []); setTotalPaid(totalRes.data ?? 0)
      const currentBalance = balanceRes.data ?? 0; setBalance(currentBalance)
      if (currentBalance <= 0) setPaidAppointments((prev) => new Set([...prev, apt.id]))
      setPaymentForm((f) => ({ ...f, amount: payFull ? formatNumberWithDots(String(currentBalance || '')) : '' }))
    } catch (e) { toast.error('Error al cargar pagos') }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    const amountToPay = appliedCoupon ? balanceWithDiscount : parseFloat(parseFormattedNumber(paymentForm.amount))
    if (!amountToPay || amountToPay <= 0) return toast.error('Ingresa un monto válido')
    setSavingPayment(true)
    try {
      const notes = [paymentForm.notes, appliedCoupon ? `Cupón: ${appliedCoupon.code} (-${fmt(discountAmount)})` : ''].filter(Boolean).join(' | ')
      await paymentService.create(user.companyId, selectedAppointment.id, {
        amount: amountToPay, paymentMethod: paymentForm.paymentMethod, notes: notes || null,
      })
      toast.success('Pago registrado')
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, selectedAppointment.id),
        paymentService.getTotalPaid(user.companyId, selectedAppointment.id),
        paymentService.getBalance(user.companyId, selectedAppointment.id),
      ])
      setPayments(listRes.data || []); setTotalPaid(totalRes.data ?? 0); setBalance(balanceRes.data ?? 0)
      setPaymentForm({ amount: '', paymentMethod: paymentForm.paymentMethod, notes: '' }); removeCoupon()
      if ((balanceRes.data ?? 0) <= 0) setPaidAppointments((prev) => new Set([...prev, selectedAppointment.id]))
      cashService.getOpen(user.companyId).then((r) => setCashOpen(r.data)).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el pago')
    } finally { setSavingPayment(false) }
  }

  const handleStatusChange = async (apt, action) => {
    try { await action(user.companyId, apt.id); toast.success('Estado actualizado'); loadData() }
    catch (e) { toast.error('Error al actualizar estado') }
  }

  const openInvoiceModal = async (apt) => {
    setSelectedAppointment(apt); setShowInvoiceModal(true)
    if (showPaymentModal) return
    try {
      const [listRes, totalRes, balanceRes] = await Promise.all([
        paymentService.getByAppointment(user.companyId, apt.id),
        paymentService.getTotalPaid(user.companyId, apt.id),
        paymentService.getBalance(user.companyId, apt.id),
      ])
      setPayments(listRes.data || []); setTotalPaid(totalRes.data ?? 0); setBalance(balanceRes.data ?? 0)
    } catch (e) {}
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-apple-secondary mt-1">{format(currentDate, 'MMMM yyyy', { locale: es })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="btn-secondary px-3 py-2"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }} className="btn-secondary px-3 py-2">Hoy</button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn-secondary px-3 py-2"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => openCreateForm(selectedDate)} className="btn-primary ml-2"><Plus className="w-5 h-5" />Nueva cita</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <CalendarGrid calendarDays={calendarDays} currentDate={currentDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} getStatusCounts={getStatusCounts} />
        <DayPanel selectedDate={selectedDate} selectedDayApts={selectedDayApts} clientMap={clientMap} onOpenCreateForm={openCreateForm} onStatusChange={handleStatusChange} onOpenPaymentModal={openPaymentModal} onOpenInvoiceModal={openInvoiceModal} cashOpen={cashOpen} paidAppointments={paidAppointments} appointmentService={appointmentService} />
      </div>

      <CreateAppointmentModal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} createForm={createForm} setCreateForm={setCreateForm} clients={clients} employees={employees} catalog={catalog} selectedServices={selectedServices} totalPrice={totalPrice} totalMinutes={totalMinutes} onSave={handleCreate} saving={savingCreate} onToggleService={toggleService} />

      <PaymentModal isOpen={showPaymentModal} onClose={() => { setShowPaymentModal(false); removeCoupon() }} appointment={selectedAppointment} clientMap={clientMap} payments={payments} totalPaid={totalPaid} balance={balance} paymentForm={paymentForm} setPaymentForm={setPaymentForm} onPayment={handlePayment} saving={savingPayment} couponCode={couponCode} setCouponCode={setCouponCode} appliedCoupon={appliedCoupon} couponError={couponError} onValidateCoupon={handleValidateCoupon} onRemoveCoupon={removeCoupon} discountAmount={discountAmount} totalWithDiscount={totalWithDiscount} balanceWithDiscount={balanceWithDiscount} cashOpen={cashOpen} isPayFull={isPayFull} onOpenInvoice={openInvoiceModal} />

      {showInvoiceModal && selectedAppointment && (
        <InvoicePDF appointment={selectedAppointment} client={clients.find((c) => c.id === selectedAppointment.clientId)} company={company} services={selectedAppointment.services || []} payments={payments} totalPaid={totalPaid} balance={balance} onClose={() => setShowInvoiceModal(false)} />
      )}
    </div>
  )
}
