import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
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
import { fmt } from './cashRegisterHelpers'
import { parseFormattedNumber } from '../utils/format'
import toast from 'react-hot-toast'

export default function CashRegisterPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [cashRegister, setCashRegister] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOpen, setShowOpen] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [closingAmount, setClosingAmount] = useState('')
  const [selectedRegister, setSelectedRegister] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [openRes, histRes] = await Promise.allSettled([
        cashService.getOpen(user.companyId), cashService.getAll(user.companyId),
      ])
      if (openRes.status === 'fulfilled') {
        setCashRegister(openRes.value.data)
      } else {
        setCashRegister(null)
        if (histRes.status === 'fulfilled') {
          const openFromHistory = (histRes.value.data || []).find((c) => c.status === 'OPEN')
          if (openFromHistory) {
            try {
              const { data } = await cashService.getById(user.companyId, openFromHistory.id)
              setCashRegister(data)
            } catch (e) {
              console.error('Error al obtener caja abierta del historial:', e)
            }
          }
        }
      }
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data || [])
      if (histRes.status === 'rejected') {
        console.error('Error al cargar historial:', histRes.reason)
        toast.error(histRes.reason?.response?.data?.message || 'Error al cargar historial de cajas')
      }
    } catch (e) { toast.error('Error al cargar caja') } finally { setLoading(false) }
  }

  const handleClose = async () => {
    const numeric = parseFormattedNumber(closingAmount)
    if (!numeric) return
    try {
      await cashService.close(user.companyId, cashRegister.id, { closingAmount: parseFloat(numeric) })
      toast.success('Caja cerrada'); setShowClose(false); setClosingAmount(''); loadData()
      queryClient.invalidateQueries({ queryKey: ['dashboard', user.companyId] })
      queryClient.invalidateQueries({ queryKey: ['daily', user.companyId] })
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
          <p className="text-apple-secondary mt-1">
            {cashRegister ? `Caja abierta desde ${cashRegister.openingDate?.replace('T', ' ').slice(0, 16)}` : 'Sin caja abierta'}
          </p>
        </div>
        <div className="flex gap-2">
          {!cashRegister ? (
            <button onClick={() => setShowOpen(true)} className="btn-primary"><Unlock className="w-5 h-5" />Abrir caja</button>
          ) : (
            <button onClick={() => setShowClose(true)} className="btn-primary bg-red-600 hover:bg-red-700"><Lock className="w-5 h-5" />Cerrar caja</button>
          )}
        </div>
      </div>

      {!cashRegister && history.length > 0 && history[0]?.status === 'OPEN' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-600">Tienes una caja abierta que no se cerró</p>
            <p className="text-sm text-apple-secondary mt-1">
              Apertura: {history[0].openingDate?.replace('T', ' ').slice(0, 16)} · Monto: {fmt(history[0].openingAmount)}
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                const { data } = await cashService.getById(user.companyId, history[0].id)
                setCashRegister(data)
                setShowClose(true)
              } catch (e) {
                toast.error('Error al cargar la caja')
              }
            }}
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            <Lock className="w-4 h-4" />Cerrar caja olvidada
          </button>
        </div>
      )}

      <CashRegisterStats cashRegister={cashRegister} />
      {cashRegister && <PaymentBreakdown cashRegister={cashRegister} />}
      {cashRegister && <CashSummary cashRegister={cashRegister} />}

      <HistoryTable history={history} onSelect={openDetail} />

      <PromptModal
        isOpen={showOpen}
        onClose={() => setShowOpen(false)}
        onConfirm={async (val) => {
          try {
            const openRes = await cashService.getOpen(user.companyId)
            toast.error(`Ya tienes una caja abierta desde ${openRes.data.openingDate?.replace('T', ' ').slice(0, 16)}. Ciérrala primero.`)
            setCashRegister(openRes.data)
            setShowOpen(false)
            setShowClose(true)
            return
          } catch {}
          try {
            await cashService.open(user.companyId, { openingAmount: parseFloat(val) })
            toast.success('Caja abierta'); setShowOpen(false); loadData()
            queryClient.invalidateQueries({ queryKey: ['dashboard', user.companyId] })
            queryClient.invalidateQueries({ queryKey: ['daily', user.companyId] })
          } catch (e) {
            toast.error(e.response?.data?.message || 'Error al abrir caja')
          }
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
