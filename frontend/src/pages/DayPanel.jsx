import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Plus, Clock, CheckCircle, XCircle, UserX, DollarSign, CreditCard, FileText } from 'lucide-react'
import { fmt, statusColors, statusLabels, PAYABLE } from './calendarHelpers'

export default function DayPanel({ selectedDate, selectedDayApts, clientMap, onOpenCreateForm, onStatusChange, onOpenPaymentModal, onOpenInvoiceModal, cashOpen, paidAppointments, appointmentService }) {
  return (
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
              onClick={() => onOpenCreateForm(selectedDate)}
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
                        onClick={() => onStatusChange(apt, appointmentService.confirm)}
                        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-600 hover:bg-indigo-500/30 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />Confirmar
                      </button>
                      <button
                        onClick={() => onStatusChange(apt, appointmentService.noShow)}
                        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 transition-colors"
                      >
                        <UserX className="w-3 h-3" />No asistió
                      </button>
                      <button
                        onClick={() => onStatusChange(apt, appointmentService.cancel)}
                        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />Cancelar
                      </button>
                    </div>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => onStatusChange(apt, appointmentService.start)}
                        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 transition-colors"
                      >
                        <Clock className="w-3 h-3" />Iniciar
                      </button>
                      <button
                        onClick={() => onStatusChange(apt, appointmentService.cancel)}
                        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />Cancelar
                      </button>
                    </div>
                  )}
                  {apt.status === 'IN_PROGRESS' && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => onStatusChange(apt, appointmentService.complete)}
                        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />Completar
                      </button>
                    </div>
                  )}
                  {apt.status !== 'SCHEDULED' && apt.status !== 'CONFIRMED' && apt.status !== 'IN_PROGRESS' && (
                    <div className="flex gap-1 mt-2">
                      {PAYABLE.includes(apt.status) && (apt.totalPrice || 0) > 0 && (
                        <>
                          <button
                            onClick={() => onOpenPaymentModal(apt, true)}
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
                            onClick={() => onOpenPaymentModal(apt, false)}
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
                        onClick={() => onOpenInvoiceModal(apt)}
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
              onClick={() => onOpenCreateForm(selectedDate)}
              className="btn-primary w-full mt-3 justify-center text-sm py-2"
            >
              <Plus className="w-4 h-4" />Nueva cita
            </button>
          </>
        )}
      </div>
    </div>
  )
}
