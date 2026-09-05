import api from './api'

export const appointmentService = {
  getAll: (companyId, date) =>
    api.get(`/api/v1/appointments/company/${companyId}`, {
      params: { appointmentDate: date },
    }),

  getById: (companyId, id) =>
    api.get(`/api/v1/appointments/company/${companyId}/${id}`),

  create: (companyId, data) =>
    api.post(`/api/v1/appointments/company/${companyId}`, data),

  update: (companyId, id, data) =>
    api.put(`/api/v1/appointments/company/${companyId}/${id}`, data),

  complete: (companyId, id) =>
    api.patch(`/api/v1/appointments/company/${companyId}/${id}/complete`),

  cancel: (companyId, id) =>
    api.patch(`/api/v1/appointments/company/${companyId}/${id}/cancel`),

  applyCoupon: (companyId, id, code) =>
    api.post(`/api/v1/appointments/company/${companyId}/${id}/coupon`, { code }),

  removeCoupon: (companyId, id) =>
    api.delete(`/api/v1/appointments/company/${companyId}/${id}/coupon`),
}
