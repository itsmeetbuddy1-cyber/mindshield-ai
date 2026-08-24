import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// JWT interceptor - attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindshield-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const apiService = {
  // Health
  health: () => api.get('/health'),

  // Auth
  signup: (data: { name: string; email: string; password: string }) => api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: { display_name?: string; preferred_language?: string }) => api.put('/auth/profile', data),

  // Check-in
  createCheckIn: (data: { mood: string; stressor: string; stress_level: number }) =>
    api.post('/check-in', data),

  // Stress Analysis
  analyzeStress: (data: any) => api.post('/analyze-stress', data),

  // Message / AI Assistant
  analyzeMessage: (data: { message: string; user_id?: number; language?: string; session_id?: string }) =>
    api.post('/analyze-message', data),

  // Safety
  safetyCheck: (data: { message: string }) => api.post('/safety-check', data),

  // Recommendation
  getRecommendation: (data: { stress_score: number; category: string; recent_activities?: string[] }) =>
    api.post('/recommendation', data),

  // Dashboard
  getDashboard: () => api.get('/dashboard'),

  // Analytics
  getAnalytics: (period: string = '7d') => api.get(`/analytics?period=${period}`),

  // Coping Sessions
  createCopingSession: (data: any) => api.post('/coping-session', data),
  getCopingSessions: () => api.get('/coping-sessions'),

  // Journal
  createJournalEntry: (data: { title: string; content: string }) => api.post('/journal', data),
  getJournalEntries: () => api.get('/journal'),
  getJournalEntry: (id: number) => api.get(`/journal/${id}`),
  updateJournalEntry: (id: number, data: { title: string; content: string }) => api.put(`/journal/${id}`, data),
  deleteJournalEntry: (id: number) => api.delete(`/journal/${id}`),

  // Demo
  startDemo: () => api.post('/demo/start'),
  advanceDemo: () => api.post('/demo/advance'),
  resetDemo: () => api.post('/demo/reset'),
  getDemoState: () => api.get('/demo/state'),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data),

  // User Data
  deleteUserData: () => api.delete('/user/data'),

  // Host
  hostLogin: (password: string) => api.post('/host/login', { password }),
  getHostStats: () => api.get('/host/stats'),
  triggerHostStage: (stageNum: number) => api.post(`/host/trigger-stage/${stageNum}`),

  // Multimodal Analysis
  analyzeMultimodal: (data: any) => api.post('/analyze-multimodal', data),
  scoreMultimodal: (data: any) => api.post('/score-multimodal', data),
}

export default apiService
