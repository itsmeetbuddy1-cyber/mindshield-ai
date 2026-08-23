from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    preferences = Column(JSON, default={})

class CheckIn(Base):
    __tablename__ = "check_ins"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    mood = Column(String)
    stressor = Column(String)
    stress_level = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class StressReading(Base):
    __tablename__ = "stress_readings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    stress_score = Column(Float)
    category = Column(String)
    confidence = Column(Float)
    signals = Column(JSON)
    recommended_action = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    role = Column(String)
    content = Column(Text)
    safety_level = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SafetyEvent(Base):
    __tablename__ = "safety_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    risk_level = Column(String)
    trigger_text = Column(Text)
    response_given = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CopingSession(Base):
    __tablename__ = "coping_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_type = Column(String)
    duration_seconds = Column(Integer)
    stress_before = Column(Integer)
    stress_after = Column(Integer)
    completed = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    ai_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
