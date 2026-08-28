import api from './api'

export const appointmentService = {
  // date opcional: si no se envía el backend retorna todas las citas
  getAll: (companyId, date) =>
    api.get(`/api/appointments/company/${companyId}`, {
      params: { appointmentDate: date },
    }),
  
  getById: (companyId, id) =>
    api.get(`/api/appointments/company/${companyId}/${id}`),
  
  create: (companyId, data) =>
    api.post(`/api/appointments/company/${companyId}`, data),
  
  update: (companyId, id, data) =>
    api.put(`/api/appointments/company/${companyId}/${id}`, data),
  
  confirm: (companyId, id) =>
    api.patch(`/api/appointments/company/${companyId}/${id}/confirm`),
  
  start: (companyId, id) =>
    api.patch(`/api/appointments/company/${companyId}/${id}/start`),
  
  complete: (companyId, id) =>
    api.patch(`/api/appointments/company/${companyId}/${id}/complete`),
  
  cancel: (companyId, id) =>
    api.patch(`/api/appointments/company/${companyId}/${id}/cancel`),
  
  noShow: (companyId, id) =>
    api.patch(`/api/appointments/company/${companyId}/${id}/no-show`),
}