import { useNavigate } from 'react-router-dom'
import { BentoCard } from '../components/BentoCard'
import { fmt } from './dashboardHelpers'
import { Wallet } from 'lucide-react'

export default function CashCard({ cashRegister }) {
  const navigate = useNavigate()

  return (
    <BentoCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-apple-text flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-500" />Caja del día
        </h3>
        {cashRegister && (
          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
            cashRegister.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-stone-200 text-apple-secondary'
          }`}>
            {cashRegister.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
          </span>
        )}
      </div>
      {cashRegister ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-apple-secondary">Apertura</span>
            <span className="text-sm font-semibold">{fmt(cashRegister.openingAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-apple-secondary">Ingresos</span>
            <span className="text-sm font-semibold text-emerald-600">{fmt(cashRegister.totalPayments)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-apple-secondary">Gastos</span>
            <span className="text-sm font-semibold text-red-500">{fmt(cashRegister.totalExpenses)}</span>
          </div>
          <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
            <span className="text-sm font-medium">Neto</span>
            <span className={`text-sm font-bold ${(cashRegister.netResult || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmt(cashRegister.netResult)}
            </span>
          </div>
          {cashRegister.status === 'OPEN' && (
            <button onClick={() => navigate('/cash-register')} className="w-full mt-2 text-center text-sm text-brand-600 hover:text-brand-700 font-medium">
              Ir a caja →
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-apple-secondary text-sm mb-2">No hay caja abierta</p>
          <button onClick={() => navigate('/cash-register')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Abrir caja →
          </button>
        </div>
      )}
    </BentoCard>
  )
}
