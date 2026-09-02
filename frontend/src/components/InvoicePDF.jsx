import html2pdf from 'html2pdf.js'
import { X, Download } from 'lucide-react'

function fmt(val) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val || 0)
}

const methodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
}

export default function InvoicePDF({ appointment, client, company, services, payments, totalPaid, balance, onClose }) {
  const total = services.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0)
  const invoiceNumber = `BF-${String(appointment.id).padStart(6, '0')}`
  const issueDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const handleDownload = () => {
    const element = document.getElementById('invoice-content')
    const opt = {
      margin: [0.5, 0.5],
      filename: `Factura_${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3" onClick={onClose}>
      <div
        className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Factura — Cita #{appointment.id}</h3>
          <button onClick={onClose} className="text-apple-secondary hover:text-apple-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido de la factura (se captura para PDF) */}
        <div id="invoice-content" className="bg-white text-gray-900 p-6 rounded-xl mb-4">
          {/* Header empresa */}
          <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-1">
              {company?.businessName || 'BookFlow'}
            </h2>
            <div className="text-sm text-gray-500 space-y-0.5">
              <div>NIT: {company?.documentNumber || '—'}</div>
              {company?.phone && <div>Tel: {company.phone}</div>}
              {company?.address && <div>{company.address}</div>}
              {company?.email && <div>{company.email}</div>}
            </div>
            <h3 className="text-gray-600 font-normal mt-4">FACTURA DE VENTA</h3>
          </div>

          {/* Datos cliente + factura */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h4 className="text-gray-500 text-sm font-semibold mb-2">Cliente</h4>
              <div className="text-sm space-y-1">
                <div><strong>Nombre:</strong> {client?.fullName || '—'}</div>
                <div><strong>Documento:</strong> {client?.documentNumber || '—'}</div>
                <div><strong>Teléfono:</strong> {client?.phone || '—'}</div>
              </div>
            </div>
            <div>
              <h4 className="text-gray-500 text-sm font-semibold mb-2">Detalle</h4>
              <div className="text-sm space-y-1">
                <div><strong>N° Factura:</strong> {invoiceNumber}</div>
                <div><strong>Fecha:</strong> {issueDate}</div>
                <div>
                  <strong>Estado:</strong>{' '}
                  <span className={balance > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                    {balance > 0 ? 'PENDIENTE' : 'PAGADO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {appointment.notes && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 text-sm">
              <strong>Notas:</strong> {appointment.notes}
            </div>
          )}

          {/* Tabla servicios */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Servicio</th>
                <th className="text-right py-2">Precio</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">{s.catalogName || s.name || `Servicio #${s.catalogId}`}</td>
                  <td className="text-right py-2">{fmt(s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>

            {payments && payments.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-blue-600 mb-1">Abonos realizados:</div>
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-xs text-blue-600">
                    <span>• {methodLabels[p.paymentMethod] || p.paymentMethod}</span>
                    <span>- {fmt(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-gray-200">
              <h3 className="font-bold">
                {balance > 0 ? 'PENDIENTE POR COBRAR' : 'TOTAL PAGADO'}
              </h3>
              <h2 className="text-lg font-bold text-blue-600">
                {balance > 0 ? fmt(balance) : fmt(total)}
              </h2>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-6 border-t border-gray-200 pt-4">
            Desarrollado por BookFlow
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3 rounded-xl">
            Cerrar
          </button>
          <button onClick={handleDownload} className="btn-primary flex-1 justify-center py-3 rounded-xl">
            <Download className="w-5 h-5 mr-2" />Descargar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
