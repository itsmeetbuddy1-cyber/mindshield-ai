from typing import Tuple, List, Dict
from app.core.config import settings

SAFETY_RESOURCES = {
    "en": [
        {"name": "National Suicide Prevention Lifeline", "contact": "988", "description": "24/7 crisis support"},
        {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "description": "Free 24/7 text support"},
        {"name": "iCall (India)", "contact": "9152987821", "description": "Mental health helpline"}
    ],
    "hi": [
        {"name": "राष्ट्रीय आत्महत्या रोकथाम हेल्पलाइन", "contact": "988", "description": "24/7 संकट सहायता"},
        {"name": "क्राइसिस टेक्स्ट लाइन", "contact": "HOME टेक्स्ट करें 741741 पर", "description": "मुफ्त 24/7 टेक्स्ट सहायता"},
        {"name": "iCall (भारत)", "contact": "9152987821", "description": "मानसिक स्वास्थ्य हेल्पलाइन"}
    ],
    "gu": [
        {"name": "રાષ્ટ્રીય આત્મહત્યા નિવારણ હેલ્પલાઈન", "contact": "988", "description": "24/7 કટોકટી સહાય"},
        {"name": "ક્રાઇસિસ ટેક્સ્ટ લાઇન", "contact": "HOME ટેક્સ્ટ કરો 741741 પર", "description": "મફત 24/7 ટેક્સ્ટ સહાય"},
        {"name": "iCall (ભારત)", "contact": "9152987821", "description": "માનસિક સ્વાસ્થ્ય હેલ્પલાઈન"}
    ]
}

SAFETY_MESSAGES = {
    "HIGH": {
        "en": "I'm very concerned about what you've shared. You are not alone, and help is available right now. Please reach out to one of these resources immediately:",
        "hi": "आपने जो बताया उससे मुझे बहुत चिंता हो रही है। आप अकेले नहीं हैं, और अभी मदद उपलब्ध है। कृपया तुरंत इन संसाधनों से संपर्क करें:",
        "gu": "તમે જે જણાવ્યું તેનાથી મને ખૂબ ચિંતા થાય છે. તમે એકલા નથી, અને અત્યારે મદદ ઉપલબ્ધ છે. કૃપા કરીને તરત જ આ સંસાધનોનો સંપર્ક કરો:"
    },
    "MODERATE": {
        "en": "I hear you, and I want you to know that what you're feeling is valid. Let's work through this together. Would you like to try a grounding exercise, or would you prefer to talk more?",
        "hi": "मैं सुन रहा/रही हूँ, और जानिए कि आप जो महसूस कर रहे हैं वो सही है। क्या ग्राउंडिंग एक्सरसाइज़ करें या और बात करें?",
        "gu": "હું સાંભળી રહ્યો/રહી છું, અને જાણો કે તમે જે અનુભવો છો તે યોગ્ય છે. ગ્રાઉન્ડિંગ કસરત કરીએ કે વધુ વાત કરીએ?"
    }
}

# Multilingual safety keywords
SAFETY_KEYWORDS_EXTENDED = {
    "HIGH": {
        "en": ["suicide", "kill myself", "end it all", "hurt myself", "die", "no reason to live", "better off without me", "want to die", "end my life"],
        "hi": ["khudkhushi", "mar jana", "marna chahta", "jeena nahi", "khatam karna", "zindagi khatam"],
        "gu": ["aatmhatya", "mari java", "marvu chhu", "jivvu nathi", "khatam karvu"]
    },
    "MODERATE": {
        "en": ["hopeless", "worthless", "give up", "can't go on", "no point", "nobody cares"],
        "hi": ["nirasha", "koi fayda nahi", "koi umeed nahi", "haar maan"],
        "gu": ["nirasha", "koi faydo nathi", "koi asha nathi", "haar manvu"]
    }
}

def check_safety(message: str, language: str = "en") -> Tuple[str, str, List[Dict[str, str]]]:
    msg_lower = message.lower()
    lang = language if language in ["en", "hi", "gu"] else "en"
    
    # Check HIGH risk across all languages
    for lang_key, keywords in SAFETY_KEYWORDS_EXTENDED["HIGH"].items():
        if any(kw in msg_lower for kw in keywords):
            return "HIGH", SAFETY_MESSAGES["HIGH"][lang], SAFETY_RESOURCES.get(lang, SAFETY_RESOURCES["en"])
    
    # Also check original config keywords
    if any(kw in msg_lower for kw in settings.SAFETY_KEYWORDS):
        return "HIGH", SAFETY_MESSAGES["HIGH"][lang], SAFETY_RESOURCES.get(lang, SAFETY_RESOURCES["en"])
    
    # Check MODERATE risk across all languages
    for lang_key, keywords in SAFETY_KEYWORDS_EXTENDED["MODERATE"].items():
        if any(kw in msg_lower for kw in keywords):
            return "MODERATE", SAFETY_MESSAGES["MODERATE"][lang], []
    
    return "LOW", "", []
