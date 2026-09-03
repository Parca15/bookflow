import { useNavigate } from 'react-router-dom'
import { BentoCard } from '../components/BentoCard'
import { STATUS_MAP, fmt } from './dashboardHelpers'
import { Activity } from 'lucide-react'

export default function TodayAgenda({ todayAppointments, clientMap }) {
  const navigate = useNavigate()

  return (
    <BentoCard span="2col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-apple-text flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-500" />Agenda de hoy
        </h3>
        <button onClick={() => navigate('/calendar')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
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
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color}`}>{st.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}
