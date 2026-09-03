import api from './api'

export const employeeService = {
  create: (companyId, data) =>
    api.post(`/api/v1/companies/${companyId}/employees`, data),

  update: (companyId, id, data) =>
    api.put(`/api/v1/companies/${companyId}/employees/${id}`, data),

  getById: (companyId, id) =>
    api.get(`/api/v1/companies/${companyId}/employees/${id}`),

  getAll: (companyId) =>
    api.get(`/api/v1/companies/${companyId}/employees`),

  getPaged: (companyId, page = 0, size = 20) =>
    api.get(`/api/v1/companies/${companyId}/employees/paged`, {
      params: { page, size },
    }),

  delete: (companyId, id) =>
    api.delete(`/api/v1/companies/${companyId}/employees/${id}`),

  activate: (companyId, id) =>
    api.patch(`/api/v1/companies/${companyId}/employees/${id}/activate`),

  getSchedules: (employeeId) =>
    api.get(`/api/v1/employees/${employeeId}/schedules`),

  createSchedule: (employeeId, data) =>
    api.post(`/api/v1/employees/${employeeId}/schedules`, data),

  deleteSchedule: (companyId, scheduleId) =>
    api.delete(`/api/v1/companies/${companyId}/schedules/${scheduleId}`),
}
