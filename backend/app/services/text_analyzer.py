import re
from typing import Dict, List, Any

# Emotion & Stress dictionaries
EMOTION_KEYWORDS = {
    "high_stress": [
        "overwhelmed", "cannot handle", "can't handle", "falling apart", "breakdown", "burnout", 
        "panicking", "panic", "exhausted", "suffocating", "too much", "drowning", "unbearable",
        "bahut tension", "sambhal nahi", "pareshan", "mushkil", "tav", "tanav", "ghabrahat",
        "chinta", "khub chinta", "thaki gayo", "thaki gai", "sahan nathi"
    ],
    "anxiety": [
        "anxious", "worry", "worried", "nervous", "scared", "fear", "dread", "uneasy", "tense", "restless",
        "heart racing", "trembling", "impending", "exam", "deadlines", "pariksha", "interview"
    ],
    "sadness": [
        "sad", "depressed", "unhappy", "miserable", "hopeless", "crying", "tears", "grief", "lonely", "alone",
        "udaas", "dukhi", "rone", "akela", "ekalata"
    ],
    "anger": [
        "angry", "furious", "mad", "frustrated", "annoyed", "irritated", "rage", "hate", "unfair", "gussa", "naraz"
    ],
    "calm_positive": [
        "calm", "relaxed", "peaceful", "fine", "good", "great", "happy", "wonderful", "grateful", "hopeful",
        "excited", "looking forward", "better", "relieved", "shant", "sukoon", "thik", "badhiya", "saras", "anand"
    ]
}

NEGATION_WORDS = ["not", "no", "never", "don't", "dont", "doesn't", "can't", "cant", "cannot", "won't", "wont", "isn't", "aren't", "nathi", "nahi", "na"]

def analyze_text_stress(text: str) -> Dict[str, Any]:
    """Analyze text for stress indicators with dynamic scoring."""
    t_clean = text.lower().strip()
    words = re.findall(r'\b[\w\']+\b', t_clean)
    word_count = len(words)
    
    if word_count == 0:
        return {
            "sentiment_score": 0.0,
            "detected_emotions": [],
            "linguistic_markers": {"word_count": 0},
            "stress_indicators": [],
            "text_stress_score": 35.0,
            "confidence": 0.3
        }
    
    # 1. Count keyword matches
    high_stress_hits = sum(1 for kw in EMOTION_KEYWORDS["high_stress"] if kw in t_clean)
    anxiety_hits = sum(1 for kw in EMOTION_KEYWORDS["anxiety"] if kw in t_clean)
    sadness_hits = sum(1 for kw in EMOTION_KEYWORDS["sadness"] if kw in t_clean)
    anger_hits = sum(1 for kw in EMOTION_KEYWORDS["anger"] if kw in t_clean)
    positive_hits = sum(1 for kw in EMOTION_KEYWORDS["calm_positive"] if kw in t_clean)
    
    negation_count = sum(1 for w in words if w in NEGATION_WORDS)
    first_person_count = sum(1 for w in words if w in ["i", "me", "my", "mine", "myself", "i'm", "im", "i've", "ive", "hun", "hu", "mane", "mari", "mera", "meri"])
    exclamation_count = text.count("!")
    caps_count = sum(1 for w in text.split() if w.isupper() and len(w) > 1)
    
    # 2. Dynamic Score Calculation
    # Baseline for neutral text
    score = 35.0
    
    if positive_hits > 0 and (high_stress_hits + anxiety_hits + sadness_hits) == 0:
        # User expresses calm/positive feelings
        score = max(10.0, 30.0 - (positive_hits * 10.0))
    else:
        # Stress accumulation
        score += high_stress_hits * 25.0
        score += anxiety_hits * 15.0
        score += sadness_hits * 12.0
        score += anger_hits * 14.0
        score += min(15.0, negation_count * 5.0)
        score += min(10.0, exclamation_count * 4.0)
        score += min(10.0, caps_count * 5.0)
        if first_person_count >= 3:
            score += 5.0
            
        if positive_hits > 0:
            score -= positive_hits * 8.0
            
    score = max(5.0, min(98.0, score))
    
    # Detected categories
    detected_emotions = []
    if high_stress_hits > 0: detected_emotions.append("overwhelm")
    if anxiety_hits > 0: detected_emotions.append("anxiety")
    if sadness_hits > 0: detected_emotions.append("sadness")
    if anger_hits > 0: detected_emotions.append("frustration")
    if positive_hits > 0: detected_emotions.append("calm/positive")
    
    indicators = []
    if high_stress_hits > 0:
        indicators.append({"type": "overwhelm_language", "reason": "High-distress urgency keywords detected", "weight": 0.35})
    if anxiety_hits > 0:
        indicators.append({"type": "anxiety_markers", "reason": "Anticipatory worry / exam pressure phrases", "weight": 0.25})
    if negation_count > 1:
        indicators.append({"type": "negation_frequency", "reason": f"{negation_count} negative phrasing tokens", "weight": 0.15})
    if exclamation_count > 1 or caps_count > 0:
        indicators.append({"type": "emotional_emphasis", "reason": "Punctuation/capitalization emphasis", "weight": 0.10})
        
    confidence = round(min(0.95, 0.45 + (word_count / 30.0) * 0.4 + (len(detected_emotions) * 0.1)), 2)
    
    return {
        "sentiment_score": round((positive_hits - (high_stress_hits + anxiety_hits + sadness_hits)) / max(1, positive_hits + high_stress_hits + anxiety_hits + sadness_hits), 2),
        "detected_emotions": detected_emotions,
        "linguistic_markers": {
            "word_count": word_count,
            "negation_count": negation_count,
            "first_person_count": first_person_count,
            "exclamation_count": exclamation_count,
            "caps_count": caps_count
        },
        "stress_indicators": indicators,
        "text_stress_score": round(score, 1),
        "confidence": confidence
    }
