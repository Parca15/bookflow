import api from './api'

export const roleService = {
  getAll: (companyId) =>
    api.get(`/api/v1/roles?companyId=${companyId}`),

  getById: (id) =>
    api.get(`/api/v1/roles/${id}`),

  create: (companyId, data) =>
    api.post(`/api/v1/roles?companyId=${companyId}`, data),

  update: (id, data) =>
    api.put(`/api/v1/roles/${id}`, data),

  delete: (id) =>
    api.delete(`/api/v1/roles/${id}`),

  getModules: () =>
    api.get('/api/v1/roles/modules'),
}
