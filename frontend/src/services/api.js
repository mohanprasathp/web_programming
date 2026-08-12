import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (employeeId, password) => api.post('/auth/login', { employeeId, password }),
  verifyOTP: (userId, otp) => api.post('/auth/verify-otp', { userId, otp }),
  refreshToken: () => api.post('/auth/refresh-token'),
}

export const ceoService = {
  getDashboard: () => api.get('/ceo/dashboard'),
  createPlan: (data) => api.post('/ceo/create-plan', data),
  getPlans: () => api.get('/ceo/plans'),
  getUsers: () => api.get('/ceo/users'),
  assignSchools: (data) => api.post('/ceo/assign-schools', data),
  signPlan: (data) => api.post('/ceo/sign-plan', data),
  getReports: (filters) => api.get('/ceo/reports', { params: filters }),
  getIssues: () => api.get('/ceo/issues'),
  getLiveInspectorLocations: () => api.get('/ceo/live-locations'),
  getInspectionPhotos: (inspectionId) => api.get(`/ceo/photos/${inspectionId}`),
  getAllInspectionsWithPhotos: () => api.get('/ceo/photos-inspections'),
  getReportDetails: (inspectionId) => api.get(`/ceo/report/${inspectionId}`),
}

export const deoService = {
  getDashboard: () => api.get('/deo/dashboard'),
  getInspections: () => api.get('/deo/inspections'),
  startInspection: (data) => api.post('/deo/start-inspection', data),
  updateLocation: (data) => api.post('/inspections/update-location', data),
  // NOTE: uploadPhoto expects FormData directly without Content-Type header
  uploadPhoto: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
    return api.post('/deo/upload-photo', formData, config)
  },
  submitChecklist: (data) => api.post('/deo/submit-checklist', data),
  createIssue: (data) => api.post('/deo/create-issue', data),
  requestReportOtp: (inspectionId) => api.post('/deo/request-report-otp', { inspectionId }),
  submitReport: (data) => api.post('/deo/submit-report', data),
}

export const headmasterService = {
  getDashboard: () => api.get('/headmaster/dashboard'),
  getReports: () => api.get('/headmaster/reports'),
  getIssues: () => api.get('/headmaster/issues'),
  addCorrectiveAction: (data) => api.post('/headmaster/add-corrective-action', data),
  requestExtension: (data) => api.post('/headmaster/request-extension', data),
  markIssueResolved: (data) => api.post('/headmaster/mark-issue-resolved', data),
}

export const schoolService = {
  getSchools: () => api.get('/schools'),
  createSchool: (data) => api.post('/schools', data),
  getSchool: (id) => api.get(`/schools/${id}`),
}

export const inspectionService = {
  getInspections: () => api.get('/inspections'),
  getInspection: (id) => api.get(`/inspections/${id}`),
}

export const issueService = {
  getIssues: () => api.get('/issues'),
  getIssue: (id) => api.get(`/issues/${id}`),
}

export const analyticsService = {
  getInspectionMetrics: (planId, schoolId) =>
    api.get('/analytics/inspections', {
      params: { ...(planId && { planId }), ...(schoolId && { schoolId }) },
    }),
  getIssueMetrics: (planId, schoolId) =>
    api.get('/analytics/issues', {
      params: { ...(planId && { planId }), ...(schoolId && { schoolId }) },
    }),
  getCompliance: (schoolId) =>
    api.get('/analytics/compliance', {
      params: schoolId ? { schoolId } : {},
    }),
  getSchoolPerformance: () => api.get('/analytics/school-performance'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  exportReport: (format = 'json', filters = {}) =>
    api.get('/analytics/export', {
      params: { format, ...filters },
      responseType: format === 'csv' ? 'blob' : 'json',
    }),
}

export const notificationService = {
  getNotifications: (limit = 20, skip = 0, unreadOnly = false) =>
    api.get('/notifications', {
      params: { limit, skip, unreadOnly },
    }),
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
}

export const auditLogService = {
  getActivityLogs: (filters = {}) =>
    api.get('/audit-logs', { params: filters }),
  getUserActivitySummary: (userId, days = 30) =>
    api.get(`/audit-logs/user/${userId}/summary`, { params: { days } }),
  getSystemStats: (days = 30) =>
    api.get('/audit-logs/system/stats', { params: { days } }),
}

export default api
