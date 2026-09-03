import { BentoCard } from '../components/BentoCard'
import { fmt } from './dashboardHelpers'
import { TrendingUp } from 'lucide-react'

export default function MonthlySummary({ monthlyReport }) {
  return (
    <BentoCard>
      <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-brand-500" />Resumen mensual
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
  )
}
