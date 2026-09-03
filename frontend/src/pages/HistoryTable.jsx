import { BentoCard } from '../components/BentoCard'
import { fmt } from './cashRegisterHelpers'

export default function HistoryTable({ history, onSelect }) {
  return (
    <BentoCard>
      <h3 className="font-semibold mb-4">Historial de cajas</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="text-apple-secondary border-b border-apple-border">
              <th className="text-left py-3">ID</th>
              <th className="text-left py-3">Apertura</th>
              <th className="text-left py-3">Monto apertura</th>
              <th className="text-left py-3">Cierre</th>
              <th className="text-left py-3">Monto cierre</th>
              <th className="text-left py-3">Ingresos</th>
              <th className="text-left py-3">Gastos</th>
              <th className="text-left py-3">Neto</th>
              <th className="text-left py-3">Esperado</th>
              <th className="text-left py-3">Diferencia</th>
              <th className="text-left py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {history.map((cr) => (
              <tr
                key={cr.id} onClick={() => onSelect(cr)}
                className="border-b border-stone-300/50 hover:bg-stone-100/50 cursor-pointer transition-colors"
              >
                <td className="py-3 font-medium">#{cr.id}</td>
                <td className="py-3">{cr.openingDate?.split('T')[0]}</td>
                <td className="py-3">{fmt(cr.openingAmount)}</td>
                <td className="py-3">{cr.closingDate?.split('T')[0] || '-'}</td>
                <td className="py-3">{cr.closingAmount ? fmt(cr.closingAmount) : '-'}</td>
                <td className="py-3 text-emerald-600">{fmt(cr.totalPayments)}</td>
                <td className="py-3 text-red-500">{fmt(cr.totalExpenses)}</td>
                <td className={`py-3 font-medium ${(cr.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(cr.netResult)}</td>
                <td className="py-3">{cr.expectedCashAmount ? fmt(cr.expectedCashAmount) : '-'}</td>
                <td className={`py-3 font-medium ${(cr.cashDifference || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {cr.cashDifference != null ? fmt(cr.cashDifference) : '-'}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-base ${cr.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-500/20 text-apple-secondary'}`}>
                    {cr.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BentoCard>
  )
}
