import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { reportService } from '../services/reportService'
import { BentoStatCard, BentoCard } from '../components/BentoCard'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

function MethodCard({ title, total, rows, accent }) {
  return (
    <BentoCard>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-medium">{fmt(val)}</span>
          </div>
        ))}
        <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Total</span>
          <span className={`text-sm font-bold ${accent}`}>{fmt(total)}</span>
        </div>
      </div>
    </BentoCard>
  )
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [view, setView] = useState('daily')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!user?.companyId) return
      setLoading(true)
      try {
        if (view === 'daily') {
          const { data } = await reportService.getDaily(user.companyId, date)
          if (!cancelled) setReport(data)
        } else {
          const { data } = await reportService.getMonthly(user.companyId, year, month)
          if (!cancelled) setReport(data)
        }
      } catch (e) {
        if (!cancelled) toast.error(e.response?.data?.message || 'Error al cargar reporte')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [view, date, year, month, user])

  const r = report
  const periodLabel = view === 'daily' ? date : `${MONTHS[month - 1]} ${year}`

  if (loading && !r) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-gray-500 mt-1">Resumen financiero de {periodLabel}</p>
        </div>
        <div className="flex gap-2">
          {[['daily', 'Diario'], ['monthly', 'Mensual']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === key ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {view === 'daily' ? (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field max-w-xs" />
        ) : (
          <>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="input-field max-w-[180px]">
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              min="2020"
              max="2100"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="input-field max-w-[120px]"
            />
          </>
        )}
      </div>

      {/* Stats: citas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BentoStatCard icon={Calendar} label="Citas" value={r?.totalAppointments ?? 0} color="brand" />
        <BentoStatCard icon={CheckCircle} label="Completadas" value={r?.completedAppointments ?? 0} color="green" />
        <BentoStatCard icon={XCircle} label="Canceladas" value={r?.cancelledAppointments ?? 0} color="red" />
        {view === 'monthly' ? (
          <BentoStatCard icon={Users} label="Clientes nuevos" value={r?.newClients ?? 0} color="purple" />
        ) : (
          <BentoStatCard icon={CheckCircle} label="No asistieron" value={r?.noShowAppointments ?? 0} color="purple" />
        )}
      </div>

      {/* Stats: financieras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <BentoStatCard icon={DollarSign} label="Ingresos" value={fmt(r?.totalPayments)} color="green" />
        <BentoStatCard icon={TrendingUp} label="Gastos" value={fmt(r?.totalExpenses)} color="red" />
        <BentoStatCard
          icon={BarChart3}
          label="Resultado neto"
          value={fmt(r?.netResult)}
          color={(r?.netResult || 0) >= 0 ? 'blue' : 'red'}
        />
      </div>

      {/* Desglose por método */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <MethodCard
          title="Pagos por método"
          total={r?.totalPayments}
          accent="text-emerald-400"
          rows={[
            ['Efectivo', r?.cashPayments],
            ['Tarjeta', r?.cardPayments],
            ['Transferencia', r?.transferPayments],
            ['Otros', r?.otherPayments],
          ]}
        />
        <MethodCard
          title="Gastos por método"
          total={r?.totalExpenses}
          accent="text-red-400"
          rows={[
            ['Efectivo', r?.cashExpenses],
            ['Tarjeta', r?.cardExpenses],
            ['Transferencia', r?.transferExpenses],
            ['Otros', r?.otherExpenses],
          ]}
        />
      </div>

      {/* Top servicios + desglose mensual */}
      <div className={`grid gap-4 ${view === 'monthly' ? 'lg:grid-cols-2' : ''}`}>
        <BentoCard>
          <h3 className="font-semibold mb-4">Top servicios más vendidos</h3>
          <div className="space-y-3">
            {(r?.topServices || []).slice(0, 5).map((s, i) => (
              <div key={s.serviceId ?? i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-brand-600/20 text-brand-400 rounded-lg flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm">{s.serviceName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{s.timesSold} vendidos</p>
                  <p className="text-xs text-gray-500">{fmt(s.totalRevenue)}</p>
                </div>
              </div>
            ))}
            {(!r?.topServices || r.topServices.length === 0) && (
              <p className="text-gray-500 text-sm">Sin servicios vendidos en este período</p>
            )}
          </div>
        </BentoCard>

        {view === 'monthly' && (
          <BentoCard>
            <h3 className="font-semibold mb-4">Desglose diario del mes</h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2">Día</th>
                    <th className="text-right py-2">Citas</th>
                    <th className="text-right py-2">Pagos</th>
                    <th className="text-right py-2">Gastos</th>
                    <th className="text-right py-2">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {(r?.dailyBreakdown || []).map((d) => (
                    <tr key={d.day} className="border-b border-gray-800/50">
                      <td className="py-2">{d.day}</td>
                      <td className="py-2 text-right">{d.appointments}</td>
                      <td className="py-2 text-right text-emerald-400">{fmt(d.payments)}</td>
                      <td className="py-2 text-right text-red-400">{fmt(d.expenses)}</td>
                      <td className={`py-2 text-right font-medium ${(d.payments || 0) - (d.expenses || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt((d.payments || 0) - (d.expenses || 0))}
                      </td>
                    </tr>
                  ))}
                  {(!r?.dailyBreakdown || r.dailyBreakdown.length === 0) && (
                    <tr><td colSpan="5" className="py-4 text-center text-gray-500">Sin actividad este mes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </BentoCard>
        )}
      </div>
    </div>
  )
}