import { X, CheckCircle, XCircle, Clock } from 'lucide-react'
import { statusColors, statusLabels } from './appointmentsHelpers'

export default function AppointmentDetailModal({ appointment, clientMap, employeeMap, onClose, onAction }) {
  if (!appointment) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Cita #{appointment.id}</h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-base text-apple-secondary">Cliente</span>
            <span className="text-base font-medium">{clientMap[appointment.clientId] || `Cliente #${appointment.clientId}`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-apple-secondary">Empleado</span>
            <span className="text-base">{employeeMap[appointment.employeeId] || `#${appointment.employeeId}`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-apple-secondary">Fecha y hora</span>
            <span className="text-base">{appointment.appointmentDate} · {appointment.startTime} - {appointment.endTime || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-apple-secondary">Estado</span>
            <span className={`px-2 py-0.5 rounded text-base border ${statusColors[appointment.status]}`}>
              {statusLabels[appointment.status]}
            </span>
          </div>
          {appointment.services && appointment.services.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {appointment.services.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-apple-hover rounded text-base text-apple-text">
                  {s.serviceName || s.catalogName}
                </span>
              ))}
            </div>
          )}
          {appointment.notes && (
            <p className="text-base text-apple-secondary italic">"{appointment.notes}"</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {appointment.status === 'SCHEDULED' && (
            <>
              <button onClick={() => onAction(appointment.id, 'complete')}
                className="flex-1 px-3 py-2 bg-emerald-500/20 text-emerald-600 rounded-lg text-base font-medium hover:bg-emerald-500/40">
                <CheckCircle className="w-3 h-3 inline mr-1" />Completar
              </button>
              <button onClick={() => onAction(appointment.id, 'cancel')}
                className="flex-1 px-3 py-2 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40">
                <XCircle className="w-3 h-3 inline mr-1" />Cancelar
              </button>
            </>
          )}
          {appointment.status === 'COMPLETED' && (
            <button onClick={() => onAction(appointment.id, 'cancel')}
              className="flex-1 px-3 py-2 bg-red-500/20 text-red-600 rounded-lg text-base font-medium hover:bg-red-500/40">
              <XCircle className="w-3 h-3 inline mr-1" />Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
