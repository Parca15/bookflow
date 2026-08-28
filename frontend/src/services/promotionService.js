import api from './api'

export const promotionService = {
  create: (companyId, data) =>
    api.post(`/api/v1/companies/${companyId}/promotions`, data),

  update: (companyId, promotionId, data) =>
    api.put(`/api/v1/companies/${companyId}/promotions/${promotionId}`, data),

  getById: (companyId, promotionId) =>
    api.get(`/api/v1/companies/${companyId}/promotions/${promotionId}`),

  getAll: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/promotions`),

  getActive: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/promotions/active`),

  getByCode: (companyId, code) =>
    api.get(`/api/v1/companies/${companyId}/promotions/code/${encodeURIComponent(code)}`),

  deactivate: (companyId, promotionId) =>
    api.patch(`/api/v1/companies/${companyId}/promotions/${promotionId}/deactivate`),
}