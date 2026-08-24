"""
Multimodal Stress & Anxiety Scoring Engine for MindShield AI.

Mathematical Framework:
1. Voice Score (0-100):
   Voice Score = 0.30 * Speaking-rate score + 0.25 * Pause score + 0.25 * Pitch score + 0.20 * Loudness score
2. Behavior Score (0-100):
   Behavior Score = 0.25 * Blink deviation + 0.25 * Facial-tension + 0.25 * Movement/restlessness + 0.25 * Posture deviation
3. Physiological Score (0-100):
   Physiological Score = 0.40 * HR deviation + 0.40 * HRV deviation + 0.20 * Breathing deviation
4. Self-report Score (0-100):
   Self-report Score = answer * 25 (0-4 scale: 0->0, 1->25, 2->50, 3->75, 4->100)
5. Final Score (0-100):
   Final Score = 0.30 * Voice Score + 0.20 * Behavior Score + 0.30 * Physiological Score + 0.20 * Self-report Score

Dynamic Missing-Data Handling:
   If any modality is missing, available weights are renormalized to sum to 1.0.
   Never invents sensor data. If no modalities are available, returns 'Insufficient data'.
   Non-diagnostic AI estimation disclaimer attached to all outputs.
"""

from typing import Dict, Any, Optional, List, Tuple

# Base Modality Weights (Sum = 1.0)
BASE_MODALITY_WEIGHTS = {
    "voice": 0.30,
    "behavior": 0.20,
    "physiological": 0.30,
    "self_report": 0.20
}

# Sub-component Weights
VOICE_SUB_WEIGHTS = {
    "speaking_rate": 0.30,
    "pause": 0.25,
    "pitch": 0.25,
    "loudness": 0.20
}

BEHAVIOR_SUB_WEIGHTS = {
    "blink": 0.25,
    "facial_tension": 0.25,
    "movement": 0.25,
    "posture": 0.25
}

PHYSIOLOGICAL_SUB_WEIGHTS = {
    "hr_deviation": 0.40,
    "hrv_deviation": 0.40,
    "breathing_deviation": 0.20
}

# Standard Healthy Baseline References
DEFAULT_BASELINES = {
    "resting_hr": 72.0,            # beats per minute
    "resting_hrv": 55.0,           # SDNN in ms
    "breathing_rate": 14.0,        # breaths per minute
    "speaking_rate_wpm": 130.0,    # words per minute
    "pitch_hz": 150.0,             # fundamental frequency in Hz
    "pause_ratio": 0.15,           # fraction of total speech spent in pauses
    "loudness_db": 50.0,           # volume in dB
    "blink_rate_cpm": 18.0,        # blinks per minute
    "movement_energy": 15.0,       # baseline fidget/movement level (0-100)
    "posture_drift": 10.0          # baseline posture variance (0-100)
}


def clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Clamps a numeric value between min_val and max_val."""
    return max(min_val, min(max_val, float(value)))


def normalize_deviation(
    current: Optional[float], 
    baseline: float, 
    max_expected_delta: float
) -> Optional[float]:
    """
    Normalizes a sensor metric's deviation from baseline to a 0-100 scale.
    """
    if current is None:
        return None
    
    delta = abs(float(current) - float(baseline))
    normalized = (delta / float(max_expected_delta)) * 100.0
    return clamp(normalized, 0.0, 100.0)


# ====================================================================
# 1. VOICE SCORE CALCULATION
# ====================================================================
def calculate_voice_score(
    speaking_rate_score: Optional[float] = None,
    pause_score: Optional[float] = None,
    pitch_score: Optional[float] = None,
    loudness_score: Optional[float] = None,
    raw_metrics: Optional[Dict[str, Any]] = None,
    baseline: Optional[Dict[str, float]] = None
) -> Tuple[Optional[float], Dict[str, Any]]:
    """
    Voice Score = 0.30 * Speaking-rate + 0.25 * Pause + 0.25 * Pitch + 0.20 * Loudness.
    All inputs normalized to 0-100.
    """
    base = baseline or DEFAULT_BASELINES
    
    # If raw metrics provided, derive 0-100 scores via baseline deviations
    if raw_metrics:
        if speaking_rate_score is None and "speaking_rate_wpm" in raw_metrics:
            speaking_rate_score = normalize_deviation(
                raw_metrics.get("speaking_rate_wpm"), 
                base.get("speaking_rate_wpm", 130.0), 
                max_expected_delta=60.0
            )
        if pause_score is None and "pause_ratio" in raw_metrics:
            pause_score = normalize_deviation(
                raw_metrics.get("pause_ratio"), 
                base.get("pause_ratio", 0.15), 
                max_expected_delta=0.35
            )
        if pitch_score is None and "pitch_hz" in raw_metrics:
            pitch_score = normalize_deviation(
                raw_metrics.get("pitch_hz"), 
                base.get("pitch_hz", 150.0), 
                max_expected_delta=80.0
            )
        if loudness_score is None and "loudness_db" in raw_metrics:
            loudness_score = normalize_deviation(
                raw_metrics.get("loudness_db"), 
                base.get("loudness_db", 50.0), 
                max_expected_delta=30.0
            )
        # Direct fallback for aggregate voice activity from frontend
        if speaking_rate_score is None and "voice_activity" in raw_metrics:
            speaking_rate_score = clamp(raw_metrics["voice_activity"])
        if loudness_score is None and "rms" in raw_metrics:
            loudness_score = clamp(raw_metrics["rms"] * 100.0)

    sub_scores = {
        "speaking_rate": clamp(speaking_rate_score) if speaking_rate_score is not None else None,
        "pause": clamp(pause_score) if pause_score is not None else None,
        "pitch": clamp(pitch_score) if pitch_score is not None else None,
        "loudness": clamp(loudness_score) if loudness_score is not None else None,
    }

    available_subs = {k: v for k, v in sub_scores.items() if v is not None}
    
    if not available_subs:
        return None, {
            "sub_components": sub_scores,
            "available": False,
            "detail": "No voice features available"
        }

    # Dynamic sub-weight rebalancing
    active_weight_sum = sum(VOICE_SUB_WEIGHTS[k] for k in available_subs)
    weighted_sum = sum(available_subs[k] * (VOICE_SUB_WEIGHTS[k] / active_weight_sum) for k in available_subs)
    final_voice = clamp(weighted_sum, 0.0, 100.0)

    return round(final_voice, 2), {
        "score": round(final_voice, 2),
        "sub_components": sub_scores,
        "available": True,
        "active_subcomponents": list(available_subs.keys())
    }


# ====================================================================
# 2. BEHAVIOR SCORE CALCULATION
# ====================================================================
def calculate_behavior_score(
    blink_deviation: Optional[float] = None,
    facial_tension: Optional[float] = None,
    movement_restlessness: Optional[float] = None,
    posture_deviation: Optional[float] = None,
    raw_metrics: Optional[Dict[str, Any]] = None,
    baseline: Optional[Dict[str, float]] = None
) -> Tuple[Optional[float], Dict[str, Any]]:
    """
    Behavior Score = 0.25 * Blink + 0.25 * Facial-tension + 0.25 * Movement + 0.25 * Posture.
    All inputs normalized to 0-100.
    """
    base = baseline or DEFAULT_BASELINES

    if raw_metrics:
        if blink_deviation is None and "blink_rate_cpm" in raw_metrics:
            blink_deviation = normalize_deviation(
                raw_metrics.get("blink_rate_cpm"), 
                base.get("blink_rate_cpm", 18.0), 
                max_expected_delta=20.0
            )
        if movement_restlessness is None and "motion_energy" in raw_metrics:
            movement_restlessness = normalize_deviation(
                raw_metrics.get("motion_energy"), 
                base.get("movement_energy", 15.0), 
                max_expected_delta=60.0
            )
        if posture_deviation is None and "posture_drift" in raw_metrics:
            posture_deviation = normalize_deviation(
                raw_metrics.get("posture_drift"), 
                base.get("posture_drift", 10.0), 
                max_expected_delta=50.0
            )
        if facial_tension is None and "facial_tension_index" in raw_metrics:
            facial_tension = clamp(raw_metrics.get("facial_tension_index"))
        # Direct camera stress fallback from computer vision module
        if movement_restlessness is None and "visual_activity" in raw_metrics:
            movement_restlessness = clamp(raw_metrics["visual_activity"])

    sub_scores = {
        "blink": clamp(blink_deviation) if blink_deviation is not None else None,
        "facial_tension": clamp(facial_tension) if facial_tension is not None else None,
        "movement": clamp(movement_restlessness) if movement_restlessness is not None else None,
        "posture": clamp(posture_deviation) if posture_deviation is not None else None,
    }

    available_subs = {k: v for k, v in sub_scores.items() if v is not None}

    if not available_subs:
        return None, {
            "sub_components": sub_scores,
            "available": False,
            "detail": "No behavioral indicators available"
        }

    active_weight_sum = sum(BEHAVIOR_SUB_WEIGHTS[k] for k in available_subs)
    weighted_sum = sum(available_subs[k] * (BEHAVIOR_SUB_WEIGHTS[k] / active_weight_sum) for k in available_subs)
    final_behavior = clamp(weighted_sum, 0.0, 100.0)

    return round(final_behavior, 2), {
        "score": round(final_behavior, 2),
        "sub_components": sub_scores,
        "available": True,
        "active_subcomponents": list(available_subs.keys())
    }


# ====================================================================
# 3. PHYSIOLOGICAL SCORE CALCULATION
# ====================================================================
def calculate_physiological_score(
    hr_deviation: Optional[float] = None,
    hrv_deviation: Optional[float] = None,
    breathing_deviation: Optional[float] = None,
    raw_metrics: Optional[Dict[str, Any]] = None,
    baseline: Optional[Dict[str, float]] = None
) -> Tuple[Optional[float], Dict[str, Any]]:
    """
    Physiological Score = 0.40 * HR deviation + 0.40 * HRV deviation + 0.20 * Breathing deviation.
    All inputs normalized to 0-100.
    """
    base = baseline or DEFAULT_BASELINES

    if raw_metrics:
        if hr_deviation is None and "heart_rate_bpm" in raw_metrics:
            hr_val = raw_metrics.get("heart_rate_bpm")
            base_hr = base.get("resting_hr", 72.0)
            if hr_val is not None:
                delta_hr = max(0.0, float(hr_val) - float(base_hr))
                hr_deviation = clamp((delta_hr / 35.0) * 100.0)
                
        if hrv_deviation is None and "hrv_ms" in raw_metrics:
            hrv_val = raw_metrics.get("hrv_ms")
            base_hrv = base.get("resting_hrv", 55.0)
            if hrv_val is not None:
                drop_hrv = max(0.0, float(base_hrv) - float(hrv_val))
                hrv_deviation = clamp((drop_hrv / 30.0) * 100.0)
                
        if breathing_deviation is None and "respiration_rate" in raw_metrics:
            resp_val = raw_metrics.get("respiration_rate")
            base_resp = base.get("breathing_rate", 14.0)
            breathing_deviation = normalize_deviation(resp_val, base_resp, max_expected_delta=12.0)

    sub_scores = {
        "hr_deviation": clamp(hr_deviation) if hr_deviation is not None else None,
        "hrv_deviation": clamp(hrv_deviation) if hrv_deviation is not None else None,
        "breathing_deviation": clamp(breathing_deviation) if breathing_deviation is not None else None,
    }

    available_subs = {k: v for k, v in sub_scores.items() if v is not None}

    if not available_subs:
        return None, {
            "sub_components": sub_scores,
            "available": False,
            "detail": "No physiological telemetry available"
        }

    active_weight_sum = sum(PHYSIOLOGICAL_SUB_WEIGHTS[k] for k in available_subs)
    weighted_sum = sum(available_subs[k] * (PHYSIOLOGICAL_SUB_WEIGHTS[k] / active_weight_sum) for k in available_subs)
    final_physio = clamp(weighted_sum, 0.0, 100.0)

    return round(final_physio, 2), {
        "score": round(final_physio, 2),
        "sub_components": sub_scores,
        "available": True,
        "active_subcomponents": list(available_subs.keys())
    }


# ====================================================================
# 4. SELF-REPORT SCORE CALCULATION
# ====================================================================
def calculate_self_report_score(
    answer: Optional[float], 
    scale_type: str = "0-4"
) -> Tuple[Optional[float], Dict[str, Any]]:
    """
    Self-report Score = answer * 25 (for 0-4 scale).
    0 -> 0, 1 -> 25, 2 -> 50, 3 -> 75, 4 -> 100.
    For other scales (e.g. 1-10 or 1-5), normalizes proportionally to 0-100.
    """
    if answer is None:
        return None, {
            "available": False,
            "detail": "No self-reported questionnaire provided"
        }

    val = float(answer)

    if scale_type == "0-4":
        # Exact requested formula: answer * 25
        score = clamp(val * 25.0, 0.0, 100.0)
    elif scale_type == "1-10":
        score = clamp(((val - 1.0) / 9.0) * 100.0, 0.0, 100.0)
    elif scale_type == "1-5":
        score = clamp(((val - 1.0) / 4.0) * 100.0, 0.0, 100.0)
    elif scale_type == "0-100":
        score = clamp(val, 0.0, 100.0)
    else:
        if val <= 4.0:
            score = clamp(val * 25.0, 0.0, 100.0)
        elif val <= 10.0:
            score = clamp(val * 10.0, 0.0, 100.0)
        else:
            score = clamp(val, 0.0, 100.0)

    return round(score, 2), {
        "score": round(score, 2),
        "raw_answer": val,
        "scale_type": scale_type,
        "available": True
    }


# ====================================================================
# 5. MULTIMODAL FUSION & WEIGHT RENORMALIZATION
# ====================================================================
def compute_multimodal_stress(
    voice_score: Optional[float] = None,
    behavior_score: Optional[float] = None,
    physiological_score: Optional[float] = None,
    self_report_score: Optional[float] = None,
    voice_inputs: Optional[Dict[str, Any]] = None,
    behavior_inputs: Optional[Dict[str, Any]] = None,
    physiological_inputs: Optional[Dict[str, Any]] = None,
    self_report_val: Optional[float] = None,
    self_report_scale: str = "0-4",
    user_baseline: Optional[Dict[str, float]] = None,
    custom_weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Computes final multimodal stress estimate:
    FINAL SCORE = 0.30 * Voice + 0.20 * Behavior + 0.30 * Physiological + 0.20 * Self-report.
    
    Dynamically renormalizes active weights when modalities are missing.
    Never fabricates sensor data.
    """
    base = user_baseline or DEFAULT_BASELINES
    weights = custom_weights or BASE_MODALITY_WEIGHTS.copy()

    # Step 1: Compute Modality Sub-Scores if raw input dicts provided
    v_score, v_meta = (voice_score, {"score": voice_score, "available": voice_score is not None})
    if voice_inputs is not None or voice_score is None:
        v_res, v_info = calculate_voice_score(
            speaking_rate_score=voice_inputs.get("speaking_rate") if voice_inputs else None,
            pause_score=voice_inputs.get("pause") if voice_inputs else None,
            pitch_score=voice_inputs.get("pitch") if voice_inputs else None,
            loudness_score=voice_inputs.get("loudness") if voice_inputs else None,
            raw_metrics=voice_inputs,
            baseline=base
        )
        if v_res is not None:
            v_score, v_meta = v_res, v_info

    b_score, b_meta = (behavior_score, {"score": behavior_score, "available": behavior_score is not None})
    if behavior_inputs is not None or behavior_score is None:
        b_res, b_info = calculate_behavior_score(
            blink_deviation=behavior_inputs.get("blink") if behavior_inputs else None,
            facial_tension=behavior_inputs.get("facial_tension") if behavior_inputs else None,
            movement_restlessness=behavior_inputs.get("movement") if behavior_inputs else None,
            posture_deviation=behavior_inputs.get("posture") if behavior_inputs else None,
            raw_metrics=behavior_inputs,
            baseline=base
        )
        if b_res is not None:
            b_score, b_meta = b_res, b_info

    p_score, p_meta = (physiological_score, {"score": physiological_score, "available": physiological_score is not None})
    if physiological_inputs is not None or physiological_score is None:
        p_res, p_info = calculate_physiological_score(
            hr_deviation=physiological_inputs.get("hr_deviation") if physiological_inputs else None,
            hrv_deviation=physiological_inputs.get("hrv_deviation") if physiological_inputs else None,
            breathing_deviation=physiological_inputs.get("breathing_deviation") if physiological_inputs else None,
            raw_metrics=physiological_inputs,
            baseline=base
        )
        if p_res is not None:
            p_score, p_meta = p_res, p_info

    sr_score, sr_meta = (self_report_score, {"score": self_report_score, "available": self_report_score is not None})
    if self_report_val is not None or self_report_score is None:
        sr_res, sr_info = calculate_self_report_score(
            answer=self_report_val if self_report_val is not None else self_report_score,
            scale_type=self_report_scale
        )
        if sr_res is not None:
            sr_score, sr_meta = sr_res, sr_info

    # Step 2: Assemble available modalities
    modalities_table = [
        ("voice", "Voice Acoustic Cues", v_score, weights.get("voice", 0.30), v_meta),
        ("behavior", "Behavioral Indicators", b_score, weights.get("behavior", 0.20), b_meta),
        ("physiological", "Physiological Telemetry", p_score, weights.get("physiological", 0.30), p_meta),
        ("self_report", "Self-Reported Assessment", sr_score, weights.get("self_report", 0.20), sr_meta),
    ]

    active_modalities = [m for m in modalities_table if m[2] is not None]
    total_active_weight = sum(m[3] for m in active_modalities)

    # Step 3: Handle Insufficient Data
    if total_active_weight == 0.0 or len(active_modalities) == 0:
        return {
            "status": "insufficient_data",
            "final_stress_score": None,
            "interpretation": "Insufficient data",
            "voice_score": None,
            "behavior_score": None,
            "physiological_score": None,
            "self_report_score": None,
            "modalities_available": [],
            "modalities_unavailable": ["voice", "behavior", "physiological", "self_report"],
            "contributions": [],
            "message": "Insufficient sensor or self-report signals available for estimation.",
            "is_medical_diagnosis": False,
            "disclaimer": "This is an AI-based wellness estimation, NOT a medical diagnosis.",
            "recommended_action": "Enable at least one sensor (microphone or camera) or complete a brief check-in."
        }

    # Step 4: Weight Renormalization & Score Synthesis
    weighted_final_sum = 0.0
    contributions = []
    available_keys = []
    unavailable_keys = []

    for key, label, score, base_w, meta in modalities_table:
        if score is not None:
            effective_weight = base_w / total_active_weight
            pts = score * effective_weight
            weighted_final_sum += pts
            available_keys.append(key)

            contributions.append({
                "modality": key,
                "label": label,
                "score": round(score, 1),
                "base_weight": round(base_w * 100, 1),
                "effective_weight": round(effective_weight * 100, 1),
                "contribution_points": round(pts, 1),
                "available": True,
                "details": meta
            })
        else:
            unavailable_keys.append(key)
            contributions.append({
                "modality": key,
                "label": label,
                "score": None,
                "base_weight": round(base_w * 100, 1),
                "effective_weight": 0.0,
                "contribution_points": 0.0,
                "available": False,
                "details": meta
            })

    final_score = clamp(weighted_final_sum, 0.0, 100.0)
    final_score_rounded = round(final_score, 1)

    # Step 5: Interpretation (Section 8)
    # 0–24 = Low, 25–49 = Mild, 50–74 = Moderate, 75–100 = High
    if final_score_rounded <= 24.0:
        interpretation = "Low"
        category = "calm"
    elif final_score_rounded <= 49.0:
        interpretation = "Mild"
        category = "mild"
    elif final_score_rounded <= 74.0:
        interpretation = "Moderate"
        category = "moderate"
    else:
        interpretation = "High"
        category = "high"

    # Step 6: Non-diagnostic supportive recommendations (Section 9)
    recommended_action = get_supportive_recommendation(final_score_rounded, interpretation)

    return {
        "status": "success",
        "voice_score": v_score,
        "behavior_score": b_score,
        "physiological_score": p_score,
        "self_report_score": sr_score,
        "final_stress_score": final_score_rounded,
        "interpretation": interpretation,
        "category": category,
        "confidence": round(min(0.98, 0.40 + (len(active_modalities) / 4.0) * 0.55), 2),
        "modalities_available": available_keys,
        "modalities_unavailable": unavailable_keys,
        "contributions": contributions,
        "is_medical_diagnosis": False,
        "disclaimer": "This is an AI-based wellness estimation, NOT a medical diagnosis.",
        "recommended_action": recommended_action
    }


def get_supportive_recommendation(score: float, interpretation: str) -> str:
    """Generates non-diagnostic actionable wellness support suggestions."""
    if interpretation == "Low":
        return "Estimated stress level is low. Your current indicators suggest balance. Maintain your current routines and consider a light mindful pause."
    elif interpretation == "Mild":
        return "Mild stress indicators noted. Try a 2-minute mindful reset, stay hydrated, and practice comfortable 4-6 pacing."
    elif interpretation == "Moderate":
        return "Estimated stress level is moderate. Behavioral and voice signals suggest heightened tension. Consider stepping away from immediate stressors and engaging in a guided grounding exercise."
    else:
        return "High distress indicators observed. Immediate pause recommended: practice guided box breathing, take a restful walk, talk to a trusted friend, or consult a healthcare professional if distress persists."
