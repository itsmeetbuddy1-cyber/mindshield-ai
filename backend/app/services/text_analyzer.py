import re
from typing import Dict, List, Any

# Emotion keyword dictionaries
EMOTION_KEYWORDS = {
    "anxiety": ["anxious", "worry", "nervous", "panic", "fear", "dread", "uneasy", "tense", "restless"],
    "sadness": ["sad", "depressed", "unhappy", "miserable", "hopeless", "crying", "tears", "grief", "lonely"],
    "anger": ["angry", "furious", "mad", "frustrated", "annoyed", "irritated", "rage", "hate"],
    "stress": ["stressed", "overwhelmed", "pressure", "burden", "exhausted", "burnout", "overloaded"],
    "positive": ["happy", "good", "great", "wonderful", "calm", "relaxed", "peaceful", "grateful", "hopeful"]
}

NEGATION_WORDS = ["not", "no", "never", "don't", "doesn't", "can't", "cannot", "won't", "isn't", "aren't", "wasn't", "weren't"]

def analyze_text_stress(text: str) -> Dict[str, Any]:
    """Analyze text for stress indicators. Returns structured output with explanations."""
    words = text.lower().split()
    word_count = len(words)
    
    # Sentiment score (-1 to 1)
    positive_count = sum(1 for w in words if any(w.startswith(kw) for kw in EMOTION_KEYWORDS["positive"]))
    negative_count = sum(1 for w in words if any(w.startswith(kw) for kw in 
                         EMOTION_KEYWORDS["anxiety"] + EMOTION_KEYWORDS["sadness"] + 
                         EMOTION_KEYWORDS["anger"] + EMOTION_KEYWORDS["stress"]))
    
    total_emotional = positive_count + negative_count
    sentiment_score = 0.0
    if total_emotional > 0:
        sentiment_score = (positive_count - negative_count) / total_emotional
    
    # Detected emotions
    detected_emotions = []
    for emotion, keywords in EMOTION_KEYWORDS.items():
        if emotion == "positive":
            continue
        if any(kw in text.lower() for kw in keywords):
            detected_emotions.append(emotion)
    
    # Linguistic markers
    negation_count = sum(1 for w in words if w in NEGATION_WORDS)
    first_person_count = sum(1 for w in words if w in ["i", "me", "my", "mine", "myself", "i'm", "i've", "i'll"])
    exclamation_count = text.count("!")
    question_count = text.count("?")
    caps_words = sum(1 for w in text.split() if w.isupper() and len(w) > 1)
    
    # Stress indicators with explanations
    indicators = []
    if negation_count > 2:
        indicators.append({"type": "high_negation", "reason": f"Used {negation_count} negative words indicating distress", "weight": 0.15})
    if first_person_count > 3:
        indicators.append({"type": "self_focus", "reason": f"High self-reference ({first_person_count}x) may indicate rumination", "weight": 0.10})
    if exclamation_count > 2:
        indicators.append({"type": "emotional_intensity", "reason": f"Multiple exclamation marks ({exclamation_count}) suggest heightened emotion", "weight": 0.10})
    if caps_words > 1:
        indicators.append({"type": "emphasis", "reason": f"{caps_words} capitalized words indicate intensity", "weight": 0.10})
    if word_count > 100:
        indicators.append({"type": "verbose", "reason": "Lengthy message may indicate need to process complex feelings", "weight": 0.05})
    if word_count < 5:
        indicators.append({"type": "terse", "reason": "Very brief response may indicate withdrawal or difficulty expressing", "weight": 0.05})
    if len(detected_emotions) > 0:
        indicators.append({"type": "emotional_content", "reason": f"Detected emotions: {', '.join(detected_emotions)}", "weight": 0.25})
    
    # Calculate text stress score (0-100)
    base_score = 30  # baseline
    if negative_count > 0:
        base_score += min(negative_count * 10, 30)
    if negation_count > 1:
        base_score += min(negation_count * 5, 15)
    if caps_words > 0:
        base_score += min(caps_words * 5, 10)
    if exclamation_count > 1:
        base_score += min(exclamation_count * 3, 10)
    if positive_count > negative_count:
        base_score = max(10, base_score - 20)
    
    # Confidence based on text length
    confidence = min(0.95, 0.5 + (word_count / 100) * 0.3)
    
    return {
        "sentiment_score": round(sentiment_score, 3),
        "detected_emotions": detected_emotions,
        "linguistic_markers": {
            "word_count": word_count,
            "negation_count": negation_count,
            "first_person_count": first_person_count,
            "exclamation_count": exclamation_count,
            "question_count": question_count,
            "caps_words": caps_words
        },
        "stress_indicators": indicators,
        "text_stress_score": min(100, max(0, base_score)),
        "confidence": round(confidence, 3)
    }
