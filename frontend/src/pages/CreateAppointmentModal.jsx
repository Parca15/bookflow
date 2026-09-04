import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Plus, CheckSquare, Square } from 'lucide-react'
import { fmt, addMinutes, clientName } from './calendarHelpers'

export default function CreateAppointmentModal({
  isOpen, onClose, createForm, setCreateForm, clients, employees, catalog,
  selectedServices, totalPrice, totalMinutes, onSave, saving, onToggleService
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Nueva cita — {format(new Date(createForm.appointmentDate + 'T12:00:00'), "d 'de' MMMM", { locale: es })}</h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Cliente</label>
              <select
                className="input-field"
                value={createForm.clientId}
                onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                style={{ minHeight: '48px' }}
              >
                <option value="">Seleccionar...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{clientName(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Empleado</label>
              <select
                className="input-field"
                value={createForm.employeeId}
                onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                style={{ minHeight: '48px' }}
              >
                <option value="">Seleccionar...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="label">Fecha</label>
              <input
                type="date"
                className="input-field"
                value={createForm.appointmentDate}
                onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                required
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <label className="label">Inicio</label>
              <input
                type="time"
                className="input-field"
                value={createForm.startTime}
                onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                required
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div>
            <label className="label">Fin (estimado)</label>
            <input
              type="time"
              className="input-field"
              value={totalMinutes > 0 ? addMinutes(createForm.startTime, totalMinutes) : createForm.startTime}
              readOnly
              style={{ minHeight: '48px', backgroundColor: 'var(--apple-surface)', cursor: 'default' }}
            />
          </div>

          <div>
            <label className="label">Servicios</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-apple-border rounded-xl p-3">
              {catalog.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onToggleService(c.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    createForm.serviceIds.includes(c.id)
                      ? 'bg-brand-500/20 text-brand-600'
                      : 'bg-apple-hover text-apple-secondary hover:bg-stone-100'
                  }`}
                >
                  {createForm.serviceIds.includes(c.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{c.name}</span>
                  <span className="text-apple-secondary shrink-0">{c.durationMinutes}min</span>
                  <span className="ml-auto font-medium shrink-0">{fmt(c.price)}</span>
                </button>
              ))}
              {catalog.length === 0 && (
                <p className="text-sm text-apple-secondary text-center py-2">No hay servicios en el catálogo</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <input
              type="text"
              className="input-field"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              style={{ minHeight: '48px' }}
              placeholder="Ej: cliente alérgico a ciertos productos"
            />
          </div>

          <div className="bg-stone-100/60 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-apple-secondary">Duración: {totalMinutes} min · Fin: {totalMinutes > 0 ? addMinutes(createForm.startTime, totalMinutes) : '—'}</p>
              <p className="text-sm text-apple-text">{selectedServices.map((s) => s.name).join(' + ') || 'Sin servicios'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-apple-secondary">Total</p>
              <p className="text-lg font-bold text-emerald-600">{fmt(totalPrice)}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !createForm.clientId || !createForm.employeeId || createForm.serviceIds.length === 0}
            className="btn-primary w-full justify-center py-3 rounded-xl text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creando...' : 'Crear cita'}
            <Plus className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  )
}
