from typing import Dict, Any, Optional, List

DEFAULT_WEIGHTS = {
    "self_report": 0.30,
    "text_analysis": 0.25,
    "voice_features": 0.15,
    "camera_features": 0.10,
    "interaction_patterns": 0.20
}

def fuse_signals(
    self_report_score: Optional[float] = None,
    text_score: Optional[float] = None,
    voice_score: Optional[float] = None,
    camera_score: Optional[float] = None,
    interaction_score: Optional[float] = None,
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """Fuse multimodal stress signals into a single score with explanations."""
    w = weights or DEFAULT_WEIGHTS.copy()
    
    signals_used = []
    total_weight = 0.0
    weighted_sum = 0.0
    signal_contributions = []
    
    signal_data = [
        ("self_report", self_report_score, "Self-reported stress level"),
        ("text_analysis", text_score, "Text-based stress analysis"),
        ("voice_features", voice_score, "Voice pattern analysis"),
        ("camera_features", camera_score, "Facial expression analysis"),
        ("interaction_patterns", interaction_score, "Interaction behavior patterns")
    ]
    
    for key, score, label in signal_data:
        if score is not None:
            weight = w.get(key, 0.0)
            contribution = score * weight
            weighted_sum += contribution
            total_weight += weight
            signals_used.append(key)
            signal_contributions.append({
                "signal": key,
                "label": label,
                "score": round(score, 1),
                "weight": round(weight * 100, 1),
                "contribution": round(contribution, 1),
                "available": True
            })
        else:
            signal_contributions.append({
                "signal": key,
                "label": label if key != "self_report" else "Self-reported stress level",
                "score": None,
                "weight": round(w.get(key, 0.0) * 100, 1),
                "contribution": 0.0,
                "available": False
            })
    
    # Normalize score by actual weights used
    fused_score = (weighted_sum / total_weight * 100) if total_weight > 0 else 50.0
    fused_score = max(0, min(100, fused_score))
    
    # Category
    if fused_score < 30:
        category = "calm"
    elif fused_score < 50:
        category = "mild"
    elif fused_score < 70:
        category = "elevated"
    else:
        category = "high"
    
    # Confidence based on how many signals we have
    confidence = len(signals_used) / 5.0 * 0.95
    
    # Explanations
    explanations = []
    sorted_contributions = sorted([s for s in signal_contributions if s["available"]], 
                                   key=lambda x: x["contribution"], reverse=True)
    for s in sorted_contributions:
        if s["contribution"] > 5:
            explanations.append(f"{s['label']} contributed {s['contribution']:.0f}% to overall score (raw: {s['score']:.0f}/100)")
    
    return {
        "fused_score": round(fused_score, 1),
        "category": category,
        "confidence": round(confidence, 3),
        "signals_used": signals_used,
        "signals_available": len(signals_used),
        "signals_total": 5,
        "signal_contributions": signal_contributions,
        "explanations": explanations,
        "recommendation": _get_recommendation(category)
    }

def _get_recommendation(category: str) -> str:
    recs = {
        "calm": "You're in a good state. Consider maintaining your routine with a light mindfulness exercise.",
        "mild": "Mild stress detected. A short break or the 4-7-8 breathing technique could help.",
        "elevated": "Elevated stress levels. Step away from stressors and try a guided grounding exercise.",
        "high": "High stress detected. An immediate pause is recommended. Try our emergency cooling technique or reach out for support."
    }
    return recs.get(category, recs["mild"])
