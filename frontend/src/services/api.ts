import axios from 'axios';
import type { CheckIn, StressAnalysis, DashboardData, AnalyticsData, DemoState, CopingSession, JournalEntry, SafetyCheck } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health
  health: () => api.get('/health'),

  // Check-in
  createCheckIn: (data: { mood: string; stressor: string; stress_level: number }) =>
    api.post<CheckIn>('/check-in', data),

  // Stress Analysis
  analyzeStress: (data: {
    self_reported_stress: number;
    sentiment: number;
    interaction_intensity: number;
    response_latency: number;
    message_text?: string;
    recent_check_ins?: number[];
  }) => api.post<StressAnalysis>('/analyze-stress', data),

  // Message Analysis (Shield AI)
  analyzeMessage: (data: { message: string; user_id?: string }) =>
    api.post<{ response: string; safety_level: string; suggested_actions: string[] }>('/analyze-message', data),

  // Safety Check
  safetyCheck: (data: { message: string }) =>
    api.post<SafetyCheck>('/safety-check', data),

  // Recommendation
  getRecommendation: (data: { stress_score: number; category: string; recent_activities?: string[] }) =>
    api.post<{ recommendation: string; exercises: string[]; priority: string }>('/recommendation', data),

  // Dashboard
  getDashboard: () => api.get<DashboardData>('/dashboard'),

  // Analytics
  getAnalytics: (period: '7d' | '30d' = '7d') =>
    api.get<AnalyticsData>(`/analytics?period=${period}`),

  // Coping Sessions
  createCopingSession: (data: {
    exercise_type: string;
    duration_seconds: number;
    stress_before: number;
    stress_after: number;
    completed: boolean;
  }) => api.post<CopingSession>('/coping-session', data),

  getCopingSessions: () => api.get<CopingSession[]>('/coping-sessions'),

  // Journal
  createJournalEntry: (data: { title: string; content: string }) =>
    api.post<JournalEntry>('/journal', data),

  getJournalEntries: () => api.get<JournalEntry[]>('/journal'),

  getJournalEntry: (id: number) => api.get<JournalEntry>(`/journal/${id}`),

  updateJournalEntry: (id: number, data: { title: string; content: string }) =>
    api.put<JournalEntry>(`/journal/${id}`, data),

  deleteJournalEntry: (id: number) => api.delete(`/journal/${id}`),

  // Demo
  startDemo: () => api.post<DemoState>('/demo/start'),
  advanceDemo: () => api.post<DemoState>('/demo/advance'),
  resetDemo: () => api.post<DemoState>('/demo/reset'),
  getDemoState: () => api.get<DemoState>('/demo/state'),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data: Record<string, unknown>) => api.put('/settings', data),

  // User Data
  deleteUserData: () => api.delete('/user/data'),

  // Host / Admin Portal (Password: Meet@2006)
  hostLogin: (password: string) => api.post('/host/login', { password }),
  getHostStats: () => api.get('/host/stats'),
  triggerHostStage: (stageNum: number) => api.post(`/host/trigger-stage/${stageNum}`),
};

export default apiService;
