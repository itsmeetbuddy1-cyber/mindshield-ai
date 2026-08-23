from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.services.ai_service import get_ai_service
from app.services.stress_analyzer import analyze_stress
from app.services.safety_service import check_safety
from app.services.demo_service import demo_service
from app.core.config import settings

from app.core.auth import hash_password, verify_password, create_access_token, get_current_user, get_optional_user
from app.services.text_analyzer import analyze_text_stress
from app.services.multimodal_fusion import fuse_signals

router = APIRouter(prefix="/api")

# ===== Auth Endpoints =====
@router.post("/auth/signup")
def signup(request: schemas.SignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.User).filter(models.User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        username=request.email.split("@")[0],
        email=request.email,
        password_hash=hash_password(request.password),
        display_name=request.name,
        preferred_language="en",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.username)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "preferred_language": user.preferred_language,
            "created_at": user.created_at
        }
    }

@router.post("/auth/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.username)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "preferred_language": user.preferred_language,
            "created_at": user.created_at
        }
    }

@router.get("/auth/me")
def get_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": user.display_name,
        "preferred_language": user.preferred_language,
        "created_at": user.created_at
    }

@router.put("/auth/profile")
def update_profile(request: schemas.UpdateProfileRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if request.display_name is not None:
        user.display_name = request.display_name
    if request.preferred_language is not None:
        user.preferred_language = request.preferred_language
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": user.display_name,
        "preferred_language": user.preferred_language
    }

@router.post("/check-in", response_model=schemas.CheckInResponse)
def create_check_in(request: schemas.CheckInRequest, user: models.User = Depends(get_optional_user), db: Session = Depends(get_db)):
    db_checkin = models.CheckIn(
        user_id=user.id if user else 1,
        mood=request.mood,
        stressor=request.stressor,
        stress_level=request.stress_level
    )
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@router.post("/analyze-stress", response_model=schemas.StressAnalysisResponse)
def api_analyze_stress(request: schemas.StressAnalysisRequest, db: Session = Depends(get_db)):
    signals = request.model_dump(exclude_none=True)
    score, category, confidence, used_signals, action = analyze_stress(signals)
    
    reading = models.StressReading(
        user_id=1,
        stress_score=score,
        category=category,
        confidence=confidence,
        signals=used_signals,
        recommended_action=action
    )
    db.add(reading)
    db.commit()
    
    return schemas.StressAnalysisResponse(
        stress_score=score,
        category=category,
        confidence=confidence,
        signals=used_signals,
        recommended_action=action
    )

@router.post("/analyze-message", response_model=schemas.MessageResponse)
def api_analyze_message(request: schemas.MessageRequest, user: models.User = Depends(get_optional_user), db: Session = Depends(get_db)):
    ai_service = get_ai_service()
    uid = user.id if user else request.user_id
    lang = request.language or (user.preferred_language if user else "en")
    
    user_msg = models.Conversation(user_id=uid, role="user", content=request.message, safety_level="UNKNOWN")
    db.add(user_msg)
    
    risk_level, support_msg, resources = check_safety(request.message, language=lang)
    
    # Load conversation context (last 10 messages)
    recent_msgs = db.query(models.Conversation).filter(
        models.Conversation.user_id == uid
    ).order_by(models.Conversation.created_at.desc()).limit(10).all()
    context = [{"role": m.role, "content": m.content} for m in reversed(recent_msgs)]
    
    if risk_level == "HIGH":
        ai_response = support_msg
    else:
        ai_response = ai_service.analyze_message(request.message, context=context, language=lang)
        
    ai_msg = models.Conversation(user_id=uid, role="ai", content=ai_response, safety_level=risk_level)
    db.add(ai_msg)
    
    if risk_level != "LOW":
        safety_event = models.SafetyEvent(
            user_id=uid,
            risk_level=risk_level,
            trigger_text=request.message,
            response_given=ai_response
        )
        db.add(safety_event)
        
    db.commit()
    
    actions = []
    if risk_level == "MODERATE":
        actions.append("grounding_exercise")
    elif risk_level == "HIGH":
        actions.append("show_resources")
        
    return schemas.MessageResponse(response=ai_response, safety_level=risk_level, suggested_actions=actions)

@router.post("/analyze-multimodal")
def analyze_multimodal(payload: Dict[str, Any]):
    """Fuse multiple stress signals into a single explainable result."""
    text = payload.get("text")
    text_result = None
    text_score = None
    if text:
        text_result = analyze_text_stress(text)
        text_score = text_result["text_stress_score"] / 100.0
    
    result = fuse_signals(
        self_report_score=payload.get("self_report_score"),
        text_score=text_score,
        voice_score=payload.get("voice_score"),
        camera_score=payload.get("camera_score"),
        interaction_score=payload.get("interaction_score"),
        weights=payload.get("weights")
    )
    
    if text_result:
        result["text_analysis_detail"] = text_result
    
    return result

@router.post("/safety-check", response_model=schemas.SafetyCheckResponse)
def api_safety_check(request: schemas.SafetyCheckRequest):
    risk_level, msg, resources = check_safety(request.message)
    return schemas.SafetyCheckResponse(risk_level=risk_level, message=msg, resources=resources)

@router.post("/recommendation", response_model=schemas.RecommendationResponse)
def api_recommendation(request: schemas.RecommendationRequest):
    exercises = [
        {"name": "Box Breathing", "duration": "5 mins", "type": "breathing"},
        {"name": "5-4-3-2-1 Grounding", "duration": "3 mins", "type": "mindfulness"}
    ]
    return schemas.RecommendationResponse(
        recommendation=f"Based on your {request.category} stress level, try these.",
        exercises=exercises,
        priority="high" if request.stress_score > 70 else "medium"
    )

@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(user: models.User = Depends(get_optional_user), db: Session = Depends(get_db)):
    uid = user.id if user else 1
    check_ins = db.query(models.CheckIn).filter(models.CheckIn.user_id == uid).order_by(models.CheckIn.created_at.desc()).limit(5).all()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    sessions = db.query(models.CopingSession).filter(
        models.CopingSession.user_id == uid,
        models.CopingSession.created_at >= today_start
    ).count()
    last_ci = check_ins[0].created_at if check_ins else None
    
    # Calculate real stress from recent readings
    latest_reading = db.query(models.StressReading).filter(
        models.StressReading.user_id == uid
    ).order_by(models.StressReading.created_at.desc()).first()
    current_stress = latest_reading.stress_score if latest_reading else random.uniform(20.0, 60.0)
    
    # Calculate real streak
    all_checkins = db.query(models.CheckIn).filter(models.CheckIn.user_id == uid).order_by(models.CheckIn.created_at.desc()).all()
    streak = 0
    if all_checkins:
        today = datetime.utcnow().date()
        for i in range(30):  # max 30 day streak
            day = today - timedelta(days=i)
            has_checkin = any(ci.created_at.date() == day for ci in all_checkins if ci.created_at)
            if has_checkin:
                streak += 1
            else:
                break
    
    return schemas.DashboardResponse(
        current_stress=current_stress,
        recent_check_ins=check_ins,
        coping_sessions_today=sessions,
        streak_days=max(streak, 1),
        last_check_in=last_ci
    )

@router.get("/analytics", response_model=schemas.AnalyticsResponse)
def get_analytics(period: str = Query("7d", pattern="^(7d|30d)$")):
    days = 7 if period == "7d" else 30
    
    history = []
    daily_avgs = []
    now = datetime.utcnow()
    for i in range(days, -1, -1):
        dt = now - timedelta(days=i)
        val = random.uniform(30.0, 80.0)
        history.append({"date": dt.isoformat(), "stress_score": val})
        daily_avgs.append({"date": dt.strftime("%Y-%m-%d"), "average": val})
        
    return schemas.AnalyticsResponse(
        stress_history=history,
        trigger_distribution={"work": 45, "personal": 25, "sleep": 20, "other": 10},
        recovery_trend={"trend": "improving", "value": -15.5},
        daily_averages=daily_avgs
    )

@router.post("/coping-session", response_model=schemas.CopingSessionResponse)
def log_coping_session(request: schemas.CopingSessionRequest, user: models.User = Depends(get_optional_user), db: Session = Depends(get_db)):
    session = models.CopingSession(
        user_id=user.id if user else 1,
        exercise_type=request.exercise_type,
        duration_seconds=request.duration_seconds,
        stress_before=request.stress_before,
        stress_after=request.stress_after,
        completed=request.completed
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/coping-sessions", response_model=List[schemas.CopingSessionResponse])
def get_coping_sessions(db: Session = Depends(get_db)):
    return db.query(models.CopingSession).order_by(models.CopingSession.created_at.desc()).all()

@router.post("/journal", response_model=schemas.JournalEntryResponse)
def create_journal(request: schemas.JournalEntryRequest, user: models.User = Depends(get_optional_user), db: Session = Depends(get_db)):
    entry = models.JournalEntry(
        user_id=user.id if user else 1,
        title=request.title,
        content=request.content,
        ai_summary="AI generated summary placeholder."
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/journal", response_model=List[schemas.JournalEntryResponse])
def list_journal(db: Session = Depends(get_db)):
    return db.query(models.JournalEntry).order_by(models.JournalEntry.created_at.desc()).all()

@router.get("/journal/{id}", response_model=schemas.JournalEntryResponse)
def get_journal(id: int, db: Session = Depends(get_db)):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    return entry

@router.put("/journal/{id}", response_model=schemas.JournalEntryResponse)
def update_journal(id: int, request: schemas.JournalEntryRequest, db: Session = Depends(get_db)):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    entry.title = request.title
    entry.content = request.content
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/journal/{id}")
def delete_journal(id: int, db: Session = Depends(get_db)):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}

@router.post("/demo/start", response_model=schemas.DemoStateResponse)
def start_demo():
    return demo_service.reset()

@router.post("/demo/advance", response_model=schemas.DemoStateResponse)
def advance_demo():
    return demo_service.advance_stage()

@router.post("/demo/reset", response_model=schemas.DemoStateResponse)
def reset_demo():
    return demo_service.reset()

@router.get("/demo/state", response_model=schemas.DemoStateResponse)
def get_demo_state():
    return demo_service.get_current_state()

@router.get("/settings")
def get_settings():
    return {
        "ai_mode": settings.AI_MODE,
        "demo_mode": False,
        "monitoring_enabled": True,
        "consent_given": True,
    }

@router.put("/settings")
def update_settings(payload: Dict[str, Any]):
    if "ai_mode" in payload:
        settings.AI_MODE = str(payload["ai_mode"])
    return {"message": "Settings updated", **payload}

@router.delete("/user/data")
def delete_user_data(db: Session = Depends(get_db)):
    db.query(models.JournalEntry).delete()
    db.query(models.CopingSession).delete()
    db.query(models.SafetyEvent).delete()
    db.query(models.Conversation).delete()
    db.query(models.StressReading).delete()
    db.query(models.CheckIn).delete()
    db.commit()
    return {"message": "User data cleared"}

# Host / Admin Portal Endpoints (Password: Meet@2006)
class HostLoginRequest(schemas.BaseModel):
    password: str

@router.post("/host/login")
def host_login(req: HostLoginRequest):
    if req.password == "Meet@2006":
        return {
            "authenticated": True,
            "role": "Host / Team Lead",
            "team": "INSIGHT-X",
            "token": "host_meet_2006_auth",
            "message": "Host authentication successful"
        }
    raise HTTPException(status_code=401, detail="Invalid host password")

@router.get("/host/stats")
def get_host_stats(db: Session = Depends(get_db)):
    return {
        "team": "INSIGHT-X",
        "lead_email": "itsmeetbuddy1@gmail.com",
        "total_checkins": db.query(models.CheckIn).count(),
        "total_coping_sessions": db.query(models.CopingSession).count(),
        "total_safety_events": db.query(models.SafetyEvent).count(),
        "total_conversations": db.query(models.Conversation).count(),
        "total_journal_entries": db.query(models.JournalEntry).count(),
        "ai_mode": settings.AI_MODE,
        "current_demo_stage": demo_service.stage,
        "system_status": "ONLINE (Production Ready)"
    }

@router.post("/host/trigger-stage/{stage_num}")
def host_trigger_stage(stage_num: int):
    if 1 <= stage_num <= 5:
        demo_service.stage = stage_num
        return demo_service.get_current_state()
    raise HTTPException(status_code=400, detail="Stage must be between 1 and 5")
