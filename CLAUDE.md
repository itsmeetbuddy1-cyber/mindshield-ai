# MindShield AI — Developer & Assistant Guide (CLAUDE.md)

## 📌 Project Overview
- **Project Name:** MindShield AI (Next-Generation Multimodal Mental Wellness & AI Stress Coping Platform)
- **Team:** INSIGHT-X
- **Repository:** `https://github.com/itsmeetbuddy1-cyber/mindshield-ai.git`
- **Architecture:** Full-stack React + TypeScript + Tailwind CSS Frontend with a Python FastAPI + SQLite Backend.

---

## 🛠️ Development & Build Commands

### Backend (Python FastAPI)
- **Location:** `backend/`
- **Install Dependencies:** `pip install -r requirements.txt`
- **Run Dev Server:** `python run.py` or `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- **Run Backend Tests:** `python -m pytest tests/ -v` (27+ unit tests covering multimodal formulas, voice, text, auth)

### Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
- **Location:** `frontend/`
- **Install Dependencies:** `npm install`
- **Run Dev Server:** `npm run dev` (Runs on `http://localhost:5173`)
- **Build Production:** `npm run build` (TypeScript checks `tsc -b` and Vite bundles to `dist/`)

---

## 🧠 Key Modules & System Architecture

### 1. Multimodal Stress/Anxiety Scoring Engine
- **Backend:** `backend/app/services/multimodal_scoring.py`
- **Frontend:** `frontend/src/services/multimodalScoring.ts`
- **Mathematical Formulas:**
  - **Voice (30%):** $0.30 \times \text{Speaking rate} + 0.25 \times \text{Pause} + 0.25 \times \text{Pitch} + 0.20 \times \text{Loudness}$
  - **Behavior (20%):** $0.25 \times \text{Blink} + 0.25 \times \text{Facial tension} + 0.25 \times \text{Movement} + 0.25 \times \text{Posture}$
  - **Physiological (30%):** $0.40 \times \text{HR dev} + 0.40 \times \text{HRV dev} + 0.20 \times \text{Breathing dev}$
  - **Self-Report (20%):** $\text{Answer (0-4)} \times 25$
- **Missing Data:** Re-normalizes available weights dynamically.
- **Safety Standard:** Non-diagnostic, strictly AI-based wellness estimations.

### 2. Turn-by-Turn Two-Way Conversational Voice AI
- **Frontend Voice Assistant:** `frontend/src/pages/VoiceAssistantPage.tsx`
- **Audio & Speech Engine:** `frontend/src/services/voiceAssistant.ts`
- **Features:** Real browser Web Speech API (STT + TTS), turn-taking state machine, interruption handling, silence detection, 15+ turn conversation memory.

### 3. Authentication & User Flow
- **Backend Auth:** `backend/app/core/auth.py` (JWT + bcrypt), `backend/app/api/routes.py`
- **Frontend Auth Context:** `frontend/src/contexts/AuthContext.tsx`
- **Auth Page:** `frontend/src/pages/LoginPage.tsx` (Supports Login, Signup, Google OAuth, Forgot Password).
- **Session Flow:** Landing page is non-blocking (`/`); authenticated users can jump straight to `/dashboard`.

---

## 🛡️ Guidelines for Code Changes
1. **Never break existing features:** All 27 Pytest tests and Vite TypeScript builds must pass after any modifications.
2. **Preserve Theme & UI:** Dark navy gradient / clean card glassmorphism with blue/cyan accents.
3. **No hardcoded secrets:** Store API keys in `.env`.
