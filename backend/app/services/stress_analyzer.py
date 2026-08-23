import random
from typing import Dict, Any, Tuple

def analyze_stress(signals: Dict[str, Any]) -> Tuple[float, str, float, Dict[str, Any], str]:
    # Weights for different signals
    weights = {
        "self_reported": 0.4,
        "sentiment": 0.3,
        "intensity": 0.2,
        "latency": 0.1
    }
    
    score = 0.0
    
    self_reported = signals.get("self_reported_stress")
    if self_reported is not None:
        score += (self_reported * 10) * weights["self_reported"]
    else:
        score += 50 * weights["self_reported"]
        
    sentiment = signals.get("sentiment")
    if sentiment is not None:
        # Sentiment usually -1 (negative) to 1 (positive)
        # Convert to 0-100 where negative is high stress
        sentiment_score = ((1 - sentiment) / 2) * 100
        score += sentiment_score * weights["sentiment"]
    else:
        score += 50 * weights["sentiment"]
        
    intensity = signals.get("interaction_intensity")
    if intensity is not None:
        # High intensity = higher stress (0 to 1 scale)
        score += (intensity * 100) * weights["intensity"]
    else:
        score += 30 * weights["intensity"]
        
    latency = signals.get("response_latency")
    if latency is not None:
        # Low latency = higher stress / impulsive (0 to 1 scale inverted)
        score += ((1 - latency) * 100) * weights["latency"]
    else:
        score += 30 * weights["latency"]
        
    # Add a bit of realistic variance
    score += random.uniform(-5, 5)
    score = max(0.0, min(100.0, score))
    
    if score < 40:
        category = "calm"
        action = "Maintain current routines. Consider a light mindfulness exercise."
    elif score < 60:
        category = "mild"
        action = "Take a short break. Try the 4-7-8 breathing technique."
    elif score < 80:
        category = "elevated"
        action = "Step away from stressors. Engage in a guided grounding exercise."
    else:
        category = "high"
        action = "Immediate pause recommended. Use the emergency cooling technique or contact support."
        
    confidence = random.uniform(0.75, 0.95)
    
    return score, category, confidence, signals, action
