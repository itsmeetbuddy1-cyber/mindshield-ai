from typing import Dict, Any, Tuple, List
from app.core.config import settings

def check_safety(message: str) -> Tuple[str, str, List[Dict[str, str]]]:
    msg_lower = message.lower()
    
    resources = [
        {"name": "National Suicide Prevention Lifeline", "contact": "988"},
        {"name": "Crisis Text Line", "contact": "Text HOME to 741741"}
    ]
    
    high_risk = any(keyword in msg_lower for keyword in settings.SAFETY_KEYWORDS)
    moderate_risk = any(word in msg_lower for word in ["hopeless", "worthless", "give up", "can't go on"])
    
    if high_risk:
        risk_level = "HIGH"
        support_msg = "It sounds like you are going through an incredibly difficult time and might be in danger. Your life has value, and there is support available right now. Please reach out to a professional who can help."
        return risk_level, support_msg, resources
    elif moderate_risk:
        risk_level = "MODERATE"
        support_msg = "I'm hearing that things feel very dark and difficult for you right now. You don't have to carry this alone. Would you like to try a grounding exercise, or would you prefer to connect with someone who can support you?"
        return risk_level, support_msg, []
    else:
        risk_level = "LOW"
        support_msg = ""
        return risk_level, support_msg, []
