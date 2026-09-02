import api from './api'

export const authService = {
  login: (email, password) =>
    api.post('/api/v1/auth/login', { email, password }),
  
  register: (data) =>
    api.post('/api/v1/auth/register', data),

  getUsersByCompany: (companyId) =>
    api.get(`/api/v1/auth/companies/${companyId}/users`),

  createUser: (data) =>
    api.post('/api/v1/auth/register', data),

  deactivate: (id) =>
    api.patch(`/api/v1/auth/users/${id}/deactivate`),

  activate: (id) =>
    api.patch(`/api/v1/auth/users/${id}/activate`),

  delete: (id) =>
    api.delete(`/api/v1/auth/users/${id}`),
}