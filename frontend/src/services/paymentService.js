import api from './api'

export const paymentService = {
  create: (companyId, appointmentId, data) =>
    api.post(`/api/v1/companies/${companyId}/payments/appointment/${appointmentId}`, data),

  getById: (companyId, paymentId) =>
    api.get(`/api/v1/companies/${companyId}/payments/${paymentId}`),

  getByAppointment: (companyId, appointmentId) =>
    api.get(`/api/v1/companies/${companyId}/payments/appointment/${appointmentId}`),

  getTotalPaid: (companyId, appointmentId) =>
    api.get(`/api/v1/companies/${companyId}/payments/appointment/${appointmentId}/total`),

  getBalance: (companyId, appointmentId) =>
    api.get(`/api/v1/companies/${companyId}/payments/appointment/${appointmentId}/balance`),
}