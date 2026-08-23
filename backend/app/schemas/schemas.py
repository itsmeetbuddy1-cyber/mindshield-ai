from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class CheckInRequest(BaseModel):
    mood: str
    stressor: str
    stress_level: int

class CheckInResponse(BaseSchema):
    id: int
    mood: str
    stressor: str
    stress_level: int
    created_at: Optional[datetime] = None

class StressAnalysisRequest(BaseModel):
    self_reported_stress: Optional[int] = None
    sentiment: Optional[float] = None
    interaction_intensity: Optional[float] = None
    response_latency: Optional[float] = None
    message_text: Optional[str] = None
    recent_check_ins: Optional[List[Dict[str, Any]]] = None

class StressAnalysisResponse(BaseSchema):
    stress_score: float
    category: str
    confidence: float
    signals: Dict[str, Any]
    recommended_action: str

class MessageRequest(BaseModel):
    message: str
    user_id: Optional[int] = 1
    language: Optional[str] = "en"
    session_id: Optional[str] = None

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfileResponse(BaseSchema):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None
    preferred_language: str = "en"
    created_at: Optional[datetime] = None

class AuthResponse(BaseModel):
    token: str
    user: UserProfileResponse

class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    preferred_language: Optional[str] = None

class MessageResponse(BaseSchema):
    response: str
    safety_level: str
    suggested_actions: List[str] = []
    turn_id: Optional[int] = None
    current_topic: Optional[str] = None
    conversation_summary: Optional[str] = None
    stress_trend: Optional[str] = None
    stress_score: Optional[float] = None

class SafetyCheckRequest(BaseModel):
    message: str

class SafetyCheckResponse(BaseSchema):
    risk_level: str
    message: str
    resources: List[Dict[str, str]]

class RecommendationRequest(BaseModel):
    stress_score: float
    category: str
    recent_activities: List[str] = []

class RecommendationResponse(BaseSchema):
    recommendation: str
    exercises: List[Dict[str, Any]]
    priority: str

class DashboardResponse(BaseSchema):
    current_stress: float
    recent_check_ins: List[CheckInResponse]
    coping_sessions_today: int
    streak_days: int
    last_check_in: Optional[datetime] = None

class AnalyticsResponse(BaseSchema):
    stress_history: List[Dict[str, Any]]
    trigger_distribution: Dict[str, int]
    recovery_trend: Dict[str, Any]
    daily_averages: List[Dict[str, Any]]

class CopingSessionRequest(BaseModel):
    exercise_type: str
    duration_seconds: int
    stress_before: int
    stress_after: int
    completed: bool

class CopingSessionResponse(BaseSchema):
    id: int
    exercise_type: str
    duration_seconds: int
    stress_before: int
    stress_after: int
    completed: bool
    created_at: Optional[datetime] = None

class JournalEntryRequest(BaseModel):
    title: str
    content: str

class JournalEntryResponse(BaseSchema):
    id: int
    title: str
    content: str
    ai_summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DemoStateResponse(BaseSchema):
    stage: int
    stress_score: float
    category: str
    message: str
    action: str
