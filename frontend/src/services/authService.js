import api from './api'

export const authService = {
  login: (email, password) =>
    api.post('/api/v1/auth/login', { email, password }),
  
  register: (data) =>
    api.post('/api/v1/auth/register', data),

  getUsersByCompany: (companyId) =>
    api.get(`/api/v1/auth/companies/${companyId}/users`),

  // Crear usuario como administrador (no cambia la sesión actual)
  createUser: (data) =>
    api.post('/api/v1/auth/register', data),
}