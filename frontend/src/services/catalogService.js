import api from './api'

export const catalogService = {
  create: (companyId, data) =>
    api.post(`/api/v1/companies/${companyId}/catalog`, data),

  update: (companyId, id, data) =>
    api.put(`/api/v1/companies/${companyId}/catalog/${id}`, data),

  getById: (companyId, id) =>
    api.get(`/api/v1/companies/${companyId}/catalog/${id}`),

  getAll: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/catalog`),

  getPaged: (companyId, page = 0, size = 20) =>
    api.get(`/api/v1/companies/${companyId}/catalog/paged`, {
      params: { page, size },
    }),

  delete: (companyId, id) =>
    api.delete(`/api/v1/companies/${companyId}/catalog/${id}`),

  activate: (companyId, id) =>
    api.patch(`/api/v1/companies/${companyId}/catalog/${id}/activate`),
}
