import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { reportService } from '../services/reportService'
import { companyService } from '../services/companyService'
import { fmt } from '../utils/format'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle,
  XCircle,
  Users,
  Download,
  FileText,
  CreditCard,
  ArrowRightLeft,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import html2pdf from 'html2pdf.js'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const methodIcons = {
  cashPayments: DollarSign,
  cardPayments: CreditCard,
  transferPayments: ArrowRightLeft,
  otherPayments: CircleDollarSign,
}

const methodColors = {
  cashPayments: 'text-emerald-600',
  cardPayments: 'text-blue-600',
  transferPayments: 'text-brand-600',
  otherPayments: 'text-purple-600',
}

const methodBg = {
  cashPayments: 'bg-emerald-500',
  cardPayments: 'bg-blue-500',
  transferPayments: 'bg-brand-500',
  otherPayments: 'bg-purple-500',
}

const methodLabels = {
  cashPayments: 'Efectivo',
  cardPayments: 'Tarjeta',
  transferPayments: 'Transferencia',
  otherPayments: 'Otro',
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [view, setView] = useState('daily')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [report, setReport] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    loadCompany()
  }, [])

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

  const loadCompany = async () => {
    try {
      const { data } = await companyService.getById(user.companyId)
      setCompany(data)
    } catch (e) {
      // Silently fail - company data is not critical for reports
    }
  }

  const r = report
  const periodLabel = view === 'daily'
    ? new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : `${MONTHS[month - 1]} ${year}`

  const maxPayment = Math.max(
    r?.cashPayments || 0,
    r?.cardPayments || 0,
    r?.transferPayments || 0,
    r?.otherPayments || 0,
    1
  )

  const maxExpense = Math.max(
    r?.cashExpenses || 0,
    r?.cardExpenses || 0,
    r?.transferExpenses || 0,
    r?.otherExpenses || 0,
    1
  )

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return
    setDownloading(true)
    try {
      const filename = `reporte-${view === 'daily' ? date : `${year}-${String(month).padStart(2, '0')}`}.pdf`
      const opt = {
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }
      await html2pdf().set(opt).from(reportRef.current).save()
      toast.success('PDF descargado')
    } catch (e) {
      toast.error('Error al generar PDF')
    } finally {
      setDownloading(false)
    }
  }

  if (loading && !r) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-apple-secondary mt-1">{periodLabel}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading || !r}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generando...' : 'Descargar PDF'}
          </button>
          {[['daily', 'Diario'], ['monthly', 'Mensual']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === key ? 'bg-brand-600 text-white' : 'bg-apple-hover text-apple-secondary hover:bg-stone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        {view === 'daily' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const d = new Date(date + 'T12:00:00')
                d.setDate(d.getDate() - 1)
                setDate(d.toISOString().split('T')[0])
              }}
              className="btn-secondary px-2 py-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field max-w-xs"
            />
            <button
              onClick={() => {
                const d = new Date(date + 'T12:00:00')
                d.setDate(d.getDate() + 1)
                setDate(d.toISOString().split('T')[0])
              }}
              className="btn-secondary px-2 py-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (month === 1) { setMonth(12); setYear(year - 1) }
                else { setMonth(month - 1) }
              }}
              className="btn-secondary px-2 py-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
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
            <button
              onClick={() => {
                if (month === 12) { setMonth(1); setYear(year + 1) }
                else { setMonth(month + 1) }
              }}
              className="btn-secondary px-2 py-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contenido del reporte (se renderiza en el PDF) */}
      <div ref={reportRef} className="bg-white p-6 rounded-2xl">
        {/* Encabezado del PDF */}
        <div className="text-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold">{company?.name || 'BookFlow'}</h2>
          <p className="text-sm text-gray-500">{company?.address || ''} {company?.phone ? `· Tel: ${company.phone}` : ''}</p>
          <p className="text-lg font-semibold mt-2">Reporte {view === 'daily' ? 'Diario' : 'Mensual'}</p>
          <p className="text-sm text-gray-600">{periodLabel}</p>
        </div>

        {/* Stats de citas */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto text-brand-500 mb-1" />
            <p className="text-2xl font-bold">{r?.totalAppointments ?? 0}</p>
            <p className="text-xs text-gray-500">Citas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{r?.completedAppointments ?? 0}</p>
            <p className="text-xs text-gray-500">Completadas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <XCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-600">{r?.cancelledAppointments ?? 0}</p>
            <p className="text-xs text-gray-500">Canceladas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            {view === 'monthly' ? (
              <>
                <Users className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-2xl font-bold text-purple-600">{r?.newClients ?? 0}</p>
                <p className="text-xs text-gray-500">Clientes nuevos</p>
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p className="text-2xl font-bold text-amber-600">{r?.noShowAppointments ?? 0}</p>
                <p className="text-xs text-gray-500">No asistieron</p>
              </>
            )}
          </div>
        </div>

        {/* Stats financieros */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{fmt(r?.totalPayments)}</p>
            <p className="text-sm text-gray-600">Ingresos totales</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <TrendingDown className="w-6 h-6 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-600">{fmt(r?.totalExpenses)}</p>
            <p className="text-sm text-gray-600">Gastos totales</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${(r?.netResult || 0) >= 0 ? 'bg-brand-50' : 'bg-red-50'}`}>
            <BarChart3 className={`w-6 h-6 mx-auto mb-1 ${(r?.netResult || 0) >= 0 ? 'text-brand-600' : 'text-red-600'}`} />
            <p className={`text-2xl font-bold ${(r?.netResult || 0) >= 0 ? 'text-brand-600' : 'text-red-600'}`}>{fmt(r?.netResult)}</p>
            <p className="text-sm text-gray-600">Resultado neto</p>
          </div>
        </div>

        {/* Desglose por método - Pagos */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Ingresos por método de pago
          </h3>
          <div className="space-y-2">
            {['cashPayments', 'cardPayments', 'transferPayments', 'otherPayments'].map((key) => {
              const Icon = methodIcons[key]
              const value = r?.[key] || 0
              const pct = maxPayment > 0 ? (value / maxPayment) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${methodColors[key]}`} />
                      <span className="text-sm">{methodLabels[key]}</span>
                    </div>
                    <span className="text-sm font-semibold">{fmt(value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${methodBg[key]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Desglose por método - Gastos */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Gastos por método de pago
          </h3>
          <div className="space-y-2">
            {[
              { key: 'cashExpenses', label: 'Efectivo', color: 'text-emerald-600', bg: 'bg-emerald-500' },
              { key: 'cardExpenses', label: 'Tarjeta', color: 'text-blue-600', bg: 'bg-blue-500' },
              { key: 'transferExpenses', label: 'Transferencia', color: 'text-brand-600', bg: 'bg-brand-500' },
              { key: 'otherExpenses', label: 'Otro', color: 'text-purple-600', bg: 'bg-purple-500' },
            ].map(({ key, label, color, bg }) => {
              const value = r?.[key] || 0
              const pct = maxExpense > 0 ? (value / maxExpense) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{label}</span>
                    <span className="text-sm font-semibold text-red-500">{fmt(value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${bg} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top servicios */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            Servicios más vendidos
          </h3>
          <div className="space-y-2">
            {(r?.topServices || []).slice(0, 5).map((s, i) => (
              <div key={s.serviceId ?? i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
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
                    <p className="text-sm font-medium">{s.serviceName}</p>
                    <p className="text-xs text-gray-500">{s.timesSold} vendidos</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{fmt(s.totalRevenue)}</span>
              </div>
            ))}
            {(!r?.topServices || r.topServices.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-3">Sin servicios vendidos en este período</p>
            )}
          </div>
        </div>

        {/* Desglose diario (solo mensual) */}
        {view === 'monthly' && (
          <div>
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              Desglose diario del mes
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="text-left py-2">Día</th>
                    <th className="text-right py-2">Citas</th>
                    <th className="text-right py-2">Pagos</th>
                    <th className="text-right py-2">Gastos</th>
                    <th className="text-right py-2">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {(r?.dailyBreakdown || []).map((d) => (
                    <tr key={d.day} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{d.day}</td>
                      <td className="py-2 text-right">{d.appointments}</td>
                      <td className="py-2 text-right text-emerald-600">{fmt(d.payments)}</td>
                      <td className="py-2 text-right text-red-600">{fmt(d.expenses)}</td>
                      <td className={`py-2 text-right font-medium ${(d.payments || 0) - (d.expenses || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
          </div>
        )}

        {/* Pie de página del PDF */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Reporte generado el {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
          <p>BookFlow · Sistema de Gestión</p>
        </div>
      </div>
    </div>
  )
}
