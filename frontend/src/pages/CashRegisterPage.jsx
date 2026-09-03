import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cashService } from '../services/cashService'
import LoadingSpinner from '../components/LoadingSpinner'
import PromptModal from '../components/PromptModal'
import CashRegisterStats from './CashRegisterStats'
import PaymentBreakdown from './PaymentBreakdown'
import CashSummary from './CashSummary'
import CloseCashModal from './CloseCashModal'
import HistoryTable from './HistoryTable'
import CashDetailModal from './CashDetailModal'
import { Lock, Unlock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CashRegisterPage() {
  const { user } = useAuth()
  const [cashRegister, setCashRegister] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOpen, setShowOpen] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('')
  const [showClose, setShowClose] = useState(false)
  const [closingAmount, setClosingAmount] = useState('')
  const [selectedRegister, setSelectedRegister] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [openRes, histRes] = await Promise.allSettled([
        cashService.getOpen(user.companyId), cashService.getAll(user.companyId),
      ])
      if (openRes.status === 'fulfilled') setCashRegister(openRes.value.data)
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data)
    } catch (e) { toast.error('Error al cargar caja') } finally { setLoading(false) }
  }

  const handleOpen = async () => {
    if (!openingAmount) return
    try {
      await cashService.open(user.companyId, { openingAmount: parseFloat(openingAmount) })
      toast.success('Caja abierta'); setShowOpen(false); setOpeningAmount(''); loadData()
    } catch (e) { toast.error(e.response?.data?.message || 'Error al abrir caja') }
  }

  const handleClose = async () => {
    if (!closingAmount) return
    try {
      await cashService.close(user.companyId, cashRegister.id, { closingAmount: parseFloat(closingAmount) })
      toast.success('Caja cerrada'); setShowClose(false); setClosingAmount(''); loadData()
    } catch (e) { toast.error(e.response?.data?.message || 'Error al cerrar caja') }
  }

  const openDetail = async (register) => {
    try {
      const { data } = await cashService.getById(user.companyId, register.id)
      setSelectedRegister(data)
    } catch (e) { toast.error('Error al cargar detalle de caja') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Caja</h1>
          <p className="text-apple-secondary mt-1">{cashRegister ? 'Caja abierta' : 'Sin caja abierta'}</p>
        </div>
        <div className="flex gap-2">
          {!cashRegister ? (
            <button onClick={() => setShowOpen(true)} className="btn-primary"><Unlock className="w-5 h-5" />Abrir caja</button>
          ) : (
            <button onClick={() => setShowClose(true)} className="btn-primary bg-red-600 hover:bg-red-700"><Lock className="w-5 h-5" />Cerrar caja</button>
          )}
        </div>
      </div>

      <CashRegisterStats cashRegister={cashRegister} />
      {cashRegister && <PaymentBreakdown cashRegister={cashRegister} />}
      {cashRegister && <CashSummary cashRegister={cashRegister} />}

      <HistoryTable history={history} onSelect={openDetail} />

      <PromptModal
        isOpen={showOpen}
        onClose={() => setShowOpen(false)}
        onConfirm={async (val) => {
          try {
            await cashService.open(user.companyId, { openingAmount: parseFloat(val) })
            toast.success('Caja abierta'); setShowOpen(false); loadData()
          } catch (e) { toast.error(e.response?.data?.message || 'Error al abrir caja') }
        }}
        title="Abrir caja"
        label="Monto de apertura"
        type="number"
        placeholder="0"
      />

      <CloseCashModal
        isOpen={showClose}
        onClose={() => setShowClose(false)}
        onConfirm={handleClose}
        closingAmount={closingAmount}
        setClosingAmount={setClosingAmount}
        expectedCash={cashRegister?.expectedCashAmount}
      />

      <CashDetailModal register={selectedRegister} onClose={() => setSelectedRegister(null)} />
    </div>
  )
}
