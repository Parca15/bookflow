import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { invoiceService } from '../services/invoiceService'
import { FileText, X, Plus, Ban } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function fmtCurrency(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

export default function InvoicesPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAppointments = async () => {
    try {
      const { data } = await appointmentService.getAll(user.companyId)
      setAppointments(data || [])
    } catch (e) {
      toast.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  const openInvoice = async (appointment) => {
    setSelected(appointment)
    setInvoice(null)
    setInvoiceLoading(true)
    try {
      const { data } = await invoiceService.getByAppointment(user.companyId, appointment.id)
      setInvoice(data)
    } catch (e) {
      if (e.response?.status !== 404) {
        toast.error('Error al consultar factura')
      }
    } finally {
      setInvoiceLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!selected) return
    setCreating(true)
    try {
      await invoiceService.createFromAppointment(user.companyId, selected.id)
      toast.success('Factura generada')
      const { data } = await invoiceService.getByAppointment(user.companyId, selected.id)
      setInvoice(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al generar factura')
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = async () => {
    if (!invoice) return
    if (!confirm('¿Cancelar esta factura?')) return
    try {
      await invoiceService.cancel(user.companyId, invoice.id)
      toast.success('Factura cancelada')
      const { data } = await invoiceService.getByAppointment(user.companyId, selected.id)
      setInvoice(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cancelar')
    }
  }

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
        <h1 className="text-3xl font-bold">Facturación</h1>
        <p className="text-gray-500 mt-1">Genera y consulta facturas por cita</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay citas para facturar</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-gray-400 text-sm">
              <tr>
                <th className="px-4 py-3 font-medium">Cita</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Factura</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                  <td className="px-4 py-3 font-medium">#{apt.id}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'dd/MM/yyyy', { locale: es }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{apt.startTime?.slice(0, 5) || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-700/50 text-gray-300">
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{fmtCurrency(apt.totalPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openInvoice(apt)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <FileText className="w-3 h-3" />Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal factura */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Factura — Cita #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {invoiceLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : invoice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">No. Factura</span>
                  <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cliente</span>
                  <span className="text-sm">{invoice.clientName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Estado</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    invoice.status === 'CANCELLED'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="border-t border-gray-800 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span>{fmtCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="font-bold">{fmtCurrency(invoice.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Pagado</span>
                    <span className="text-emerald-400">{fmtCurrency(invoice.totalPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Saldo</span>
                    <span className={invoice.balance > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {fmtCurrency(invoice.balance)}
                    </span>
                  </div>
                </div>

                {invoice.status !== 'CANCELLED' && (
                  <button
                    onClick={handleCancel}
                    className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 flex items-center justify-center gap-1"
                  >
                    <Ban className="w-4 h-4" />Cancelar factura
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">Esta cita aún no tiene factura.</p>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />{creating ? 'Generando...' : 'Generar factura'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
