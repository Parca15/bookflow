import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ConfirmDialog isOpen={false} onClose={() => {}} onConfirm={() => {}} message="Test?" />
    )
    expect(screen.queryByText('Test?')).not.toBeInTheDocument()
  })

  it('renders with default props', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={() => {}} onConfirm={() => {}} message="¿Eliminar?" />
    )
    expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument()
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('renders with custom title and confirm text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Borrar"
        message="¿Estás seguro?"
        confirmText="Sí, borrar"
      />
    )
    expect(screen.getByText('Borrar')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    expect(screen.getByText('Sí, borrar')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <ConfirmDialog isOpen={true} onClose={onClose} onConfirm={onConfirm} message="¿OK?" />
    )
    fireEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <ConfirmDialog isOpen={true} onClose={onClose} onConfirm={() => {}} message="¿OK?" />
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies danger styling when danger prop is true', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={() => {}} onConfirm={() => {}} message="¿Eliminar?" danger />
    )
    const confirmBtn = screen.getByText('Confirmar')
    expect(confirmBtn).toHaveClass('bg-red-500')
  })
})
