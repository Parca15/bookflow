import api from './api'

export const invoiceService = {
  createFromAppointment: (companyId, appointmentId) =>
    api.post(`/api/v1/companies/${companyId}/invoices/appointment/${appointmentId}`),

  getById: (companyId, id) =>
    api.get(`/api/v1/companies/${companyId}/invoices/${id}`),

  getByAppointment: (companyId, appointmentId) =>
    api.get(`/api/v1/companies/${companyId}/invoices/appointment/${appointmentId}`),

  cancel: (companyId, id) =>
    api.patch(`/api/v1/companies/${companyId}/invoices/${id}/cancel`),
}
