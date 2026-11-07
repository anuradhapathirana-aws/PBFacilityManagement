import { request, download } from './client.js';

export const authApi = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
};

export const staffApi = {
  list: (query) => request('/staff', { query }),
  get: (id) => request(`/staff/${id}`),
  create: (body) => request('/staff', { method: 'POST', body }),
  update: (id, body) => request(`/staff/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
  bookings: (id, query) => request(`/staff/${id}/bookings`, { query }),
};

export const bookingApi = {
  list: (query) => request('/bookings', { query }),
  get: (id) => request(`/bookings/${id}`),
  create: (body) => request('/bookings', { method: 'POST', body }),
  update: (id, body) => request(`/bookings/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
};

export const reportApi = {
  dashboard: () => request('/dashboard'),
  daily: (date) => request('/reports/daily', { query: { date } }),
  dailyCsv: (date) => download('/reports/daily.csv', { date }, `CleaningOS_Daily_Report_${date}.csv`),
};
