# MindShield AI

> **"Your Mind. Your Signal. Your Shield."**

An AI-powered real-time stress and emotional-distress support platform that analyzes self-reported signals, estimates stress indicators, provides personalized coping interventions, tracks recovery patterns, and detects safety-risk language.

**Team**: **INSIGHT-X**  
**Contact Email**: [itsmeetbuddy1@gmail.com](mailto:itsmeetbuddy1@gmail.com)  
**Hackathon**: Smart India Hackathon (SIH 2026)

> **IMPORTANT DISCLAIMER**: MindShield AI is a supportive wellness platform, **NOT** a medical diagnostic tool. It does not diagnose PTSD, clinical depression, anxiety disorders, or psychological trauma.

---

## 🏆 Smart India Hackathon (SIH) Presentation Overview

### Problem Statement
Traditional mental-health resources are often reactive, difficult to access during moments of acute distress, and lack continuous feedback loops. Users experiencing sudden cognitive overload or emotional spikes rarely have immediate, non-intrusive tools to de-escalate.

### The MindShield Solution
MindShield AI bridges detection and intervention into a continuous **Closed-Loop Wellness Architecture**:
$$\text{Detect} \longrightarrow \text{Understand} \longrightarrow \text{Support} \longrightarrow \text{Recover} \longrightarrow \text{Learn}$$

---

## ⚡ 3-Minute SIH Demo Flow

1. **Landing Page**: Showcase the animated AI shield visualization, real-time signal flow, and safety disclosure.
2. **Real-Time Check-In / Onboarding**: Complete a 3-step mood check (`/onboarding` or `/checkin`).
3. **Live Dashboard**: View the dynamic Stress Index circular gauge (0–100) and live updating signal telemetry (Sentiment, Intensity, Response Pattern).
4. **Launch SIH Live Demo Mode (`/demo`)**:
   - **Stage 1 (Calm)**: Baseline stress at 32.
   - **Stage 2 (Trigger)**: Stress increases to 47.
   - **Stage 3 (Escalation)**: Distress indicators elevate to 63.
   - **Stage 4 (Intervention Triggered)**: Stress hits 78 (High). Shield AI automatically surfaces empathetic intervention with a **"Start 60-Second Reset"** prompt.
   - **Stage 5 (Recovery)**: Guided breathing executes, stress gradually drops (78 → 69 → 61 → 53), and **"RECOVERY DETECTED"** triggers with celebration particles.
5. **Shield AI Assistant (`/assistant`)**: Demonstrate safety-aware chat. Typing high-distress statements triggers emergency resources (988 Lifeline, Crisis Text Line).
6. **Coping Toolkit & Guided Breathing (`/toolkit`, `/breathing/box`)**: Interactive 4-4-6 visual breathing pacer with before/after comparison.
7. **Analytics (`/analytics`) & Insights (`/insights`)**: Interactive Recharts graphs showing 7-day/30-day stress trajectories, trigger distributions, and coping efficacy.
8. **Judge Dashboard (`/judge`)**: Visual innovation pipeline, microservices architecture overview, and privacy safeguards.

---

## 🛠️ Architecture & Tech Stack

```
mindshield-ai/
├── frontend/                     # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── layouts/             # MainLayout (Sidebar & Mobile Nav)
│   │   ├── pages/               # Landing, Dashboard, Assistant, Demo, etc.
│   │   ├── services/            # Axios API Client
│   │   ├── types/               # Strict TypeScript definitions
│   │   └── index.css            # Tailwind CSS & Glassmorphism design system
├── backend/                      # Python FastAPI
│   ├── app/
│   │   ├── api/routes.py        # RESTful API Endpoints
│   │   ├── core/                # Database configuration & App Settings
│   │   ├── models/models.py     # SQLAlchemy ORM Models (SQLite/PostgreSQL)
│   │   ├── schemas/schemas.py   # Pydantic v2 Request/Response Schemas
│   │   └── services/            # AI Engine, Stress Analyzer, Safety Engine
│   ├── run.py                   # Uvicorn Server Entry Point
│   └── requirements.txt         # Backend Dependencies
```

### Technology Highlights
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy, Pydantic v2.
- **Database**: SQLite (built-in, zero configuration) with seamless migration path to PostgreSQL.
- **AI Service**: Dual-mode engine supporting deterministic high-performance Mock AI and real LLM API modes with graceful fallback.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup & Launch
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*The FastAPI server will start on `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

### 2. Frontend Setup & Launch
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start on `http://localhost:3000`.*

---

## 🔒 Privacy & Safety Core Principles
- **No Diagnostic Claims**: The AI provides supportive language, not clinical diagnoses.
- **Local-First Processing**: Sensitive self-reports and journal entries are kept securely within user-controlled storage.
- **Safety First**: Immediate escalation to human crisis hotlines (e.g., 988) whenever high-risk language is identified.
- **Data Sovereignty**: Instant "Export My Data" and "Delete All Data" controls in the Privacy Center.
