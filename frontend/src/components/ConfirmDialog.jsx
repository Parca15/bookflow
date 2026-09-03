import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirmar acción'}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-4 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle className={`w-8 h-8 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <p className="text-[var(--apple-secondary)] mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-apple-border hover:bg-apple-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 px-4 py-2 rounded-xl text-white transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
