import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../authService'
import api from '../api'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('calls POST with credentials', async () => {
      api.post.mockResolvedValue({ data: { token: 'abc123' } })

      const result = await authService.login('test@test.com', 'password')

      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'test@test.com',
        password: 'password',
      })
      expect(result.data.token).toBe('abc123')
    })
  })

  describe('register', () => {
    it('calls POST with user data', async () => {
      const data = { email: 'new@test.com', password: 'pass', companyId: 1, roleId: 2 }
      api.post.mockResolvedValue({ data: { id: 1 } })

      await authService.register(data)

      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/register', data)
    })
  })

  describe('getUsersByCompany', () => {
    it('calls GET /auth/companies/{id}/users', async () => {
      api.get.mockResolvedValue({ data: [] })

      await authService.getUsersByCompany(1)

      expect(api.get).toHaveBeenCalledWith('/api/v1/auth/companies/1/users')
    })
  })

  describe('deactivate', () => {
    it('calls PATCH on deactivate endpoint', async () => {
      api.patch.mockResolvedValue({})

      await authService.deactivate(5)

      expect(api.patch).toHaveBeenCalledWith('/api/v1/auth/users/5/deactivate')
    })
  })

  describe('activate', () => {
    it('calls PATCH on activate endpoint', async () => {
      api.patch.mockResolvedValue({})

      await authService.activate(5)

      expect(api.patch).toHaveBeenCalledWith('/api/v1/auth/users/5/activate')
    })
  })

  describe('delete', () => {
    it('calls DELETE on user', async () => {
      api.delete.mockResolvedValue({})

      await authService.delete(5)

      expect(api.delete).toHaveBeenCalledWith('/api/v1/auth/users/5')
    })
  })
})
