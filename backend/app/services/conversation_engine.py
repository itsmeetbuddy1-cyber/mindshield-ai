"""
MindShield AI — Conversation Engine
Uses Google Gemini API for real, intelligent, ChatGPT-quality conversations.
Falls back to an enhanced offline engine when API key is not configured.
"""

import os
import uuid
import re
import random
import traceback
from typing import Dict, List, Any, Optional, Set

# ---------- Gemini API Setup ----------
_gemini_model = None
_gemini_available = False

def _init_gemini():
    """Lazy-init the Gemini client once."""
    global _gemini_model, _gemini_available
    if _gemini_model is not None:
        return
    api_key = os.getenv("GEMINI_API_KEY", "") or os.getenv("AI_API_KEY", "")
    if not api_key:
        _gemini_available = False
        return
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
            generation_config={
                "temperature": 0.85,
                "top_p": 0.92,
                "top_k": 40,
                "max_output_tokens": 500,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
        )
        _gemini_available = True
        print("[ConversationEngine] ✅ Gemini API connected successfully")
    except Exception as e:
        print(f"[ConversationEngine] ⚠️ Gemini unavailable, using offline engine: {e}")
        _gemini_available = False


# ---------- System Prompt for Gemini ----------
SYSTEM_PROMPT = """You are Shield AI — a compassionate, emotionally intelligent mental wellness companion inside the MindShield app. You are NOT a medical professional and must never diagnose or prescribe medication.

CORE RULES:
1. ALWAYS respond in the SAME LANGUAGE the user is using. If they write in Hindi/Hinglish, reply in Hindi/Hinglish. If English, reply in English. If Gujarati, reply in Gujarati. Match their style naturally.
2. Keep responses between 2-4 sentences. Be warm, specific, and actionable — never generic.
3. ALWAYS end with a thoughtful follow-up question that deepens the conversation. Never leave a dead-end.
4. Reference what the user previously said to show you're truly listening. Use their exact words when possible.
5. Offer ONE specific, practical coping technique when appropriate (breathing, journaling, grounding, time management, etc.)
6. NEVER repeat the same response. Each reply must be unique and contextually relevant.
7. When the user shares a problem, validate their feelings FIRST, then offer perspective or a technique.
8. You can use emojis sparingly (1-2 max per message) to add warmth.
9. If the user seems in crisis (mentions self-harm, suicide, hopelessness), immediately provide the Tele-MANAS helpline (14416) and KIRAN helpline (1800-599-0019) and be extra supportive.
10. You are an AI wellness companion — always include a subtle disclaimer if giving health-related suggestions.

PERSONALITY: Warm, empathetic, like a caring older sibling or best friend who also happens to know psychology. Not clinical or robotic. Use natural, conversational language.

EXAMPLE STYLES:
- English: "That sounds really tough. When exam pressure builds up like this, your brain goes into overdrive trying to process everything at once. Have you tried the 25-5 study technique? Study for 25 minutes, then a 5-minute walk. It sounds simple but it genuinely resets your focus. What subject is stressing you out the most right now?"
- Hindi/Hinglish: "Yaar, ye sab ek saath handle karna bohot heavy hota hai. Ek kaam karo — abhi sirf ek subject pick karo jo sabse zyada tension de raha hai, aur uske sirf 2 chapters ka plan banao. Bada picture mat dekho abhi. Kaun sa subject sabse pehle tackle karna chahoge?"
- Gujarati: "હું સમજું છું કે આ બધું એકસાથે ભારે લાગે છે. ચાલો એક નાનું પગલું ભરીએ — અત્યારે સૌથી વધુ ચિંતા શેની છે?"
"""

# ---------- Gemini Chat Session Cache ----------
_gemini_chats: Dict[str, Any] = {}

def _get_gemini_chat(session_id: str, history: List[Dict[str, str]]):
    """Get or create a Gemini chat session with conversation history."""
    global _gemini_chats
    if session_id not in _gemini_chats:
        gemini_history = []
        for msg in history:
            role = "user" if msg.get("role") == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})
        _gemini_chats[session_id] = _gemini_model.start_chat(history=gemini_history)
    return _gemini_chats[session_id]


# ---------- Session Management ----------
class ConversationSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.turn_counter = 0
        self.history: List[Dict[str, Any]] = []
        self.user_facts: List[str] = []
        self.current_topic = "general"
        self.last_ai_question: Optional[str] = None
        self.last_user_message: str = ""
        self.conversation_summary = ""
        self.stress_trajectory: List[float] = []
        self.used_responses: Set[str] = set()  # Track ALL responses used in this session

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

    def get_chat_history_for_gemini(self) -> List[Dict[str, str]]:
        """Return last 20 messages formatted for Gemini."""
        msgs = []
        for item in self.history[-20:]:
            role = "user" if item["role"] == "user" else "model"
            msgs.append({"role": role, "content": item["content"]})
        return msgs


# ---------- Micro-Topic Detection ----------
# Each message gets a SPECIFIC micro-topic based on its content, not just broad categories
def _detect_micro_topic(message: str, current_topic: str) -> str:
    """Detect a fine-grained micro-topic from the message for better response selection."""
    msg = message.lower().strip()
    msg_clean = re.sub(r'[^\w\s]', '', msg)
    
    # Farewell / Goodbye
    if any(w in msg_clean for w in ["goodbye", "bye", "alvida", "see you", "signing off", "chalta hoon", "chale", "chal"]):
        return "farewell"
    
    # Ready to Act / Positive Momentum
    if any(p in msg for p in ["ready to start", "going to study", "start my", "let me try", "shuru karta", "padhne ja"]):
        return "ready_to_act"
    
    # Gratitude / Feeling Better
    if any(w in msg_clean for w in ["thank you", "thanks", "calmer", "better now", "feel better", "accha laga", "shukriya", "relief", "much calmer"]):
        return "gratitude"
    
    # Breathing / Guided Exercise Request
    if any(w in msg_clean for w in ["breathing", "breathe", "breathing exercise", "guide", "meditation", "saans", "shant"]):
        return "breathing_request"
    
    # Racing Thoughts / Mind Won't Stop
    if any(p in msg for p in ["racing", "mind keeps", "thoughts won", "dimag me", "sochte rehta"]):
        return "racing_thoughts"
    
    # Sleep Issues
    if any(w in msg_clean for w in ["sleep", "insomnia", "neend", "nind", "bed", "night", "sone", "raat"]):
        return "sleep_issues"
    
    # Phone Distraction
    if any(w in msg_clean for w in ["phone", "checking my phone", "instagram", "youtube", "reels", "mobile", "distract", "social media"]):
        return "phone_distraction"
    
    # Concentration / Focus
    if any(w in msg_clean for w in ["concentrate", "concentration", "focus", "cant focus", "dhyan", "ekagrata", "blank"]):
        return "concentration"
    
    # Parental / Family Expectations
    if any(w in msg_clean for w in ["parent", "parents", "expect", "marks", "papa", "mummy", "maa", "dad", "mom", "disappoint", "family"]):
        return "parental_pressure"
    
    # Specific Subjects
    if any(w in msg_clean for w in ["mathematics", "math", "physics", "chemistry", "biology", "accounts", "science", "subject"]):
        return "specific_subjects"
    
    # Study Hours / Time Management
    if any(w in msg_clean for w in ["hours", "ghante", "ghanta", "time", "schedule", "timetable"]) or re.search(r'\d+[-–]\d+\s*(hours?|hrs?|ghante)', msg):
        return "study_hours"
    
    # How-to / Advice Seeking
    if any(p in msg_clean for p in ["what should i do", "how can i", "how do i", "kya karun", "kaise karun", "kaise karu", "kaise resolve", "tips", "suggest"]):
        return "how_to_advice"
    
    # Short Affirmative / "Both" / "Yes"
    if msg_clean in ["both", "dono", "yes", "haan", "ha", "yep", "no", "nahi", "na", "ok", "okay", "hmm", "accha"]:
        return "short_affirmative"
    
    # Academic / Exam 
    if any(w in msg_clean for w in ["exam", "study", "padhai", "pariksha", "test", "marks", "grade", "college", "school", "homework", "assignment", "syllabus", "fail"]):
        return "academic_stress"
    
    # Relationship
    if any(w in msg_clean for w in ["boyfriend", "girlfriend", "partner", "relationship", "breakup", "dating", "love", "fight", "friend", "dost"]):
        return "relationship"
    
    # Financial
    if any(w in msg_clean for w in ["money", "financial", "debt", "loan", "rent", "bill", "salary", "expense", "broke", "paisa"]):
        return "financial"
    
    # Work
    if any(w in msg_clean for w in ["work", "job", "boss", "office", "deadline", "meeting", "project", "overtime", "kaam", "naukri"]):
        return "work_burnout"
    
    # Anxiety
    if any(w in msg_clean for w in ["anxious", "anxiety", "panic", "worried", "nervous", "ghabrahat", "dar", "darr"]):
        return "anxiety"
    
    # Stress general keyword
    if any(w in msg_clean for w in ["stress", "stressed", "tension", "overwhelmed", "pressure", "pareshan"]):
        return "stress_general"
    
    # Loneliness
    if any(w in msg_clean for w in ["lonely", "alone", "isolated", "akela", "akeli"]):
        return "loneliness"
    
    # Sadness
    if any(w in msg_clean for w in ["sad", "depressed", "unhappy", "crying", "cry", "dukhi", "udas", "rona"]):
        return "sadness"
    
    # If nothing matched, return current topic or general
    return current_topic if current_topic != "general" else "general"


# ---------- Broad topic for metadata (used for summary) ----------
def _get_broad_topic(micro_topic: str) -> str:
    mapping = {
        "farewell": "general", "ready_to_act": "general", "gratitude": "general",
        "breathing_request": "coping", "racing_thoughts": "anxiety",
        "sleep_issues": "sleep difficulty", "phone_distraction": "academic stress",
        "concentration": "academic stress", "parental_pressure": "family pressure",
        "specific_subjects": "academic stress", "study_hours": "academic stress",
        "how_to_advice": "general", "short_affirmative": "general",
        "academic_stress": "academic stress", "relationship": "relationship tension",
        "financial": "financial stress", "work_burnout": "workload burnout",
        "anxiety": "anxiety", "stress_general": "general",
        "loneliness": "loneliness", "sadness": "sadness",
    }
    return mapping.get(micro_topic, "general")


def _calculate_stress(message: str, trajectory: List[float]) -> float:
    msg = message.lower()
    baseline = trajectory[-1] if trajectory else 35.0
    delta = 0.0

    high_distress = ["fail", "panic", "overwhelmed", "cannot handle", "crying", "hate", "blanking", "worst", "terrible", "hopeless", "worthless"]
    moderate_distress = ["stress", "anxious", "tension", "worry", "pressure", "scared", "chinta", "pareshan", "distract", "confused", "frustrated"]
    positive_signals = ["calmer", "better", "breathe", "relief", "thanks", "helpful", "shant", "confident", "theek", "goodbye", "accha", "good", "great", "khush", "ready"]

    if any(w in msg for w in high_distress):
        delta += 10.0
    elif any(w in msg for w in moderate_distress):
        delta += 4.0
    elif any(w in msg for w in positive_signals):
        delta -= 8.0

    return round(max(18.0, min(85.0, baseline + delta)), 1)


def _extract_facts(message: str, existing_facts: List[str]) -> List[str]:
    facts = list(existing_facts)
    msg = message.lower()
    fact_patterns = {
        "exam approaching": ["exam", "test", "pariksha", "paper"],
        "difficulty concentrating": ["concentrat", "focus", "dhyan", "blank"],
        "phone distraction": ["phone", "instagram", "youtube", "reels", "mobile"],
        "parental pressure": ["parent", "maa", "papa", "mom", "dad", "expect"],
        "trouble sleeping": ["sleep", "insomnia", "neend", "nind"],
        "relationship tension": ["friend", "breakup", "partner", "fight", "dost"],
        "workplace burnout": ["work", "office", "boss", "deadline"],
        "financial worry": ["money", "debt", "loan", "bill", "salary", "paisa"],
    }
    for fact, keywords in fact_patterns.items():
        if any(kw in msg for kw in keywords) and fact not in facts:
            facts.append(fact)
    return facts


# ---------- OFFLINE RESPONSE POOLS — organized by micro-topic ----------
MICRO_RESPONSES = {
    "farewell": {
        "en": [
            "Take care of yourself! Remember, even small steps count. Shield AI is always here whenever you need someone to talk to. You've got this! 💪",
            "Goodbye! You've shown real courage by opening up today. Come back anytime — this is your safe space, always. Wishing you a peaceful day ahead ✨",
            "See you soon! Before you go, remember — progress isn't always visible, but every conversation is a step forward. Take care! 🌟",
        ],
        "hi": [
            "Apna khayal rakhna! Yaad rakhna, chhote chhote steps bhi matter karte hain. Shield AI hamesha yahan hai jab bhi zaroorat ho. All the best! 💪",
            "Alvida! Aaj aapne bohot accha kiya baat karke. Jab bhi mann kare, wapas aana — ye aapki safe space hai, hamesha ✨",
            "Bye! Jaane se pehle yaad rakhna — progress hamesha dikhti nahi, par har baat ek step forward hai. Dhyan rakhna! 🌟",
        ],
        "gu": [
            "તમારું ધ્યાન રાખો! યાદ રાખો, નાના પગલાં પણ મહત્વના છે. Shield AI હંમેશા અહીં છે. ઓલ ધ બેસ્ટ! 💪",
        ],
    },
    "ready_to_act": {
        "en": [
            "That's the spirit! 🎯 Put your phone on airplane mode, set a 25-minute timer, and dive into ONE topic. You'll be surprised how much you can cover. Go crush it!",
            "Amazing — the hardest part was deciding to start, and you've already done that. Remember: just 25 focused minutes can change your entire day. You've got this! 💪",
            "Fantastic! Here's a pro tip: before you start, write down exactly ONE goal for this study session. Having a clear target makes focused work much easier. Go get it! 🚀",
        ],
        "hi": [
            "Ye hui na baat! 🎯 Phone airplane mode pe daalo, 25 minute ka timer lagao, aur ek topic me ghus jao. Jaake tod do!",
            "Badhiya — shuru karne ka decision hi sabse mushkil hota hai, aur wo toh kar liya tumne. Sirf 25 focused minutes poora din badal sakte hain. All the best! 💪",
            "Zabardast! Ek pro tip: shuru karne se pehle ek GOAL likh lo ki is session me kya complete karna hai. Clear target se focus aasan hota hai. Jao! 🚀",
        ],
        "gu": [
            "આ વાત ગમી! 🎯 ફોન airplane mode પર મૂકો, ૨૫ મિનિટનો ટાઈમર લગાવો, અને એક ટોપિકમાં ઘૂસી જાઓ. ઓલ ધ બેસ્ટ! 💪",
        ],
    },
    "gratitude": {
        "en": [
            "I'm really glad you're feeling a bit better! That shift you're feeling — hold onto it. It proves your mind CAN find calm even in stressful times. What helped the most in our conversation today?",
            "You're welcome! The fact that you can recognize feeling calmer shows real self-awareness. Before you go, would you like to try a quick 2-minute breathing exercise to lock in this peaceful feeling?",
            "It makes me happy to hear that! You took the first step by talking about it, and that takes courage. How do your energy and focus feel right now compared to when we started?",
        ],
        "hi": [
            "Ye sunke bohot accha laga! Jo thoda sa better feel ho raha hai — usse yaad rakhna. Ye prove karta hai ki aapka dimag stress me bhi shanti dhundh sakta hai. Aaj ki baat me sabse zyada kya help kara?",
            "Welcome! Ki aap calmer feel kar pa rahe ho, ye aapki self-awareness dikhata hai. Jaane se pehle ek quick 2-minute breathing exercise try karoge taaki ye peaceful feeling aur strong ho?",
            "Ye sunkar khushi hui! Baat karne ka pehla step lena — isme himmat lagti hai. Abhi aapki energy aur focus kaisi feel ho rahi hai compared to jab humne shuru kiya tha?",
        ],
        "gu": [
            "આ સાંભળીને ખૂબ આનંદ થયો! તમે જે થોડું સારું અનુભવો છો — તેને યાદ રાખો. અત્યારે તમારી ઊર્જા અને ફોકસ કેવું છે?",
        ],
    },
    "breathing_request": {
        "en": [
            "Absolutely! Let's do Box Breathing together 🧘\n\n→ Inhale slowly through your nose for 4 seconds...\n→ Hold gently for 4 seconds...\n→ Exhale slowly through your mouth for 4 seconds...\n→ Hold empty for 4 seconds...\n\nRepeat 4 times. How do you feel after that?",
            "Of course! Try the 4-7-8 technique — it's one of the most effective for instant calm:\n\n→ Breathe IN through your nose for 4 seconds\n→ HOLD your breath for 7 seconds\n→ Exhale slowly through your mouth for 8 seconds\n\nDo 3 rounds. You can also check our Toolkit page for a visual guided timer. Feeling any different? 🌊",
            "Let's do it right now! Close your eyes if it's comfortable. Breathe in deeply for 4 counts... hold it... and now slowly release for 6 counts. Feel your shoulders drop. One more round... Beautiful. How's your body feeling now? ✨",
        ],
        "hi": [
            "Bilkul! Chaliye Box Breathing karte hain 🧘\n\n→ Naak se 4 second dheere saans lo...\n→ 4 second roko...\n→ Mooh se 4 second dheere chodo...\n→ 4 second khali ruko...\n\n4 baar repeat karo. Kaisa lag raha hai ab?",
            "Zaroor! 4-7-8 technique try karo — ye instant calm ke liye sabse effective hai:\n\n→ Naak se 4 second saans lo\n→ 7 second roko\n→ Mooh se 8 second me dheere chodo\n\n3 baar karo. Toolkit page par visual timer bhi hai. Kuch alag feel ho raha hai? 🌊",
        ],
        "gu": [
            "ચોક્કસ! ચાલો Box Breathing કરીએ 🧘\n\n→ નાકથી ૪ સેકન્ડ ધીમે શ્વાસ લો...\n→ ૪ સેકન્ડ રોકો...\n→ મોંથી ૪ સેકન્ડ ધીમે છોડો...\n\n૪ વાર repeat કરો. હવે કેવું લાગે છે?",
        ],
    },
    "racing_thoughts": {
        "en": [
            "Racing thoughts at night are your brain's way of saying 'I have too much unprocessed stuff.' Try a Brain Dump tonight: grab a notebook and write EVERYTHING on your mind for 5 minutes. Don't edit, just dump. It tells your brain 'I've saved this, you can rest now.' Would you try it tonight?",
            "When your mind won't stop spinning, it's usually because your brain is in 'problem-solving mode' at the wrong time. One powerful trick: keep a small notepad by your bed. When a thought comes, write it down and tell yourself 'I'll handle this tomorrow.' Does this happen every night or just before exams?",
            "That restless feeling when thoughts keep looping is exhausting. Here's something that works: the 'worry time' technique. Set aside 15 minutes earlier in the day specifically FOR worrying. When thoughts come at night, you can tell yourself 'I already handled that during worry time.' Have you tried journaling before bed?",
        ],
        "hi": [
            "Raat ko dimag me thoughts daudna — ye brain ka tarika hai kehne ka 'mere paas bohot kuch pending hai.' Aaj raat try karo: notebook lo aur 5 minute me sab kuch likh do. Edit mat karo, bas likh do. Brain ko lagega 'save ho gaya, ab so sakta hoon.' Try karoge?",
            "Jab dimag band hi nahi hota, matlab brain galat time par problem-solving mode me hai. Ek trick: bed ke paas ek chhoti notebook rakho. Thought aaye toh likh do aur bolo 'kal dekhunga.' Ye har raat hota hai ya sirf exams ke time?",
        ],
        "gu": [
            "રાત્રે વિચારો દોડવા — આ મગજનો કહેવાનો રસ્તો છે 'મારી પાસે ઘણું pending છે.' આજ રાત્રે notebook લો અને ૫ મિનિટમાં બધું લખો. મગજને લાગશે 'save થઈ ગયું, હવે સૂઈ શકાય.' અજમાવશો?",
        ],
    },
    "sleep_issues": {
        "en": [
            "Sleep problems and stress feed each other in a vicious cycle. When your mind won't quiet down at night, try a 'digital sunset' — no screens 30 minutes before bed. The blue light tricks your brain into staying alert. What time do you usually try to sleep?",
            "Not sleeping well makes everything feel 10x harder. Here's something simple but powerful: keep your bedroom cool, dark, and phone-free. Also, try going to bed at the same time every night — consistency is the #1 sleep hack. How many hours are you currently getting?",
            "Poor sleep doesn't just make you tired — it actually makes your brain worse at handling stress. Try the 'military sleep technique': relax every muscle starting from your face down to your toes, clear your mind for 10 seconds, then picture yourself in a peaceful place. It takes practice but works incredibly well. Does your mind race when you try to sleep?",
        ],
        "hi": [
            "Neend na aana aur stress ek doosre ko feed karte hain. Raat ko screen ka blue light dimag ko jagaye rakhta hai. Sone se 30 minute pehle phone band karo — ye ek chhota change bohot bada fark laata hai. Normally kitne baje sone ki koshish karte ho?",
            "Neend properly na aaye toh agla din 10 guna mushkil lagta hai. Ek simple trick: kamra thanda rakho, andhera karo, aur phone door rakho. Har raat same time sone ki habit banao — consistency sabse bada sleep hack hai. Abhi kitne ghante so pa rahe ho?",
        ],
        "gu": [
            "ઊંઘ ન આવવી અને તણાવ એકબીજાને feed કરે છે. રાત્રે screen નો blue light મગજને જાગૃત રાખે છે. સૂતા પહેલા ૩૦ મિનિટ ફોન બંધ કરો. સામાન્ય રીતે કેટલા વાગ્યે સૂવાનો પ્રયત્ન કરો છો?",
        ],
    },
    "phone_distraction": {
        "en": [
            "Phone checking is one of the biggest focus-killers because it gives your brain instant dopamine hits. Try this: put your phone in a different room (not just face-down on your desk) and set a 25-minute study timer. Most people find that once the phone is physically away, concentration improves dramatically. How many hours do you typically study per day?",
            "Instagram reels and YouTube shorts are literally designed to be addictive — so don't blame yourself. The trick is to make the phone HARDER to access: put it in another room, or use an app blocker. Even 20 minutes without it will feel surprisingly productive. What's your biggest distraction right now?",
            "Here's a game-changer: try the 'phone jail' technique. Before you study, give your phone to a family member or lock it in a drawer. Tell yourself 'I'll check it after 25 minutes.' The first few minutes are hard, but then focus kicks in naturally. Ready to try it for your next study session?",
        ],
        "hi": [
            "Phone checking sabse bada focus killer hai kyunki brain ko instant dopamine milta hai. Ek kaam karo: phone doosre room me rakh do (sirf ulta mat karo) aur 25 minute ka timer lagao. Ek baar phone physically door ho jaye toh concentration apne aap improve hota hai. Din me kitne ghante padhai karte ho?",
            "Instagram reels aur YouTube shorts literally addictive hone ke liye design kiye gaye hain — toh apne aap ko blame mat karo. Trick ye hai ki phone ko MUSHKIL bana do access karna. Doosre room me rakho ya app blocker use karo. Abhi sabse bada distraction kya hai?",
        ],
        "gu": [
            "ફોન checking સૌથી મોટો focus killer છે. એક કામ કરો: ફોન બીજા રૂમમાં મૂકો અને ૨૫ મિનિટનો ટાઈમર લગાવો. ફોન door થઈ જાય એટલે concentration આપોઆપ improve થાય છે. દિવસમાં કેટલા કલાક ભણો છો?",
        ],
    },
    "concentration": {
        "en": [
            "Difficulty concentrating during stress is actually a biological response — your brain's fight-or-flight system makes it hard to focus on 'non-survival' tasks like studying. The fix? Short, intense study blocks. Try 25 minutes ON, then 5 minutes completely OFF. Is it digital distractions pulling you away, or more like mental fog?",
            "When concentration drops, your brain is telling you it needs a different approach, not more willpower. Try active studying instead of passive reading: make flashcards, teach the concept out loud, or solve problems. These engage your brain differently. What study method are you currently using?",
            "Focus issues often come from trying to do too much at once. Here's a trick: before each study session, write down the ONE specific thing you'll work on (not 'study math' but 'solve 5 quadratic equation problems'). This clarity reduces mental friction dramatically. What specific topic do you need to focus on?",
        ],
        "hi": [
            "Stress me focus na hona actually biological response hai — brain ka fight-or-flight system 'non-survival' tasks jaise padhai par dhyan lagane nahi deta. Fix? Chhote intense blocks me padho. 25 minute ON, 5 minute pura OFF. Digital distractions hain ya mental fog jaise lag raha hai?",
            "Jab concentration gir jaaye, brain keh raha hai ki usse alag approach chahiye, zyada willpower nahi. Active studying try karo: flashcards banao, concept bol kar samjhao, ya problems solve karo. Ye brain ko alag tarah engage karte hain. Abhi kaunsi method use kar rahe ho?",
        ],
        "gu": [
            "તણાવમાં ધ્યાન ન કેન્દ્રિત થવું biological response છે. Fix? ટૂંકા intense blocks માં વાંચો — ૨૫ મિનિટ ON, ૫ મિનિટ OFF. Digital distractions છે કે mental fog જેવું લાગે છે?",
        ],
    },
    "parental_pressure": {
        "en": [
            "Family pressure is uniquely heavy because it comes wrapped in love. Your parents want the best for you, but sometimes their expectations feel like an extra weight on top of your own goals. What matters is that you're trying — and that deserves recognition. What specific expectation is weighing on you the most?",
            "When parents set high expectations, it usually comes from their own experiences and fears. But you're a different person in a different time. You're allowed to have your own pace. Have you tried talking to them about how their expectations make you feel?",
            "Parental pressure + exam stress is one of the toughest combinations. Here's a perspective shift: focus on what YOU can control — your preparation, your effort, your mindset. The results will follow. Is the pressure more about specific marks, or a general 'be the best' expectation?",
        ],
        "hi": [
            "Family ka pressure isliye heavy hai kyunki ye pyaar me lipti hui expectation hai. Parents best chahte hain, par kabhi kabhi unki expectations ek extra weight lagti hain. Jo matter karta hai wo ye hai ki aap try kar rahe ho. Sabse badi specific expectation kya hai jo aap par hai?",
            "Jab parents high expectations rakhte hain, ye usually unke apne experiences aur fears se aata hai. Par aap alag insaan ho, alag time me. Kya aapne unse baat ki hai ki unki expectations kaise feel hoti hain?",
            "Parents ka pressure + exam stress — ye sabse mushkil combination hai. Ek perspective shift: focus karo jis par CONTROL hai — preparation, effort, mindset. Results follow karenge. Pressure specific marks ka hai ya general 'best bano' wala?",
        ],
        "gu": [
            "કુટુંબનું દબાણ ભારે છે કારણ કે તે પ્રેમમાં વીંટાળેલી અપેક્ષા છે. માતાપિતા best ઈચ્છે છે, પણ ક્યારેક તેમની અપેક્ષાઓ extra weight લાગે છે. સૌથી મોટી specific અપેક્ષા શું છે?",
        ],
    },
    "specific_subjects": {
        "en": [
            "Mathematics and Physics can feel brutal because they require deep problem-solving, not just memorization. The key is deliberate practice — solve problems repeatedly until the patterns become automatic. Start with your textbook examples, then move to previous year papers. Which chapters specifically feel the hardest?",
            "For subjects like Math and Physics, passive reading doesn't work. You need to solve, fail, understand why, and solve again. That's how neural pathways for problem-solving actually form. Have you tried solving problems without looking at solutions first?",
            "These subjects reward consistency over cramming. Even 30 minutes of daily problem-solving beats 5 hours of last-minute panic studying. Try setting a daily target of solving just 10 problems. Small, consistent effort compounds fast. What's your exam schedule looking like?",
        ],
        "hi": [
            "Math aur Physics isliye mushkil lagti hain kyunki inme deep problem-solving chahiye, sirf yaad karna nahi. Key hai practice — problems baar baar solve karo jab tak pattern automatic na ho jaaye. Pehle textbook examples karo, phir previous year papers. Kaunse chapters sabse mushkil lag rahe hain?",
            "Math aur Physics me passive reading kaam nahi karti. Solve karo, galat ho, samjho kyun, dobara solve karo. Aise hi problem-solving ke neural pathways bante hain. Kya solutions dekhe bina problems solve karne ki koshish ki hai?",
        ],
        "gu": [
            "ગણિત અને ભૌતિકશાસ્ત્ર deep problem-solving માગે છે, માત્ર યાદ કરવું નહીં. Key છે practice — problems વારંવાર solve કરો. ટેક્સ્ટબુક examples પહેલા કરો, પછી previous year papers. કયા chapters સૌથી મુશ્કેલ લાગે છે?",
        ],
    },
    "study_hours": {
        "en": [
            "That's actually a solid amount of study time! But here's the thing — it's not about how MANY hours, it's about how FOCUSED those hours are. Are you studying in one long stretch, or breaking it into 25-minute focused blocks? The Pomodoro method can triple your efficiency. Which subject is scheduled first for your exam?",
            "Quality always beats quantity when it comes to study hours. 3 focused hours can be more productive than 6 distracted ones. Try tracking your ACTUAL focused time (without phone breaks) — you might be surprised. What does your typical study session look like?",
            "That's a good target! One tip: schedule your hardest subject during your peak energy time (usually morning for most people). Your brain processes difficult material better when it's fresh. When do you feel most alert during the day?",
        ],
        "hi": [
            "Ye actually accha study time hai! Par baat ye hai — kitne ghante nahi, kitne FOCUSED ghante, wo matter karta hai. Ek long stretch me padhte ho ya 25-minute blocks me? Pomodoro method se efficiency triple ho sakti hai. Pehla exam kis subject ka hai?",
            "Padhai me quality hamesha quantity se jeetiti hai. 3 focused ghante 6 distracted ghanton se zyada productive hote hain. Apna ACTUAL focused time track karo (phone breaks without) — surprise ho sakte ho. Typical study session kaisa hota hai?",
        ],
        "gu": [
            "આ ખરેખર સારો study time છે! પણ વાત એ છે — કેટલા FOCUSED કલાકો છે, એ matter કરે છે. ૨૫ મિનિટના blocks માં વાંચો છો? Pomodoro method efficiency ત્રણ ગણી કરી શકે છે. પહેલી exam કયા subject ની છે?",
        ],
    },
    "how_to_advice": {
        "en": [
            "Great question! Here are 3 evidence-based stress reducers you can start RIGHT NOW:\n\n1️⃣ **Box Breathing** — Inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec. Do 4 rounds.\n2️⃣ **Brain Dump** — Write everything stressing you out on paper. Getting it out of your head reduces mental load by up to 40%.\n3️⃣ **20-Minute Rule** — Whatever feels overwhelming, commit to just 20 minutes. Starting is usually the hardest part.\n\nWhich one would you like to try first?",
            "Here's what actually works (backed by science):\n\n🧘 **Immediate relief**: Try 4-7-8 breathing — breathe in for 4 seconds, hold for 7, exhale for 8. Activates your vagus nerve and calms you within 60 seconds.\n\n📝 **Daily habit**: Write 3 things that went well today before bed. Rewires your brain away from stress-focus.\n\n🚶 **Physical reset**: A 10-minute walk releases endorphins.\n\nWhat type of stress is hitting you hardest — academic, personal, or general overwhelm?",
            "The best way to reduce stress depends on what's causing it. But universally, these 3 things help almost everyone:\n\n1. **Move your body** — even 5 minutes of stretching\n2. **Talk about it** — which you're already doing right now! ✨\n3. **Break it down** — whatever feels huge, split it into tiny doable steps\n\nWhat specific situation is causing you the most stress right now?",
        ],
        "hi": [
            "Bohot accha sawaal! Ye 3 cheezein ABHI se kaam karengi:\n\n1️⃣ **Box Breathing** — 4 sec saans, 4 sec roko, 4 sec bahar, 4 sec ruko. 4 baar karo.\n2️⃣ **Brain Dump** — Paper par sab tension likh do. Dimag se bahar nikalne se 40% mental load kam hota hai.\n3️⃣ **20-Minute Rule** — Jo overwhelming lage, sirf 20 minute karo. Shuru karna hi mushkil hota hai.\n\nKaunsa pehle try karoge? 🎯",
            "Stress kam karne ke liye ye kaam karta hai (real science):\n\n🧘 **Turant rahat**: 4-7-8 breathing — 4 second saans, 7 second roko, 8 second me chodo. 60 second me shant.\n📝 **Daily habit**: Raat ko 3 acchi cheezein likho.\n🚶 **Physical reset**: 10 minute walk.\n\nSabse zyada kaun sa stress hai — padhai, personal, ya general overwhelm?",
        ],
        "gu": [
            "ખૂબ સારો સવાલ! આ 3 વસ્તુઓ અત્યારથી કામ કરશે:\n\n1️⃣ **Box Breathing** — ૪ સેકન્ડ શ્વાસ, ૪ રોકો, ૪ બહાર. ૪ વાર કરો.\n2️⃣ **Brain Dump** — કાગળ પર ચિંતા લખો.\n3️⃣ **20-Minute Rule** — ૨૦ મિનિટ જ કરો.\n\nકયું પહેલા અજમાવશો? 🎯",
        ],
    },
    "short_affirmative": {
        "en": [
            "Got it! Since you're dealing with multiple things at once, let's prioritize. What feels like the SINGLE most urgent thing you need to handle first? Sometimes tackling just one item gives you momentum for everything else.",
            "Understood. When there are several stressors, the key is not to fight them all simultaneously. Pick one thing you CAN control today and give it your full attention. What would that be for you?",
            "I hear you. Let's keep this simple — if you could wave a magic wand and fix ONE thing right now, what would it be? That's usually the best place to start.",
        ],
        "hi": [
            "Samajh gaya! Jab ek saath bohot kuch ho, toh prioritize karo. SABSE pehle kya handle karna zaroori hai? Ek cheez tackle karne se baaki sab ke liye momentum milta hai.",
            "Accha. Jab multiple stressors hon, toh sab ek saath mat lado. Aaj ek cheez choose karo jo CONTROL me hai aur uspe focus karo. Wo kya hoga aapke liye?",
            "Suna. Simple rakhte hain — agar abhi ek jaadu se ek cheez theek ho sakti, toh kya hoti? Usually wahi best starting point hota hai.",
        ],
        "gu": [
            "સમજી ગયો! જ્યારે એકસાથે ઘણું હોય, ત્યારે prioritize કરો. સૌથી URGENT શું છે? એક વસ્તુ handle કરવાથી બાકી બધા માટે momentum મળે છે.",
        ],
    },
    "academic_stress": {
        "en": [
            "Exam pressure can feel crushing, but here's something that actually works — instead of studying for hours straight, try 25-minute focused blocks with 5-minute breaks. Your brain retains more with shorter, intense sessions. Which subject is giving you the hardest time right now?",
            "I get it — when you see the whole syllabus, it feels impossible. But here's the thing: you don't need to finish everything. Focus on high-weightage topics first. That alone can boost your confidence. What's your exam schedule looking like?",
            "Academic stress hits different because it comes with everyone's expectations on top of your own. Let's take a step back — what's the ONE thing that, if you figured it out today, would give you the most relief?",
            "When your brain is overloaded with study material, it actually needs small mental resets. Try studying for 25 mins, then do 2 minutes of slow breathing. It sounds simple but it genuinely helps your memory consolidate. Want to try it together?",
            "The fear of not performing well can sometimes be worse than the actual exam. Remember — preparation matters more than perfection. Have you made a rough study plan yet, or is that part of what's stressing you?",
            "One thing that really helps with exam anxiety is practice papers. When you see the actual format and types of questions, it reduces the unknown factor. Have you gone through any previous year papers?",
        ],
        "hi": [
            "Exam ka pressure bohot heavy hota hai, especially jab sab kuch ek saath aa jaaye. Ek kaam karo — abhi sirf ek subject pick karo aur uske 2-3 important chapters list karo. Kaun sa subject sabse pehle karna chahoge?",
            "Padhai ka tension tab aur badh jaata hai jab hum poora syllabus ek saath dekhte hain. Focus ek chapter par karo, 25 minute lagao, phir 5 min break lo. Ye Pomodoro technique actually kaam karti hai. Try karoge?",
            "Main samajh sakta hoon ki exams ka stress kitna overwhelming hota hai. Par ek baat yaad rakhna — preparation perfect nahi honi chahiye, consistent honi chahiye. Aaj kitne time padhai ka plan hai?",
            "Jab padhai me mann nahi lagta, tab guilty feel karna aur bhi zyada stress deta hai. Sabse pehle apne aap ko permission do ki thoda break lena okay hai. Phir ek chhota sa target set karo. 30 minute ka focused session try kar sakte ho?",
            "Exams ke waqt sabse badi galti ye hoti hai ki hum sab kuch yaad karne ki koshish karte hain. Smart studying matlab high-weightage topics pehle cover karo. Kaunse topics zyada marks ke hain?",
        ],
        "gu": [
            "પરીક્ષાનું દબાણ ખૂબ ભારે લાગે છે, ખાસ કરીને જ્યારે બધું એકસાથે આવે. એક subject પસંદ કરો અને તેના 2-3 important chapters list કરો. કયો વિષય પહેલા કરવો છે?",
            "ભણવાનો તણાવ ત્યારે વધે છે જ્યારે આખો syllabus એકસાથે જોઈએ. ૨૫ મિનિટ ધ્યાન કેન્દ્રિત કરો, ૫ મિનિટ break લો. ખરેખર કામ કરે છે. અજમાવશો?",
            "હું સમજું છું કે exam stress કેટલો overwhelming હોય. યાદ રાખો — preparation perfect નહીં, consistent હોવી જોઈએ. આજે કેટલો સમય ભણવાનો plan છે?",
        ],
    },
    "stress_general": {
        "en": [
            "I'm listening. Stress can feel like a heavy fog that makes everything harder. The first step is recognizing it — and you've already done that by talking about it. What's been weighing on you the most?",
            "Feeling stressed is your body's signal that something needs attention. It's not weakness — it's awareness. Can you pinpoint what's causing the most tension right now?",
            "Stress is incredibly common, but that doesn't make YOUR stress any less valid. Everyone's threshold is different. Let's figure out what's specifically triggering yours. Is it one big thing or many small things piling up?",
        ],
        "hi": [
            "Main sun raha hoon. Stress ek bhari dhundh jaisa hota hai jo sab kuch mushkil bana deta hai. Pehla step hai isse recognize karna — aur wo aapne kar liya baat karke. Sabse zyada kya weight kar raha hai?",
            "Stressed feel hona body ka signal hai ki kuch attention chahiye. Ye kamzori nahi — ye awareness hai. Kya pinpoint kar sakte ho ki abhi sabse zyada tension kis baat ki hai?",
        ],
        "gu": [
            "હું સાંભળી રહ્યો છું. Stress ભારે ધુમ્મસ જેવું છે. પહેલું step છે recognize કરવું — અને એ તમે કરી લીધું. સૌથી વધુ શું weight કરી રહ્યું છે?",
        ],
    },
    "relationship": {
        "en": [
            "Relationship challenges can drain your energy in ways nothing else does. Whether it's a friend, partner, or family member — the hurt is real. What happened that's been weighing on you?",
            "When someone important to us causes pain, it creates a confusing mix of love and frustration. You don't have to figure it all out right now. Can you tell me more about what's going on?",
            "Sometimes the hardest part isn't the fight itself, but the silence after. Are you dealing with active conflict right now, or is it more of a growing distance?",
        ],
        "hi": [
            "Rishton ki problems sabse zyada energy drain karti hain. Kya hua hai jo mind se nahi ja raha?",
            "Jab koi apna insaan hurt kare, toh confusing hota hai — pyaar bhi aur gussa bhi. Batao kya chal raha hai?",
        ],
        "gu": [
            "સંબંધોની સમસ્યાઓ સૌથી વધુ ઊર્જા ખેંચે છે. શું થયું છે જે મનમાંથી જતું નથી?",
        ],
    },
    "financial": {
        "en": [
            "Financial stress feels suffocating because money is tied to survival. But remember — this is a situation, not your identity. What's the most pressing financial concern right now?",
            "When money worries consume your thoughts, try this: write down your exact income and expenses. Seeing real numbers (instead of vague fears) often reduces anxiety. Would you try that?",
        ],
        "hi": [
            "Paise ki tension sabse zyada suffocating hai kyunki ye survival se judi hai. Par yaad rakhein — ye situation hai, identity nahi. Abhi sabse badi financial chinta kya hai?",
        ],
        "gu": [
            "નાણાંકીય તણાવ ગૂંગળામણ જેવો છે. પણ યાદ રાખો — આ situation છે, identity નથી. અત્યારે સૌથી મોટી financial ચિંતા શું છે?",
        ],
    },
    "work_burnout": {
        "en": [
            "Work burnout doesn't mean you're weak — it means you've been strong for too long without recovery. Try the Eisenhower matrix: urgent+important vs. just urgent. What's your biggest work stressor?",
            "When work takes over, your brain loses creative problem-solving ability. You need recovery, not more hustle. When was your last proper break?",
        ],
        "hi": [
            "Kaam ki thakan matlab kamzori nahi — matlab aap bohot lambe time se bina break ke strong the. Sabse bada work stressor kya hai?",
        ],
        "gu": [
            "કામનો થાક નબળાઈ નથી — એનો અર્થ છે લાંબા સમયથી યોગ્ય આરામ વિના મજબૂત હતા. સૌથી મોટો work stressor શું છે?",
        ],
    },
    "anxiety": {
        "en": [
            "Anxiety makes your brain focus on worst-case scenarios. Here's a grounding technique: feel your feet on the floor, take one slow breath, ask yourself — what's the MOST LIKELY outcome? What's making you anxious?",
            "When anxiety hits, your body enters fight-or-flight. Let's calm it: breathe in for 4, hold for 4, out for 6. This activates your calm system. Want to try together?",
        ],
        "hi": [
            "Anxiety dimag ko worst-case par focus karati hai. Grounding try karo: pair zameen par mehsoos karo, dheemi saans lo. Sabse LIKELY result kya hai? Kya anxious kar raha hai?",
        ],
        "gu": [
            "ચિંતા મગજને worst-case પર focus કરાવે છે. Grounding અજમાવો: પગ જમીન પર અનુભવો, ધીમો શ્વાસ લો. શું ચિંતા કરાવે છે?",
        ],
    },
    "loneliness": {
        "en": [
            "Feeling alone in your struggles makes everything twice as hard. While I'm an AI companion, I'm here as a safe, non-judgmental space. Have you thought about sharing even a small part of how you feel with someone you trust?",
            "Loneliness is one of the most painful experiences. You're not broken for feeling it. Connection starts small — even a brief text to someone can bridge the gap. What would feel meaningful right now?",
        ],
        "hi": [
            "Akele struggles me sab double mushkil lagta hai. Main AI hoon par aapke liye safe space hoon. Kya kisi trusted insaan se thodi si baat share karne ka socha hai?",
        ],
        "gu": [
            "એકલા struggles માં બધું ડબલ મુશ્કેલ લાગે છે. હું AI છું પણ safe space છું. કોઈ trusted વ્યક્તિ સાથે share કરવાનું વિચાર્યું છે?",
        ],
    },
    "sadness": {
        "en": [
            "I'm sorry you're feeling this weight. It takes strength to acknowledge when things feel heavy. Is this connected to recent events, or more of a build-up over time?",
            "Sadness is a valid emotion that deserves space. You don't need to 'fix' it immediately. Sometimes sitting with it and acknowledging it IS the healthiest response. I'm here with you.",
        ],
        "hi": [
            "Ye sunke mujhe dukh hua. Jab cheezein bhari lagein toh acknowledge karna himmat ki nishani hai. Ye recent events se juda hai ya time ke saath build-up hua hai?",
        ],
        "gu": [
            "આ સાંભળીને દુઃખ થયું. જ્યારે વસ્તુઓ ભારે લાગે ત્યારે acknowledge કરવું હિંમતની નિશાની છે. આ recent events સાથે જોડાયેલું છે?",
        ],
    },
    "general": {
        "en": [
            "I'm here and I'm listening. Sometimes just having someone to talk to makes a difference. What's been on your mind lately?",
            "Thanks for reaching out. Whatever you're going through, you don't have to figure it out alone. What's been weighing on you?",
            "I appreciate you being open with me. Let's start wherever feels right — there's no wrong way to begin. What would you like to talk about?",
            "Sometimes it's hard to put what we're feeling into words, and that's okay. We can start simple — on a scale of 1-10, how would you rate your stress level today?",
        ],
        "hi": [
            "Main yahan hoon aur sun raha hoon. Kabhi kabhi bas kisi se baat karna bhi fark daalata hai. Kya chal raha hai mann me?",
            "Baat karne ke liye thanks. Akele handle karna zaroori nahi. Kya cheez sabse zyada weight kar rahi hai?",
            "Aapki openness ki appreciate karta hoon. Jahan se shuru karna ho karo — koi galat tarika nahi. Kya baat karni hai?",
        ],
        "gu": [
            "હું અહીં છું અને સાંભળી રહ્યો છું. ક્યારેક બસ કોઈની સાથે વાત કરવાથી ફરક પડે છે. શું ચાલી રહ્યું છે?",
            "વાત કરવા આભાર. એકલા handle કરવું જરૂરી નથી. શું ચીજ સૌથી વધારે ભારે લાગે છે?",
        ],
    },
}


# ---------- Main Engine ----------
class ConversationEngine:
    def __init__(self):
        self.sessions: Dict[str, ConversationSession] = {}

    def get_session(self, session_id: Optional[str] = None) -> ConversationSession:
        if not session_id:
            session_id = str(uuid.uuid4())
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(session_id)
        return self.sessions[session_id]

    def _detect_language(self, message: str, language_hint: str) -> str:
        msg = message.lower()
        hindi_markers = ["hai", "hoon", "raha", "rahi", "kya", "bhai", "yaar", "bohot", "mujhe", "kaise", "batao", "karo", "nahi", "abhi", "aur", "toh", "padhai", "karu", "kar", "mera", "hain", "tha", "thi", "ho"]
        gujarati_markers = ["chhe", "chhu", "thay", "mane", "su", "karo", "chinta", "kem", "cho"]
        
        hindi_count = sum(1 for w in hindi_markers if w in msg.split())
        gujarati_count = sum(1 for w in gujarati_markers if w in msg.split())
        
        if gujarati_count >= 2:
            return "gu"
        if hindi_count >= 2 or language_hint == "hi":
            return "hi"
        if language_hint == "gu":
            return "gu"
        return "en"

    def _get_offline_response(self, micro_topic: str, lang: str, session: ConversationSession) -> str:
        """Get a unique offline response for this session. Never returns duplicates within a session."""
        
        # Try micro-topic first
        pool = MICRO_RESPONSES.get(micro_topic, {})
        responses = pool.get(lang, pool.get("en", []))
        
        # Filter out already-used responses in this session
        available = [r for r in responses if r not in session.used_responses]
        
        if available:
            return random.choice(available)
        
        # If micro-topic exhausted, try collecting from ALL pools
        all_responses = []
        for topic_key, topic_pool in MICRO_RESPONSES.items():
            for r in topic_pool.get(lang, topic_pool.get("en", [])):
                if r not in session.used_responses:
                    all_responses.append(r)
        
        if all_responses:
            return random.choice(all_responses)
        
        # Ultimate fallback — generate a dynamic response
        turn = session.turn_counter + 1
        dynamic_responses = [
            f"I hear what you're saying, and it's clear this is weighing on you. Let's work through this together — what feels like the most pressing part right now?",
            f"Thank you for continuing to share with me. Each thing you express helps us understand the bigger picture. What would you like to explore next?",
            f"You've been really open, and I appreciate that. We've covered a lot today. Is there anything else on your mind, or would you like to try a quick relaxation exercise?",
            f"It sounds like there's a lot going on. Let's focus on what matters most to you RIGHT NOW — not everything, just one thing. What's that one thing?",
            f"I'm noticing you've been thinking about this deeply. That self-awareness is genuinely powerful. How are you feeling right now compared to when we started talking?",
        ]
        available_dynamic = [r for r in dynamic_responses if r not in session.used_responses]
        if available_dynamic:
            return random.choice(available_dynamic)
        
        return f"I'm here with you, and every conversation matters. What would you like to talk about next?"

    def process_message(self, message: str, session_id: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
        session = self.get_session(session_id)
        lang = self._detect_language(message, language)
        
        # Update facts and detect micro-topic
        session.user_facts = _extract_facts(message, session.user_facts)
        micro_topic = _detect_micro_topic(message, session.current_topic)
        broad_topic = _get_broad_topic(micro_topic)
        stress_score = _calculate_stress(message, session.stress_trajectory)

        # Try Gemini API first
        ai_response = None
        _init_gemini()
        
        if _gemini_available and _gemini_model:
            try:
                chat = _get_gemini_chat(session_id or "default", session.get_chat_history_for_gemini())
                
                context_prefix = ""
                if session.user_facts:
                    context_prefix = f"[Context: User has mentioned: {', '.join(session.user_facts)}. Current stress level: {stress_score}/100. Topic: {micro_topic}. Turn: {session.turn_counter + 1}] "
                
                response = chat.send_message(f"{context_prefix}{message}")
                ai_response = response.text.strip()
                
                if ai_response.startswith("[Context"):
                    ai_response = ai_response.split("]", 1)[-1].strip()
                    
            except Exception as e:
                print(f"[ConversationEngine] Gemini API error: {e}")
                traceback.print_exc()
                ai_response = None

        # Fallback to offline engine
        if not ai_response:
            ai_response = self._get_offline_response(micro_topic, lang, session)

        # Record turn (this also adds to session.used_responses)
        session.add_turn(
            user_msg=message,
            ai_msg=ai_response,
            stress_score=stress_score,
            topic=broad_topic
        )
        session.update_summary()

        # Calculate trend
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
            "current_topic": session.current_topic,
            "conversation_summary": session.conversation_summary,
            "stress_score": stress_score,
            "stress_trend": trend,
            "user_facts": session.user_facts
        }


conversation_engine = ConversationEngine()
