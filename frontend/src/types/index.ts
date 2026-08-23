export interface CheckIn {
  id?: number;
  mood: string;
  stressor: string;
  stress_level: number;
  created_at?: string;
}

export interface StressAnalysis {
  stress_score: number;
  category: 'calm' | 'mild' | 'elevated' | 'high';
  confidence: number;
  signals: string[];
  recommended_action: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  safety_level?: string;
  suggested_actions?: string[];
}

export interface SafetyCheck {
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  message: string;
  resources: { name: string; contact: string; description: string }[];
}

export interface DashboardData {
  current_stress: StressAnalysis;
  recent_check_ins: CheckIn[];
  coping_sessions_today: number;
  streak_days: number;
  last_check_in: CheckIn | null;
}

export interface AnalyticsData {
  stress_history: { date: string; score: number; category: string }[];
  trigger_distribution: { trigger: string; count: number }[];
  recovery_trend: { date: string; before: number; after: number }[];
  daily_averages: { day: string; average: number }[];
}

export interface CopingSession {
  id?: number;
  exercise_type: string;
  duration_seconds: number;
  stress_before: number;
  stress_after: number;
  completed: boolean;
  created_at?: string;
}

export interface JournalEntry {
  id?: number;
  title: string;
  content: string;
  ai_summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DemoState {
  stage: number;
  stress_score: number;
  category: string;
  message: string;
  action: string;
}

export interface CopingExercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: string;
  type: string;
  steps?: string[];
}

export interface UserSettings {
  ai_mode: 'mock' | 'real';
  demo_mode: boolean;
  monitoring_enabled: boolean;
  consent_given: boolean;
}
