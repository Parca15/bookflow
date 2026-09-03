import { BentoCard } from '../components/BentoCard'
import { fmt } from './dashboardHelpers'
import { FileText, Clock } from 'lucide-react'
import { STATUS_MAP } from './dashboardHelpers'

export function TopServices({ topServices }) {
  return (
    <BentoCard>
      <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand-500" />Top servicios hoy
      </h3>
      <div className="space-y-2">
        {topServices?.slice(0, 5).map((service, i) => (
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
        {(!topServices || topServices.length === 0) && (
          <p className="text-apple-secondary text-sm text-center py-4">Sin datos hoy</p>
        )}
      </div>
    </BentoCard>
  )
}

export function RecentAppointments({ recentAppointments }) {
  return (
    <BentoCard>
      <h3 className="font-semibold mb-3 text-apple-text flex items-center gap-2">
        <Clock className="w-4 h-4 text-brand-500" />Últimas citas
      </h3>
      <div className="space-y-2">
        {recentAppointments?.slice(0, 5).map((apt, i) => {
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
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color}`}>{st.label}</span>
            </div>
          )
        })}
        {(!recentAppointments || recentAppointments.length === 0) && (
          <p className="text-apple-secondary text-sm text-center py-4">Sin citas recientes</p>
        )}
      </div>
    </BentoCard>
  )
}
