"""
MindShield AI — Multi-Provider Resilient AI Conversation Engine
Supports:
1. Google Gemini (REST & SDK)
2. Groq (Llama 3.3 70B / 8B — ultra fast & 100% free)
3. OpenAI / Open-WebUI
4. Category-Locked Emotional Synthesizer (Zero-hallucination offline fallback)
"""

import os
import uuid
import re
import random
import json
import urllib.request
import urllib.error
from typing import Dict, List, Any, Optional, Set

# ---------- LLM Provider Callers ----------

def call_groq_api(api_key: str, messages: List[Dict[str, str]], current_message: str, user_facts: List[str], lang: str) -> Optional[str]:
    """Call Groq API (Llama 3.3 70B Versatile / Llama 3.1 8B Instant) — 100% Free & ultra-fast."""
    if not api_key or not api_key.strip():
        return None
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    system_prompt = (
        "You are Shield AI, a warm, emotionally supportive wellness companion in the MindShield app. "
        "Guidelines:\n"
        "1. Respond directly with genuine empathy in 2-3 sentences.\n"
        "2. Match the user's language (Hindi, Hinglish, English, Gujarati) naturally.\n"
        "3. Always end with ONE thoughtful, relevant follow-up question.\n"
        "4. Do NOT give medical diagnoses or generic robotic boilerplate.\n"
        "5. Stay strictly relevant to what the user shares (family, relationships, stress, academics, emotions)."
    )
    
    chat_msgs = [{"role": "system", "content": system_prompt}]
    for m in messages[-6:]:
        chat_msgs.append({"role": m.get("role", "user"), "content": m.get("content", "")})
        
    context_str = f"[User context facts: {', '.join(user_facts)}]" if user_facts else ""
    chat_msgs.append({"role": "user", "content": f"{context_str} {current_message}".strip()})
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": chat_msgs,
        "temperature": 0.7,
        "max_tokens": 300
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key.strip()}"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            return res_json["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"[ConversationEngine] Groq API call failed: {e}")
        return None

def call_huggingface_api(api_key: str, messages: List[Dict[str, str]], current_message: str, user_facts: List[str], lang: str, stress_score: float) -> Optional[str]:
    """Call Hugging Face Inference API with Llama / Qwen models."""
    if not api_key or not api_key.strip():
        return None
        
    try:
        from huggingface_hub import InferenceClient
        client = InferenceClient(api_key=api_key.strip())
        
        system_prompt = (
            f"You are Shield AI, an emotionally intelligent, compassionate mental health companion inside MindShield AI. "
            f"Current user live stress index is estimated at {stress_score}/100. "
            f"Known user emotional facts: {', '.join(user_facts) if user_facts else 'general emotional check-in'}. "
            "Guidelines:\n"
            "1. Respond directly and warmly in 2-3 sentences. NEVER use robotic templates.\n"
            "2. Match the user's language (Hindi, Hinglish, English, Gujarati) naturally and respectfully.\n"
            "3. ALWAYS end with ONE caring, natural follow-up question.\n"
            "4. Validate their emotions deeply (especially regarding family, attention, loneliness, or pressure).\n"
            "5. Never give clinical diagnoses."
        )
        
        chat_msgs = [{"role": "system", "content": system_prompt}]
        for m in messages[-6:]:
            chat_msgs.append({"role": m.get("role", "user"), "content": m.get("content", "")})
        chat_msgs.append({"role": "user", "content": current_message})
        
        # Try primary models
        models_to_try = [
            "Qwen/Qwen2.5-72B-Instruct",
            "meta-llama/Llama-3.2-3B-Instruct",
            "meta-llama/Llama-3.1-8B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3"
        ]
        
        for model in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=chat_msgs,
                    max_tokens=250,
                    temperature=0.75
                )
                text = response.choices[0].message.content.strip()
                if text:
                    return text
            except Exception:
                continue
                
    except Exception as e:
        print(f"[ConversationEngine] HuggingFace API call error: {e}")
        return None
    return None


def call_gemini_api(api_key: str, messages: List[Dict[str, str]], current_message: str, user_facts: List[str], lang: str) -> Optional[str]:
    """Call Google Gemini API via REST."""
    if not api_key or not api_key.strip():
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key.strip()}"
    
    system_instruction = (
        "You are Shield AI, an empathetic mental wellness companion in MindShield AI. "
        "Rules:\n"
        "1. Respond directly and empathetically in 2-3 concise sentences.\n"
        "2. Match the user's language (Hindi, Hinglish, English, Gujarati).\n"
        "3. Always end with ONE caring, relevant follow-up question.\n"
        "4. Never give medical diagnosis or generic templated replies.\n"
        "5. Stay strictly relevant to what the user is discussing (e.g. family, feelings, parents, stress)."
    )
    
    contents = []
    for msg in messages[-6:]:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.get("content", "")}]
        })
        
    context_note = f"[User context facts: {', '.join(user_facts)}]" if user_facts else ""
    contents.append({
        "role": "user",
        "parts": [{"text": f"{context_note} {current_message}".strip()}]
    })
    
    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.8,
            "topP": 0.9,
            "maxOutputTokens": 300
        }
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            result = json.loads(response.read().decode("utf-8"))
            candidates = result.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except Exception as e:
        print(f"[ConversationEngine] Gemini REST API call failed: {e}")
        return None


# ---------- Session Management ----------
class ConversationSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.turn_counter = 0
        self.history: List[Dict[str, Any]] = []
        self.user_facts: List[str] = []
        self.current_topic = "general"
        self.last_user_message: str = ""
        self.conversation_summary = ""
        self.stress_trajectory: List[float] = []
        self.used_responses: Set[str] = set()

    def add_turn(self, user_msg: str, ai_msg: str, stress_score: float, topic: str):
        self.turn_counter += 1
        self.last_user_message = user_msg
        self.history.append({"turn": self.turn_counter, "role": "user", "content": user_msg})
        self.history.append({"turn": self.turn_counter, "role": "ai", "content": ai_msg})
        self.stress_trajectory.append(stress_score)
        self.current_topic = topic
        self.used_responses.add(ai_msg)

    def update_summary(self):
        facts_str = ", ".join(self.user_facts) if self.user_facts else "general emotional check-in"
        self.conversation_summary = (
            f"User is discussing {self.current_topic}. "
            f"Key details: {facts_str}. "
            f"Current conversation length: {self.turn_counter} turns."
        )


# ---------- Dynamic Intent & Emotion Detection ----------
def detect_intent(message: str) -> str:
    msg = message.lower().strip()
    msg_clean = re.sub(r'[^\w\s]', '', msg)

    # 1. Emotional need / attention / validation
    if any(w in msg_clean for w in ["attention", "care", "ignore", "lonely", "alone", "nobody cares", "koi sunta nahi", "koi dhyan nahi", "unseen", "neglect", "akela", "akeli"]):
        return "need_attention"

    # 2. Parents / Family relationships
    if any(w in msg_clean for w in ["parent", "parents", "papa", "mummy", "maa", "father", "mother", "family", "dad", "mom", "gharwale"]):
        return "family_relationships"

    # 3. Farewell
    if any(w in msg_clean for w in ["goodbye", "bye", "alvida", "see you", "signing off", "chalta hoon"]):
        return "farewell"

    # 4. Gratitude / Calmer
    if any(w in msg_clean for w in ["thank you", "thanks", "calmer", "better now", "shukriya", "accha laga", "much calmer"]):
        return "gratitude"

    # 5. Breathing / Coping exercise
    if any(w in msg_clean for w in ["breathing", "breathe", "exercise", "meditation", "saans", "shant karwao"]):
        return "breathing_request"

    # 6. Sleep / Night racing thoughts
    if any(w in msg_clean for w in ["sleep", "insomnia", "neend", "nind", "bed", "night", "sone", "raat", "racing thoughts"]):
        return "sleep"

    # 7. Phone distraction
    if any(w in msg_clean for w in ["phone", "instagram", "youtube", "reels", "mobile", "distract"]):
        return "phone_distraction"

    # 8. Concentration / Focus
    if any(w in msg_clean for w in ["concentrate", "concentration", "focus", "dhyan", "ekagrata"]):
        return "concentration"

    # 9. Ready to start
    if any(p in msg for p in ["ready to start", "going to study", "start my", "shuru karta hoon"]):
        return "ready_to_act"

    # 10. Exams / Academic
    if any(w in msg_clean for w in ["exam", "exams", "study", "padhai", "pariksha", "test", "marks", "grade", "syllabus", "fail"]):
        return "academic"

    # 11. Subjects (Maths/Physics)
    if any(w in msg_clean for w in ["math", "mathematics", "physics", "chemistry", "biology", "accounts"]):
        return "subjects"

    # 12. Study Hours
    if any(w in msg_clean for w in ["hour", "hours", "ghante", "ghanta", "time", "4-5", "5-6"]):
        return "study_hours"

    # 13. Short affirmative
    if msg_clean in ["both", "dono", "yes", "haan", "ha", "yep", "no", "nahi", "na", "ok", "okay"]:
        return "short_affirmative"

    # 14. Stress & General distress
    if any(w in msg_clean for w in ["stress", "tension", "worried", "chinta", "pareshan", "anxious"]):
        return "stress_general"

    return "general"


def detect_language(message: str, language_hint: str) -> str:
    msg = message.lower()
    hindi_markers = ["hai", "hoon", "raha", "rahi", "kya", "bhai", "yaar", "bohot", "mujhe", "kaise", "batao", "karo", "nahi", "abhi", "aur", "toh", "padhai", "karu", "kar", "mera", "mere", "meri", "papa", "dost"]
    gujarati_markers = ["chhe", "chhu", "thay", "mane", "su", "karo", "chinta", "kem", "cho"]

    hindi_count = sum(1 for w in hindi_markers if w in msg.split())
    gujarati_count = sum(1 for w in gujarati_markers if w in msg.split())

    if gujarati_count >= 2 or language_hint == "gu":
        return "gu"
    if hindi_count >= 1 or language_hint == "hi":
        return "hi"
    return "en"


# ---------- Dynamic Synthesized Responses (Category-locked) ----------
RESPONSES_BY_INTENT = {
    "need_attention": {
        "en": [
            "Wanting attention and feeling unseen by those closest to you is deeply human and valid. When emotional connection feels missing, it can create a painful sense of emptiness. What kind of attention or understanding do you wish you received most right now?",
            "It hurts when you feel like you have to struggle to be noticed or heard. Your feelings matter, and you deserve genuine care and presence. Have you felt distant from them for a long time, or did something specific happen recently?",
            "Feeling ignored or craving attention usually means your emotional cup is running on empty. I'm right here listening to you with full focus. What's the hardest part about how they currently treat you?",
        ],
        "hi": [
            "Apno se attention aur pyaar chahana bilkul natural hai. Jab lagta hai ki koi dhyan nahi de raha ya samajh nahi raha, toh bohot akelapan lagta hai. Aap unse kis tarah ka support ya response expect kar rahe ho?",
            "Ye baat dil par lagti hai jab hume lagta hai ki humari presence ki kisi ko value nahi hai. Aapki feelings important hain. Kya ye doori kaafi time se hai ya abhi zyada feel ho rahi hai?",
            "Jab family ya parents se attention nahi milti, toh ek ajeeb sa khali-pan lagta hai. Main yahan hoon aur poori tarah sun raha hoon. Unki kaunsi baat aapko sabse zyada hurt karti hai?",
        ],
        "gu": [
            "માતાપિતા કે પોતાના લોકો પાસેથી પ્રેમ અને ધ્યાન ઈચ્છવું ખૂબ સ્વાભાવિક છે. જ્યારે કોઈ ધ્યાન ન આપે ત્યારે એકલતા લાગે છે. તમને સૌથી વધુ શું hurt કરે છે?",
        ]
    },
    "family_relationships": {
        "en": [
            "Relationships with parents can be among the most emotionally charged and complicated parts of life. It's painful when there's a gap between what you need and what they provide. What is the dynamic like between you and your father right now?",
            "Family ties often carry high expectations alongside deep affection, which can lead to frequent misunderstandings. You deserve to be heard without feeling judged. How do conversations usually go when you try to express your feelings to them?",
            "When communication breaks down with parents, it feels like living under constant tension. Taking care of your own emotional peace is essential. What's one thing you wish they truly understood about you?",
        ],
        "hi": [
            "Parents ke saath relationship kaafi complicated ho sakta hai — pyaar bhi hota hai aur bohot saare unsaid gaps bhi. Papa ke saath abhi baat-cheet kaisi rehti hai?",
            "Family me jab understanding kam aur distance zyada ho, toh ghar me bhi ghutan si feel hoti hai. Aapki feelings bilkul valid hain. Jab aap unse baat karte ho, toh kya ladai hoti hai ya silence ho jati hai?",
            "Parents aur bachhon ke beech generation gap aur emotional distance bohot common hai, par ye bohot pain deta hai. Ek aisi kya baat hai jo aap chahte ho ki aapke papa samjhein?",
        ],
        "gu": [
            "માતાપિતા સાથેના સંબંધો ઘણા જટિલ હોઈ શકે છે. પપ્પા સાથે અત્યારે વાતચીત કેવી રહે છે?",
        ]
    },
    "farewell": {
        "en": [
            "Take care of yourself! You took an important step by expressing what you're carrying. Shield AI is always right here whenever you need a safe space.",
            "Goodbye for now. Remember that your feelings are valid and you don't have to carry everything alone. Wishing you peace and strength today.",
        ],
        "hi": [
            "Apna pura khayal rakhna! Aaj baat karke aapne accha kadam uthaya. Jab bhi zaroorat ho, Shield AI hamesha yahan hai.",
            "Alvida! Yaad rakhna aap akele nahi ho. Khud par vishwas rakho aur thoda break zaroor lo.",
        ],
        "gu": [
            "તમારું ધ્યાન રાખજો! જ્યારે પણ જરૂર હોય ત્યારે હું અહીં છું.",
        ]
    },
    "gratitude": {
        "en": [
            "I'm really glad to hear that you're experiencing a bit of relief. Acknowledging what you feel is the first real step to healing. How does your heart and mind feel right now?",
            "You're very welcome! That sense of calm shows your inner resilience. Would you like to do a quick 2-minute breathing exercise to anchor this peace?",
        ],
        "hi": [
            "Ye sunkar bohot sukoon mila! Apne emotions ko express karna hi pehla step hota hai. Abhi aap kaisa mehsoos kar rahe ho?",
            "Aapka welcome! Ye calm feeling ye prove karti hai ki aapka mind shanti dhoondh sakta hai. Kya 2 minute ka breathing exercise karna chahoge?",
        ],
        "gu": [
            "આ સાંભળીને આનંદ થયો! અત્યારે મન કેવું અનુભવે છે?",
        ]
    },
    "breathing_request": {
        "en": [
            "Let's do a quick Box Breathing together: Inhale slowly for 4 seconds... Hold gently for 4 seconds... Exhale smoothly for 4 seconds... and Pause for 4. Feel your shoulders drop. How do you feel after that breath?",
        ],
        "hi": [
            "Chaliye 4-4-4 Box Breathing karte hain: 4 second dheere se saans andar lijiye... 4 second rokiye... aur 4 second me dheere se chodiye. Kaisa lag raha hai ab?",
        ],
        "gu": [
            "ચાલો ૪ સેકન્ડ ઊંડો શ્વાસ લઈએ... ૪ સેકન્ડ રોકો... અને ૪ સેકન્ડમાં બહાર કાઢો. હવે કેવું લાગે છે?",
        ]
    },
    "sleep": {
        "en": [
            "When sleep is difficult and the mind keeps racing at night, it means your nervous system is on high alert. Trying a 5-minute brain dump on paper before bed can help release those thoughts. What time do you usually try to sleep?",
            "Racing thoughts right before bed are exhausting. Setting a strict 'digital sunset' 30 minutes before sleep helps your melatonin levels recover naturally. Does your mind race more about tomorrow's tasks or unresolved worries?",
            "Poor sleep makes emotional regulation so much harder during the day. Keeping the room completely dark and phone-free 30 minutes before bed helps reset melatonin. How many hours did you get last night?",
        ],
        "hi": [
            "Raat ko neend na aana aur dimag me baatein ghoomna stress ka bada sign hai. Sone se pehle notebook me saari baatein likh dene se mind ko sukoon milta hai. Aap aam taur par kitne baje sote ho?",
            "Sote waqt dimag me thoughts daudna kaafi thaka deta hai. Sone se 30 minute pehle screen band karna aur kamre ko thanda rakhna sleep quality ko improve karta hai. Kya aap brain dump technique try karna chahoge?",
        ],
        "gu": [
            "રાત્રે વિચારો દોડવા અને ઊંઘ ન આવવી તણાવની નિશાની છે. સામાન્ય રીતે કેટલા વાગ્યે સૂઈ જાઓ છો?",
        ]
    },
    "phone_distraction": {
        "en": [
            "Phone checking often happens when we're seeking quick dopamine or avoiding emotional discomfort. Keeping your phone in another room while studying creates an instant buffer. How many hours a day do you typically study?",
            "Digital notifications are deliberately engineered to fragment your attention span. Creating physical distance between yourself and the phone removes 80% of the temptation. Do you notice the distraction happening more during difficult topics?",
        ],
        "hi": [
            "Phone ka scroll loop tab zyada attract karta hai jab hum kisi stress se bachna chahte hain. Phone ko doosre kamre me rakh kar padhna focus wapas laata hai. Normally aap din me kitne ghante padhte ho?",
        ],
        "gu": [
            "ફોન checking ધ્યાન ભટકાવવામાં મોટો ભાગ ભજવે છે. ફોન બીજા રૂમમાં મૂકો. દિવસમાં કેટલા કલાક ભણો છો?",
        ]
    },
    "concentration": {
        "en": [
            "Losing focus is a natural physiological reaction to emotional stress — your brain is prioritizing survival over study material. Breaking work into 25-minute Pomodoro sprints takes away the overwhelm. What subject do you need to focus on next?",
            "When you find it impossible to concentrate, try the 5-minute rule: commit to studying for just five minutes without stopping. Once the inertia breaks, continuing becomes substantially easier. What specific task feels hardest to start?",
            "Concentration struggles often mean mental saturation. Taking a 3-minute physical movement break or splashing cold water on your face resets autonomic arousal. Would you like to try a quick focus reset together?",
        ],
        "hi": [
            "Jab mann me tension ho toh padhai me focus na hona normal hai. 25 minute padho aur 5 minute ka short break lo. Abhi sabse pehle kaunsa subject cover karna hai?",
            "Agar dhyan lagana mushkil ho raha hai, toh sirf 5 minute padhne ka target banao. Shuruwaat ka resistance break hote hi focus wapas aa jata hai. Kaunse topic se shuru karna chahoge?",
        ],
        "gu": [
            "ધ્યાન ન લાગવું એ તણાવનું પરિણામ છે. ૨૫ મિનિટ વાંચો અને ૫ મિનિટ બ્રેક લો. કયો વિષય વાંચવો છે?",
        ]
    },
    "ready_to_act": {
        "en": [
            "That is wonderful momentum! Keep your phone away, focus solely on your first topic, and celebrate the small win once the 25 minutes are done. You're ready — go for it! 🚀",
        ],
        "hi": [
            "Bohot shandar! Phone ko door rakho, ek single topic par focus karo aur 25 minute pura concentrate karo. All the best! 🚀",
        ],
        "gu": [
            "ખૂબ સરસ! ૨૫ મિનિટ સંપૂર્ણ ધ્યાન સાથે વાંચો. ઓલ ધ બેસ્ટ! 🚀",
        ]
    },
    "academic": {
        "en": [
            "Exam pressure can feel overwhelming when combined with personal stress. Structuring your syllabus into high-priority chapters first gives instant relief. Which specific exam or topic is creating the most anxiety?",
        ],
        "hi": [
            "Exams ka load aur marks ka pressure kaafi bhaari lag sakta hai. Sab kuch ek saath karne ki jagah high-weightage topics pehle pick karo. Sabse zyada tension kis subject ki ho rahi hai?",
        ],
        "gu": [
            "પરીક્ષાનું દબાણ ઘણું વધારે હોઈ શકે છે. કયા વિષયની સૌથી વધુ ચિંતા છે?",
        ]
    },
    "subjects": {
        "en": [
            "Mathematics and Physics require active problem solving rather than passive reading. Starting with basic formula sheets and solved examples builds quick momentum. Have you started past question papers yet?",
        ],
        "hi": [
            "Maths aur Physics me formula sheets aur solved examples se shuru karna instant confidence deta hai. Kya aapne previous year papers try kiye hain?",
        ],
        "gu": [
            "ગણિત અને ભૌતિકશાસ્ત્રમાં દાખલા ગણવાથી આત્મવિશ્વાસ વધશે. શું જૂના પેપર જોયા છે?",
        ]
    },
    "study_hours": {
        "en": [
            "4 to 5 hours is already a significant and disciplined target. Quality of focused sprints matters far more than sitting tired for hours. Which subject is scheduled first in your timetable?",
        ],
        "hi": [
            "4-5 ghante ka target already kaafi solid hai. Continuous baithne se accha chhote blocks me padhna zyada effective hota hai. Pehla exam kis date ko hai?",
        ],
        "gu": [
            "૪-૫ કલાકનો લક્ષ્યાંક સારો છે. પહેલી પરીક્ષા ક્યારે છે?",
        ]
    },
    "short_affirmative": {
        "en": [
            "Dealing with both simultaneously is undeniably draining. Let's focus on what you can influence one step at a time. What feels most urgent to address right now?",
        ],
        "hi": [
            "Dono baatein ek saath jhelna kaafi exhausting hota hai. Pehle ek chhoti cheez se shuru karte hain. Sabse urgent kya lag raha hai?",
        ],
        "gu": [
            "બંને બાબતો એકસાથે થકવી નાખે તેવી છે. અત્યારે સૌથી અગત્યનું શું લાગે છે?",
        ]
    },
    "stress_general": {
        "en": [
            "I'm right here listening. Giving voice to your stress helps reduce its intensity. What is the single biggest thing that is weighing on your mind right now?",
        ],
        "hi": [
            "Main dhyan se sun raha hoon. Apne stress ke baare me baat karna hi relief ka pehla kadam hai. Abhi sabse zyada tension kis baat ki hai?",
        ],
        "gu": [
            "હું સાંભળી રહ્યો છું. અત્યારે સૌથી વધુ ચિંતા શેની થઈ રહી છે?",
        ]
    },
    "general": {
        "en": [
            "I hear what you're sharing. You don't have to carry this alone, and talking it through can bring real clarity. What would help you feel a bit more supported right now?",
        ],
        "hi": [
            "Main samajh raha hoon. Is cheez ko akele jhelne ki zaroorat nahi hai. Abhi aapko kis tarah ki help ya support sabse zaroori lag rahi hai?",
        ],
        "gu": [
            "હું સમજી રહ્યો છું. અત્યારે તમને કેવા પ્રકારના સપોર્ટની જરૂર લાગે છે?",
        ]
    }
}


# ---------- Main Conversation Engine Class ----------
class ConversationEngine:
    def __init__(self):
        self.sessions: Dict[str, ConversationSession] = {}

    def get_session(self, session_id: Optional[str] = None) -> ConversationSession:
        if not session_id:
            session_id = str(uuid.uuid4())
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(session_id)
        return self.sessions[session_id]

    def _extract_facts(self, message: str, existing_facts: List[str]) -> List[str]:
        facts = list(existing_facts)
        msg_l = message.lower()
        
        if any(w in msg_l for w in ["attention", "ignore", "lonely", "nobody cares", "koi dhyan nahi"]):
            if "seeking parental attention & connection" not in facts:
                facts.append("seeking parental attention & connection")
        if any(w in msg_l for w in ["papa", "dad", "father", "parent", "parents"]):
            if "relationship tension with father/parents" not in facts:
                facts.append("relationship tension with father/parents")
        if any(w in msg_l for w in ["exam", "test", "pariksha", "padhai"]):
            if "exam approaching" not in facts:
                facts.append("exam approaching")
        if any(w in msg_l for w in ["concentrat", "focus"]):
            if "difficulty concentrating" not in facts:
                facts.append("difficulty concentrating")
        if any(w in msg_l for w in ["phone", "instagram"]):
            if "phone distraction" not in facts:
                facts.append("phone distraction")
        if any(w in msg_l for w in ["sleep", "insomnia", "neend"]):
            if "trouble sleeping" not in facts:
                facts.append("trouble sleeping")
                
        return facts

    def _calculate_stress(self, message: str, trajectory: List[float]) -> float:
        msg = message.lower()
        baseline = trajectory[-1] if trajectory else 35.0
        delta = 0.0

        if any(w in msg for w in ["panic", "overwhelmed", "cannot handle", "crying", "hurt", "hate", "hopeless"]):
            delta += 8.0
        elif any(w in msg for w in ["stress", "anxious", "tension", "worry", "attention", "ignore", "pareshan"]):
            delta += 3.0
        elif any(w in msg for w in ["calmer", "better", "breathe", "relief", "thanks", "helpful", "shant", "goodbye"]):
            delta -= 8.0

        return round(max(18.0, min(85.0, baseline + delta)), 1)

    def process_message(self, message: str, session_id: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
        session = self.get_session(session_id)
        lang = detect_language(message, language)
        intent = detect_intent(message)
        
        session.user_facts = self._extract_facts(message, session.user_facts)
        stress_score = self._calculate_stress(message, session.stress_trajectory)

        from app.core.config import settings
        history_msgs = [{"role": item["role"], "content": item["content"]} for item in session.history[-6:]]
        ai_response = None

        # 1. Try Hugging Face API first (with Llama / Qwen models)
        hf_key = settings.HUGGINGFACE_API_KEY or os.getenv("HUGGINGFACE_API_KEY", "") or os.getenv("HF_API_KEY", "")
        if hf_key and len(hf_key.strip()) > 10:
            ai_response = call_huggingface_api(hf_key, history_msgs, message, session.user_facts, lang, stress_score)

        # 2. Try Groq API (if present)
        if not ai_response:
            groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
            if groq_key and len(groq_key.strip()) > 10:
                ai_response = call_groq_api(groq_key, history_msgs, message, session.user_facts, lang)

        # 3. Try Gemini API
        if not ai_response:
            api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "") or settings.AI_API_KEY or os.getenv("AI_API_KEY", "")
            if api_key and len(api_key.strip()) > 10:
                ai_response = call_gemini_api(api_key, history_msgs, message, session.user_facts, lang)

        # 4. Strict Category-Locked Contextual Fallback
        if not ai_response:
            intent_pool = RESPONSES_BY_INTENT.get(intent, RESPONSES_BY_INTENT["general"])
            responses = intent_pool.get(lang, intent_pool.get("en", []))
            
            available = [r for r in responses if r not in session.used_responses]
            if available:
                ai_response = available[0]
            elif responses:
                ai_response = responses[-1]
            else:
                ai_response = "I hear what you're saying and I am right here with you. Can you tell me a little more about how this is affecting you today?"

        # Map broad topic for dashboard
        topic_map = {
            "need_attention": "family relationships",
            "family_relationships": "family relationships",
            "academic": "academic stress",
            "concentration": "academic stress",
            "subjects": "academic stress",
            "study_hours": "academic stress",
            "phone_distraction": "academic stress",
            "sleep": "sleep difficulty",
            "breathing_request": "coping",
            "gratitude": "general",
            "farewell": "general",
            "short_affirmative": "general",
            "stress_general": "general",
            "ready_to_act": "general",
            "general": "general"
        }
        broad_topic = topic_map.get(intent, "general")

        session.add_turn(
            user_msg=message,
            ai_msg=ai_response,
            stress_score=stress_score,
            topic=broad_topic
        )
        session.update_summary()

        trend = "stable"
        if len(session.stress_trajectory) >= 2:
            diff = session.stress_trajectory[-1] - session.stress_trajectory[-2]
            if diff >= 4.0:
                trend = "increasing"
            elif diff <= -4.0:
                trend = "decreasing"

        return {
            "response": ai_response,
            "turn_id": session.turn_counter,
            "current_topic": broad_topic,
            "conversation_summary": session.conversation_summary,
            "stress_score": stress_score,
            "stress_trend": trend,
            "user_facts": session.user_facts
        }

conversation_engine = ConversationEngine()
