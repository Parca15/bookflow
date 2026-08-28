import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BentoStatCard, BentoCard, BentoListCard } from '../components/BentoCard'
import { reportService } from '../services/reportService'
import { cashService } from '../services/cashService'
import { appointmentService } from '../services/appointmentService'
import {
  Calendar,
  Wallet,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dailyReport, setDailyReport] = useState(null)
  const [cashRegister, setCashRegister] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [monthAnchor, setMonthAnchor] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const [reportRes, cashRes, aptRes] = await Promise.allSettled([
        reportService.getDaily(user.companyId, today),
        cashService.getOpen(user.companyId),
        appointmentService.getAll(user.companyId),
      ])
      if (reportRes.status === 'fulfilled') setDailyReport(reportRes.value.data)
      if (cashRes.status === 'fulfilled') setCashRegister(cashRes.value.data)
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Conteo de citas por día (yyyy-MM-dd)
  const aptCounts = {}
  appointments.forEach((a) => {
    if (a.appointmentDate) aptCounts[a.appointmentDate] = (aptCounts[a.appointmentDate] || 0) + 1
  })

  const monthStart = startOfMonth(monthAnchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const maxDayCount = Math.max(1, ...Object.values(aptCounts))

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 gap-4 auto-rows-min">
        {/* Row 1: Stats */}
        <BentoStatCard
          icon={DollarSign}
          label="Ingresos hoy"
          value={formatCurrency(dailyReport?.totalIncome)}
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
          label="Resultado neto"
          value={formatCurrency(dailyReport?.netResult)}
          color="blue"
        />
        <BentoStatCard
          icon={Users}
          label="Servicios vendidos"
          value={dailyReport?.totalServicesSold || 0}
          color="purple"
        />

        {/* Row 2: Cash + Payments */}
        <BentoCard span="2col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Caja del día</h3>
            {cashRegister && (
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                cashRegister.status === 'OPEN' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {cashRegister.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
              </span>
            )}
          </div>
          {cashRegister ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Apertura</p>
                <p className="text-lg font-bold">{formatCurrency(cashRegister.openingAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Esperado</p>
                <p className="text-lg font-bold">{formatCurrency(cashRegister.expectedCashAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Diferencia</p>
                <p className={`text-lg font-bold ${
                  (cashRegister.cashDifference || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {formatCurrency(cashRegister.cashDifference)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay caja abierta</p>
          )}
        </BentoCard>

        <BentoCard>
          <h3 className="font-semibold mb-3">Pagos por método</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">Efectivo</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(dailyReport?.cashPayments)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Tarjeta</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(dailyReport?.cardPayments)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Transferencia</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(dailyReport?.transferPayments)}</span>
            </div>
          </div>
        </BentoCard>

        <BentoCard>
          <h3 className="font-semibold mb-3">Gastos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total gastos</span>
              <span className="text-sm font-medium text-red-400">
                {formatCurrency(dailyReport?.totalExpenses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Resultado</span>
              <span className={`text-sm font-medium ${
                (dailyReport?.netResult || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(dailyReport?.netResult)}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Row 3: Top services */}
        <BentoCard span="2col">
          <h3 className="font-semibold mb-4">Top servicios hoy</h3>
          <div className="space-y-3">
            {dailyReport?.topServices?.slice(0, 5).map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-brand-600/20 text-brand-400 rounded-lg flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm">{service.name}</span>
                </div>
                <span className="text-sm text-gray-400">{service.quantity} vendidos</span>
              </div>
            ))}
            {(!dailyReport?.topServices || dailyReport.topServices.length === 0) && (
              <p className="text-gray-500 text-sm">Sin datos hoy</p>
            )}
          </div>
        </BentoCard>

        <BentoCard span="2col">
          <h3 className="font-semibold mb-4">Citas recientes</h3>
          <div className="space-y-3">
            {dailyReport?.recentAppointments?.slice(0, 5).map((apt, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm">{apt.clientName}</span>
                    <span className="text-xs text-gray-500 ml-2">{apt.time}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  apt.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                  apt.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
            {(!dailyReport?.recentAppointments || dailyReport.recentAppointments.length === 0) && (
              <p className="text-gray-500 text-sm">Sin citas hoy</p>
            )}
          </div>
        </BentoCard>
      </div>

      {/* Calendario mensual de citas */}
      <div className="mt-6">
        <BentoCard>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <h3 className="font-semibold">Citas del mes</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))} className="btn-secondary px-3 py-1.5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium capitalize w-44 text-center">
                {format(monthStart, 'MMMM yyyy', { locale: es })}
              </span>
              <button onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))} className="btn-secondary px-3 py-1.5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cabecera de días */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="text-center text-xs text-gray-500 font-medium">{d}</div>
            ))}
          </div>

          {/* Rejilla de días */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const count = aptCounts[key] || 0
              const inMonth = isSameMonth(day, monthStart)
              const today = isToday(day)
              const intensity = count / maxDayCount
              return (
                <button
                  key={key}
                  onClick={() => navigate('/appointments')}
                  title={count > 0 ? `${count} cita(s)` : 'Sin citas'}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                    inMonth ? 'bg-gray-800/40 hover:bg-gray-800' : 'bg-gray-900/30 opacity-40'
                  } ${today ? 'ring-2 ring-brand-500' : ''}`}
                >
                  <span className={`text-sm ${today ? 'text-brand-300 font-bold' : inMonth ? 'text-gray-200' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </span>
                  {count > 0 && (
                    <span
                      className="mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: `rgba(124, 58, 237, ${0.2 + intensity * 0.6})` }}
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
    </div>
  )
}
