import api from './api'

export const cashService = {
  getOpen: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/cash-registers/open`),
  
  getAll: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/cash-registers`),
  
  getById: (companyId, id) =>
    api.get(`/api/v1/companies/${companyId}/cash-registers/${id}`),
  
  open: (companyId, data) =>
    api.post(`/api/v1/companies/${companyId}/cash-registers`, data),
  
  close: (companyId, id, data) =>
    api.put(`/api/v1/companies/${companyId}/cash-registers/${id}/close`, data),
}