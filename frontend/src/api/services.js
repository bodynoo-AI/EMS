import api from './axiosClient';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Employees
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats'),
  getMyProfile: () => api.get('/employees/me'),
  updateMyProfile: (data) => api.put('/employees/me', data),
  uploadProfileImage: (id, formData) => api.post(`/employees/${id}/profile-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocument: (id, formData) => api.post(`/employees/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume: (id, formData) => api.post(`/employees/${id}/resume`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Departments
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Skills
export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
};

// Leaves
export const leaveAPI = {
  apply: (data) => api.post('/leaves/apply', data),
  getAll: (params) => api.get('/leaves', { params }),
  getBalance: (params) => api.get('/leaves/balance', { params }),
  getEmployeeBalance: (employeeId, params) => api.get(`/leaves/balance/${employeeId}`, { params }),
  managerAction: (id, data) => api.post(`/leaves/${id}/manager-action`, data),
  hrAction: (id, data) => api.post(`/leaves/${id}/hr-action`, data),
  cancel: (id) => api.post(`/leaves/${id}/cancel`),
};

// Assets
export const assetAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  getStats: () => api.get('/assets/stats'),
  allocate: (assetId, data) => api.post(`/assets/${assetId}/allocate`, data),
  returnAsset: (allocationId, data) => api.post(`/assets/allocations/${allocationId}/return`, data),
};

// Dashboard
export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getManager: () => api.get('/dashboard/manager'),
  getEmployee: () => api.get('/dashboard/employee'),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Audit
export const auditAPI = {
  getLogs: (params) => api.get('/audit', { params }),
};

// Reports
export const reportAPI = {
  getEmployeeReport: (params) => api.get('/reports/employees', { params, responseType: params.format === 'excel' ? 'blob' : 'json' }),
  getLeaveReport: (params) => api.get('/reports/leaves', { params, responseType: params.format === 'excel' ? 'blob' : 'json' }),
  getAssetReport: (params) => api.get('/reports/assets', { params, responseType: params.format === 'excel' ? 'blob' : 'json' }),
};
