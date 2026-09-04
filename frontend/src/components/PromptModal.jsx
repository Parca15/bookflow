import { useState, useEffect } from 'react'
import Modal from './Modal'
import { formatNumberWithDots, parseFormattedNumber } from '../utils/format'

export default function PromptModal({ isOpen, onClose, onConfirm, title, label, type = 'text', placeholder = '', defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (isOpen) {
      const initial = defaultValue ? formatNumberWithDots(defaultValue) : ''
      setValue(initial)
    }
  }, [isOpen, defaultValue])

  const handleChange = (e) => {
    if (type === 'number') {
      const raw = e.target.value
      const digits = raw.replace(/\D/g, '')
      setValue(formatNumberWithDots(digits))
    } else {
      setValue(e.target.value)
    }
  }

  const handleConfirm = () => {
    const numericValue = type === 'number' ? parseFormattedNumber(value) : value
    if (numericValue.toString().trim()) {
      onConfirm(numericValue)
      setValue('')
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Ingresa un valor'}>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--apple-secondary)]">
          {label}
        </label>
        <input
          type="text"
          inputMode={type === 'number' ? 'numeric' : undefined}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field w-full"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-apple-border hover:bg-apple-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.toString().trim()}
            className="flex-1 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            Aceptar
          </button>
        </div>
      </div>
    </Modal>
  )
}
