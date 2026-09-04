import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientService } from '../clientService'
import api from '../api'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('calls GET /companies/{id}/clients', async () => {
      api.get.mockResolvedValue({ data: [] })

      await clientService.getAll(1)

      expect(api.get).toHaveBeenCalledWith('/api/v1/companies/1/clients')
    })
  })

  describe('getPaged', () => {
    it('calls GET with pagination params', async () => {
      api.get.mockResolvedValue({ data: { content: [], totalPages: 0 } })

      await clientService.getPaged(1, 2, 10)

      expect(api.get).toHaveBeenCalledWith('/api/v1/companies/1/clients/paged', {
        params: { page: 2, size: 10 },
      })
    })

    it('uses default pagination', async () => {
      api.get.mockResolvedValue({ data: { content: [] } })

      await clientService.getPaged(1)

      expect(api.get).toHaveBeenCalledWith('/api/v1/companies/1/clients/paged', {
        params: { page: 0, size: 20 },
      })
    })
  })

  describe('getById', () => {
    it('calls GET /companies/{id}/clients/{clientId}', async () => {
      api.get.mockResolvedValue({ data: { id: 5 } })

      await clientService.getById(1, 5)

      expect(api.get).toHaveBeenCalledWith('/api/v1/companies/1/clients/5')
    })
  })

  describe('create', () => {
    it('calls POST with client data', async () => {
      const data = { firstName: 'Juan', lastName: 'Pérez' }
      api.post.mockResolvedValue({ data: { id: 1, ...data } })

      await clientService.create(1, data)

      expect(api.post).toHaveBeenCalledWith('/api/v1/companies/1/clients', data)
    })
  })

  describe('update', () => {
    it('calls PUT with client data', async () => {
      const data = { firstName: 'Juan Actualizado' }
      api.put.mockResolvedValue({ data: { id: 5, ...data } })

      await clientService.update(1, 5, data)

      expect(api.put).toHaveBeenCalledWith('/api/v1/companies/1/clients/5', data)
    })
  })

  describe('delete', () => {
    it('calls DELETE on client', async () => {
      api.delete.mockResolvedValue({})

      await clientService.delete(1, 5)

      expect(api.delete).toHaveBeenCalledWith('/api/v1/companies/1/clients/5')
    })
  })

  describe('deletePermanent', () => {
    it('calls DELETE on permanent endpoint', async () => {
      api.delete.mockResolvedValue({})

      await clientService.deletePermanent(1, 5)

      expect(api.delete).toHaveBeenCalledWith('/api/v1/companies/1/clients/5/permanent')
    })
  })

  describe('getHistory', () => {
    it('calls GET on history endpoint', async () => {
      api.get.mockResolvedValue({ data: { appointments: [] } })

      await clientService.getHistory(1, 5)

      expect(api.get).toHaveBeenCalledWith('/api/v1/companies/1/clients/5/history')
    })
  })

  describe('activate', () => {
    it('calls PATCH on activate endpoint', async () => {
      api.patch.mockResolvedValue({})

      await clientService.activate(1, 5)

      expect(api.patch).toHaveBeenCalledWith('/api/v1/companies/1/clients/5/activate')
    })
  })
})
