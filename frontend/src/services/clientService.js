import api from './api'

export const clientService = {
  getAll: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/clients`),

  getPaged: (companyId, page = 0, size = 20) =>
    api.get(`/api/v1/companies/${companyId}/clients/paged`, {
      params: { page, size },
    }),

  getById: (companyId, id) =>
    api.get(`/api/v1/companies/${companyId}/clients/${id}`),

  create: (companyId, data) =>
    api.post(`/api/v1/companies/${companyId}/clients`, data),

  update: (companyId, id, data) =>
    api.put(`/api/v1/companies/${companyId}/clients/${id}`, data),

  delete: (companyId, id) =>
    api.delete(`/api/v1/companies/${companyId}/clients/${id}`),

  deletePermanent: (companyId, id) =>
    api.delete(`/api/v1/companies/${companyId}/clients/${id}/permanent`),

  getHistory: (companyId, id) =>
    api.get(`/api/v1/companies/${companyId}/clients/${id}/history`),

  activate: (companyId, id) =>
    api.patch(`/api/v1/companies/${companyId}/clients/${id}/activate`),
}
