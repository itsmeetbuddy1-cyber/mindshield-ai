from typing import Dict, Any, Optional, List

# Standard weight allocation (must sum to 1.0)
DEFAULT_WEIGHTS = {
    "self_report": 0.25,
    "text_analysis": 0.30,
    "interaction_patterns": 0.20,
    "voice_features": 0.15,
    "camera_features": 0.10
}

def fuse_signals(
    self_report_score: Optional[float] = None,
    text_score: Optional[float] = None,
    voice_score: Optional[float] = None,
    camera_score: Optional[float] = None,
    interaction_score: Optional[float] = None,
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Fuse multimodal stress signals into a single score with explainability.
    Dynamically normalizes weights across whatever signals are currently available.
    All incoming scores should be 0.0 to 100.0 (or 0.0 to 1.0 which will be auto-scaled to 100).
    """
    w_config = weights or DEFAULT_WEIGHTS.copy()
    
    # Scale any 0-1 scores to 0-100
    def normalize_score(s: Optional[float]) -> Optional[float]:
        if s is None:
            return None
        val = float(s)
        if 0.0 <= val <= 1.0 and val > 0.0:
            # Check if it was fractional (e.g. 0.75 -> 75.0)
            # If exactly 1.0, could be 1/10 self report or 1/100, but in 0-100 system 1 is 1.
            return val * 100.0
        return max(0.0, min(100.0, val))

    s_self = normalize_score(self_report_score)
    s_text = normalize_score(text_score)
    s_voice = normalize_score(voice_score)
    s_camera = normalize_score(camera_score)
    s_interaction = normalize_score(interaction_score)
    
    raw_signals = [
        ("self_report", s_self, "Self-Reported Stress", w_config.get("self_report", 0.25)),
        ("text_analysis", s_text, "Text & Language Analysis", w_config.get("text_analysis", 0.30)),
        ("interaction_patterns", s_interaction, "Interaction Dynamics", w_config.get("interaction_patterns", 0.20)),
        ("voice_features", s_voice, "Voice Acoustic Cues", w_config.get("voice_features", 0.15)),
        ("camera_features", s_camera, "Visual Interaction Signal", w_config.get("camera_features", 0.10))
    ]
    
    available_signals = [s for s in raw_signals if s[1] is not None]
    total_active_weight = sum(s[3] for s in available_signals)
    
    if total_active_weight == 0.0:
        # Fallback if literally no signals provided
        return {
            "fused_score": 35.0,
            "category": "calm",
            "confidence": 0.3,
            "signals_used": [],
            "signals_available": 0,
            "signals_total": 5,
            "signal_contributions": [],
            "explanations": ["Default baseline: No active signals detected."],
            "recommendation": "Maintain your current routine."
        }
    
    weighted_sum = 0.0
    signal_contributions = []
    signals_used = []
    
    for key, score, label, base_weight in raw_signals:
        if score is not None:
            # Normalized effective weight
            effective_weight = base_weight / total_active_weight
            points_contributed = score * effective_weight
            weighted_sum += points_contributed
            signals_used.append(key)
            
            signal_contributions.append({
                "signal": key,
                "label": label,
                "score": round(score, 1),
                "base_weight": round(base_weight * 100, 1),
                "effective_weight": round(effective_weight * 100, 1),
                "contribution": round(points_contributed, 1),
                "available": True
            })
        else:
            signal_contributions.append({
                "signal": key,
                "label": label,
                "score": None,
                "base_weight": round(base_weight * 100, 1),
                "effective_weight": 0.0,
                "contribution": 0.0,
                "available": False
            })
            
    fused_score = round(max(0.0, min(100.0, weighted_sum)), 1)
    
    # Classify
    if fused_score < 35.0:
        category = "calm"
    elif fused_score < 55.0:
        category = "mild"
    elif fused_score < 75.0:
        category = "elevated"
    else:
        category = "high"
        
    confidence = round(min(0.98, 0.4 + (len(signals_used) / 5.0) * 0.58), 2)
    
    # Explainable reasons
    explanations = []
    active_sorted = sorted([s for s in signal_contributions if s["available"]], key=lambda x: x["contribution"], reverse=True)
    
    for s in active_sorted:
        if s["score"] >= 70:
            explanations.append(f"{s['label']} indicates heightened stress ({s['score']:.0f}/100), contributing {s['contribution']:.1f} pts.")
        elif s["score"] <= 30:
            explanations.append(f"{s['label']} shows calm baseline ({s['score']:.0f}/100), reducing overall stress indicator.")
        else:
            explanations.append(f"{s['label']} is in moderate range ({s['score']:.0f}/100, {s['contribution']:.1f} pts).")
            
    return {
        "fused_score": fused_score,
        "category": category,
        "confidence": confidence,
        "signals_used": signals_used,
        "signals_available": len(signals_used),
        "signals_total": 5,
        "signal_contributions": signal_contributions,
        "explanations": explanations,
        "recommendation": _get_recommendation(category)
    }

def _get_recommendation(category: str) -> str:
    recs = {
        "calm": "You appear to be in a grounded, calm state. A brief mindful pause can help preserve this balance.",
        "mild": "Mild stress indicators noted. Try a 2-minute reset or 4-6 breathing pacing.",
        "elevated": "Elevated stress detected. Step away from stressors and engage in guided 5-4-3-2-1 grounding.",
        "high": "High distress indicators. We recommend taking an immediate pause with guided cooling or reaching out for support."
    }
    return recs.get(category, recs["mild"])
