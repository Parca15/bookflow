import { describe, it, expect } from 'vitest'
import { fmt, clientName, addMinutes, statusColors, statusLabels, methodLabels } from '../format'

describe('fmt', () => {
  it('formats COP currency', () => {
    const result = fmt(50000)
    expect(result).toContain('50.000')
  })

  it('handles zero', () => {
    const result = fmt(0)
    expect(result).toContain('0')
  })

  it('handles large numbers', () => {
    const result = fmt(1000000)
    expect(result).toContain('1.000.000')
  })
})

describe('clientName', () => {
  it('returns full name when available', () => {
    expect(clientName({ fullName: 'John Doe' })).toBe('John Doe')
  })

  it('falls back to name property', () => {
    expect(clientName({ name: 'Jane' })).toBe('Jane')
  })

  it('returns Sin nombre when no name', () => {
    expect(clientName({})).toBe('Sin nombre')
  })

  it('returns Sin cliente when null', () => {
    expect(clientName(null)).toBe('Sin cliente')
  })
})

describe('addMinutes', () => {
  it('adds minutes correctly', () => {
    expect(addMinutes('10:30', 45)).toBe('11:15')
  })

  it('handles hour overflow', () => {
    expect(addMinutes('23:30', 60)).toBe('00:30')
  })

  it('handles zero minutes', () => {
    expect(addMinutes('14:00', 0)).toBe('14:00')
  })
})

describe('statusColors', () => {
  it('has color for each status', () => {
    expect(statusColors.SCHEDULED).toBeDefined()
    expect(statusColors.COMPLETED).toBeDefined()
    expect(statusColors.CANCELLED).toBeDefined()
    expect(statusColors.ACTIVE).toBeDefined()
    expect(statusColors.INACTIVE).toBeDefined()
  })
})

describe('statusLabels', () => {
  it('has label for each status', () => {
    expect(statusLabels.SCHEDULED).toBe('Programada')
    expect(statusLabels.COMPLETED).toBe('Completada')
    expect(statusLabels.CANCELLED).toBe('Cancelada')
    expect(statusLabels.ACTIVE).toBe('Activo')
    expect(statusLabels.INACTIVE).toBe('Inactivo')
  })
})

describe('methodLabels', () => {
  it('has label for each payment method', () => {
    expect(methodLabels.CASH).toBe('Efectivo')
    expect(methodLabels.CARD).toBe('Tarjeta')
    expect(methodLabels.TRANSFER).toBe('Transferencia')
    expect(methodLabels.OTHER).toBe('Otro')
  })
})
