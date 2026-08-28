import api from './api'

export const companyService = {
  create: (data) =>
    api.post('/api/v1/companies', data),

  getAll: () =>
    api.get('/api/v1/companies'),

  getById: (id) =>
    api.get(`/api/v1/companies/${id}`),

  update: (id, data) =>
    api.put(`/api/v1/companies/${id}`, data),

  delete: (id) =>
    api.delete(`/api/v1/companies/${id}`),

  activate: (id) =>
    api.patch(`/api/v1/companies/${id}/activate`),
}
