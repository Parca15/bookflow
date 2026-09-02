import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BentoStatCard, BentoCard, BentoListCard } from '../components/BentoCard'
import { reportService } from '../services/reportService'
import { cashService } from '../services/cashService'
import { appointmentService } from '../services/appointmentService'
import { clientService } from '../services/clientService'
import {
  Calendar,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  UserX,
  AlertCircle,
  CircleDollarSign,
  ArrowRightLeft,
  FileText,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_MAP = {
  SCHEDULED: { label: 'Programada', color: 'bg-blue-500/20 text-blue-600' },
  COMPLETED: { label: 'Completada', color: 'bg-emerald-500/20 text-emerald-600' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500/20 text-red-600' },
  NO_SHOW: { label: 'No asistió', color: 'bg-amber-500/20 text-amber-600' },
}

const methodIcons = {
  CASH: DollarSign,
  CARD: CreditCard,
  TRANSFER: ArrowRightLeft,
  OTHER: CircleDollarSign,
}

const methodColors = {
  CASH: 'text-emerald-600',
  CARD: 'text-blue-600',
  TRANSFER: 'text-brand-600',
  OTHER: 'text-purple-600',
}

const methodBg = {
  CASH: 'bg-emerald-500',
  CARD: 'bg-blue-500',
  TRANSFER: 'bg-brand-500',
  OTHER: 'bg-purple-500',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dailyReport, setDailyReport] = useState(null)
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [cashRegister, setCashRegister] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [monthAnchor, setMonthAnchor] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.companyId) loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.companyId) return
    try {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      const todayStr = format(today, 'yyyy-MM-dd')

      const [reportRes, cashRes, aptRes, monthlyRes, clientsRes] = await Promise.allSettled([
        reportService.getDaily(user.companyId, todayStr),
        cashService.getOpen(user.companyId),
        appointmentService.getAll(user.companyId),
        reportService.getMonthly(user.companyId, year, month),
        clientService.getAll(user.companyId),
      ])
      if (reportRes.status === 'fulfilled') setDailyReport(reportRes.value.data)
      if (cashRes.status === 'fulfilled') setCashRegister(cashRes.value.data)
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || [])
      if (monthlyRes.status === 'fulfilled') setMonthlyReport(monthlyRes.value.data)
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const clientMap = {}
  clients.forEach((c) => { clientMap[c.id] = c.fullName || c.name || `Cliente #${c.id}` })

  const aptCounts = {}
  appointments.forEach((a) => {
    if (a.appointmentDate) aptCounts[a.appointmentDate] = (aptCounts[a.appointmentDate] || 0) + 1
  })

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayAppointments = appointments
    .filter((a) => a.appointmentDate === todayStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))

  const monthStart = startOfMonth(monthAnchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const maxDayCount = Math.max(1, ...Object.values(aptCounts))

  const fmt = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0)

  const maxPayment = Math.max(
    dailyReport?.cashPayments || 0,
    dailyReport?.cardPayments || 0,
    dailyReport?.transferPayments || 0,
    dailyReport?.otherPayments || 0,
    1
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-apple-secondary mt-1">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <BentoStatCard
          icon={DollarSign}
          label="Ingresos hoy"
          value={fmt(dailyReport?.totalPayments)}
          color="green"
        />
        <BentoStatCard
          icon={Calendar}
          label="Citas hoy"
          value={dailyReport?.totalAppointments || 0}
          color="brand"
        />
        <BentoStatCard
          icon={TrendingUp}
          label="Neto hoy"
          value={fmt(dailyReport?.netResult)}
          color="blue"
        />
        <BentoStatCard
          icon={Users}
          label="Servicios vendidos"
          value={dailyReport?.totalServicesSold || dailyReport?.topServices?.length || 0}
          color="purple"
        />
      </div>

      {/* Fila principal: Citas de hoy + Métodos de pago */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Citas de hoy */}
        <BentoCard span="2col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-apple-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Agenda de hoy
            </h3>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Ver calendario →
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {todayAppointments.length === 0 && (
              <p className="text-apple-secondary text-sm text-center py-4">Sin citas programadas para hoy</p>
            )}
            {todayAppointments.map((apt) => {
              const st = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
              return (
                <div
                  key={apt.id}
                  onClick={() => navigate('/calendar')}
                  className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[48px]">
                      <p className="text-xs text-apple-secondary">{apt.startTime?.slice(0, 5)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{clientMap[apt.clientId] || `Cliente #${apt.clientId}`}</p>
                      <p className="text-xs text-apple-secondary">
                        {(apt.services || []).map((s) => s.serviceName || s.name).join(', ') || 'Sin servicios'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{fmt(apt.totalPrice)}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        {/* Métodos de pago */}
        <BentoCard>
          <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            Pagos por método
          </h3>
          <div className="space-y-3">
            {[
              { key: 'cashPayments', label: 'Efectivo', method: 'CASH' },
              { key: 'cardPayments', label: 'Tarjeta', method: 'CARD' },
              { key: 'transferPayments', label: 'Transferencia', method: 'TRANSFER' },
              { key: 'otherPayments', label: 'Otro', method: 'OTHER' },
            ].map(({ key, label, method }) => {
              const Icon = methodIcons[method]
              const value = dailyReport?.[key] || 0
              const pct = maxPayment > 0 ? (value / maxPayment) * 100 : 0
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${methodColors[method]}`} />
                      <span className="text-sm">{label}</span>
                    </div>
                    <span className="text-sm font-semibold">{fmt(value)}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className={`${methodBg[method]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>
      </div>

      {/* Fila: Caja + Gastos + Resumen mensual */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Caja */}
        <BentoCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-apple-text flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand-500" />
              Caja del día
            </h3>
            {cashRegister && (
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                cashRegister.status === 'OPEN'
                  ? 'bg-emerald-500/20 text-emerald-600'
                  : 'bg-stone-200 text-apple-secondary'
              }`}>
                {cashRegister.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
              </span>
            )}
          </div>
          {cashRegister ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Apertura</span>
                <span className="text-sm font-semibold">{fmt(cashRegister.openingAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Ingresos</span>
                <span className="text-sm font-semibold text-emerald-600">{fmt(cashRegister.totalPayments)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Gastos</span>
                <span className="text-sm font-semibold text-red-500">{fmt(cashRegister.totalExpenses)}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Neto</span>
                <span className={`text-sm font-bold ${(cashRegister.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fmt(cashRegister.netResult)}
                </span>
              </div>
              {cashRegister.status === 'OPEN' && (
                <button
                  onClick={() => navigate('/cash-register')}
                  className="w-full mt-2 text-center text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Ir a caja →
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-apple-secondary text-sm mb-2">No hay caja abierta</p>
              <button
                onClick={() => navigate('/cash-register')}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Abrir caja →
              </button>
            </div>
          )}
        </BentoCard>

        {/* Gastos del día */}
        <BentoCard>
          <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            Gastos hoy
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-apple-secondary">Efectivo</span>
              <span className="text-sm font-semibold text-red-500">{fmt(dailyReport?.cashExpenses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-apple-secondary">Tarjeta</span>
              <span className="text-sm font-semibold text-red-500">{fmt(dailyReport?.cardExpenses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-apple-secondary">Transferencia</span>
              <span className="text-sm font-semibold text-red-500">{fmt(dailyReport?.transferExpenses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-apple-secondary">Otro</span>
              <span className="text-sm font-semibold text-red-500">{fmt(dailyReport?.otherExpenses)}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Total gastos</span>
              <span className="text-sm font-bold text-red-600">{fmt(dailyReport?.totalExpenses)}</span>
            </div>
          </div>
        </BentoCard>

        {/* Resumen mensual */}
        <BentoCard>
          <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            Resumen mensual
          </h3>
          {monthlyReport ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Ingresos</span>
                <span className="text-sm font-semibold text-emerald-600">{fmt(monthlyReport.totalPayments)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-apple-secondary">Gastos</span>
                <span className="text-sm font-semibold text-red-500">{fmt(monthlyReport.totalExpenses)}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Neto</span>
                <span className={`text-sm font-bold ${(monthlyReport.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fmt(monthlyReport.netResult)}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-apple-secondary">Citas</span>
                  <span className="text-xs font-medium">{monthlyReport.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-apple-secondary">Completadas</span>
                  <span className="text-xs font-medium text-emerald-600">{monthlyReport.completedAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-apple-secondary">Canceladas</span>
                  <span className="text-xs font-medium text-red-500">{monthlyReport.cancelledAppointments}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-apple-secondary text-sm text-center py-4">Sin datos del mes</p>
          )}
        </BentoCard>
      </div>

      {/* Fila: Top servicios + Citas recientes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Top servicios */}
        <BentoCard>
          <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            Top servicios hoy
          </h3>
          <div className="space-y-2">
            {dailyReport?.topServices?.slice(0, 5).map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-400/20 text-amber-600' :
                    i === 1 ? 'bg-stone-300/30 text-stone-500' :
                    i === 2 ? 'bg-orange-400/20 text-orange-600' :
                    'bg-brand-500/10 text-brand-600'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{service.serviceName || service.name}</p>
                    <p className="text-xs text-apple-secondary">{service.timesSold || service.quantity} vendidos</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{fmt(service.totalRevenue)}</span>
              </div>
            ))}
            {(!dailyReport?.topServices || dailyReport.topServices.length === 0) && (
              <p className="text-apple-secondary text-sm text-center py-4">Sin datos hoy</p>
            )}
          </div>
        </BentoCard>

        {/* Citas recientes */}
        <BentoCard>
          <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            Últimas citas
          </h3>
          <div className="space-y-2">
            {dailyReport?.recentAppointments?.slice(0, 5).map((apt, i) => {
              const st = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-apple-secondary" />
                    <div>
                      <span className="text-sm font-medium">{apt.clientName}</span>
                      <span className="text-xs text-apple-secondary ml-2">{apt.time}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              )
            })}
            {(!dailyReport?.recentAppointments || dailyReport.recentAppointments.length === 0) && (
              <p className="text-apple-secondary text-sm text-center py-4">Sin citas recientes</p>
            )}
          </div>
        </BentoCard>
      </div>

      {/* Calendario del mes */}
      <BentoCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-apple-text">Citas del mes</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonthAnchor(subMonths(monthAnchor, 1))} className="btn-secondary px-2 py-1">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium capitalize w-40 text-center">
              {format(monthStart, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))} className="btn-secondary px-2 py-1">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="text-center text-xs text-apple-secondary font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const count = aptCounts[key] || 0
            const inMonth = isSameMonth(day, monthStart)
            const today = isToday(day)
            const intensity = count / maxDayCount
            return (
              <button
                key={key}
                onClick={() => navigate('/calendar')}
                title={count > 0 ? `${count} cita(s)` : 'Sin citas'}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                  inMonth ? 'bg-stone-100 hover:bg-brand-500/15 hover:scale-105' : 'bg-transparent opacity-30'
                } ${today ? 'ring-2 ring-brand-500 shadow-sm' : ''}`}
              >
                <span className={`text-xs ${today ? 'text-brand-600 font-bold' : inMonth ? 'text-apple-text' : 'text-apple-secondary'}`}>
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <span
                    className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white min-w-[20px]"
                    style={{ backgroundColor: `rgba(0, 136, 204, ${0.3 + intensity * 0.5})` }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </BentoCard>
    </div>
  )
}
