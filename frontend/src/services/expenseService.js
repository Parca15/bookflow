import api from './api'

export const expenseService = {
  create: (companyId, data) =>
    api.post(`/api/v1/companies/${companyId}/expenses`, data),

  getAll: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/expenses`),

  getById: (companyId, expenseId) =>
    api.get(`/api/v1/companies/${companyId}/expenses/${expenseId}`),

  getByCashRegister: (companyId, cashRegisterId) =>
    api.get(`/api/v1/companies/${companyId}/expenses/cash-register/${cashRegisterId}`),
}