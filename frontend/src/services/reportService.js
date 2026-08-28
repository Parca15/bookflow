import api from './api'

export const reportService = {
  getDaily: (companyId, date) =>
    api.get(`/api/v1/companies/${companyId}/reports/daily?date=${date}`),
  
  getMonthly: (companyId, year, month) =>
    api.get(`/api/v1/companies/${companyId}/reports/monthly?year=${year}&month=${month}`),
}