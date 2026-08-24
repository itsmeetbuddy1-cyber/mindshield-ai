from typing import Dict, List, Any, Optional
import uuid
import re

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
        self.unanswered_questions: List[str] = []
        
    def add_turn(self, user_msg: str, ai_msg: str, question: Optional[str], stress_score: float, topic: str):
        self.turn_counter += 1
        self.last_user_message = user_msg
        self.history.append({"turn": self.turn_counter, "role": "user", "content": user_msg})
        self.history.append({"turn": self.turn_counter, "role": "ai", "content": ai_msg})
        self.stress_trajectory.append(stress_score)
        self.current_topic = topic
        self.last_ai_question = question
        
    def update_summary(self):
        facts_str = ", ".join(self.user_facts) if self.user_facts else "general emotional check-in"
        self.conversation_summary = (
            f"User is discussing {self.current_topic}. "
            f"Key details: {facts_str}. "
            f"Current conversation length: {self.turn_counter} turns."
        )


class ConversationEngine:
    def __init__(self):
        self.sessions: Dict[str, ConversationSession] = {}
        
    def get_session(self, session_id: Optional[str] = None) -> ConversationSession:
        if not session_id:
            session_id = str(uuid.uuid4())
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(session_id)
        return self.sessions[session_id]

    def _extract_facts_and_topic(self, message: str, session: ConversationSession) -> tuple[List[str], str]:
        facts = list(session.user_facts)
        msg_l = message.lower()
        topic = session.current_topic
        
        # Academic & Study
        if any(w in msg_l for w in ["exam", "test", "pariksha", "padhai", "paper", "marks", "grade", "syllabus", "fail", "college", "school"]):
            topic = "academic stress"
            if "exam approaching" not in facts: facts.append("exam approaching")
        if any(w in msg_l for w in ["concentrat", "focus", "dhyan", "ekagrata", "blank"]):
            if "difficulty concentrating" not in facts: facts.append("difficulty concentrating")
        if any(w in msg_l for w in ["phone", "instagram", "youtube", "reels", "mobile", "distract"]):
            if "phone distraction" not in facts: facts.append("phone distraction")
        if any(w in msg_l for w in ["hour", "ghante", "ghanta", "4-5", "5-6", "time"]):
            if "studying 4-5 hours daily" not in facts: facts.append("studying 4-5 hours daily")
            
        # Parental & Family Expectations
        if any(w in msg_l for w in ["parent", "parents", "maa", "papa", "mom", "dad", "family", "expect", "shout", "pressure", "ghar"]):
            topic = "parental expectations"
            if "parental pressure" not in facts: facts.append("parental pressure")
            
        # Sleep & Physical
        if any(w in msg_l for w in ["sleep", "insomnia", "neend", "nind", "tired", "thakan", "exhausted", "late night", "racing"]):
            topic = "sleep difficulty"
            if "trouble sleeping" not in facts: facts.append("trouble sleeping")
            
        # Relationship
        if any(w in msg_l for w in ["friend", "relationship", "breakup", "partner", "fight", "dost", "ladai", "love"]):
            topic = "relationship tension"
            if "relationship tension" not in facts: facts.append("relationship tension")
            
        # Work & Burnout
        if any(w in msg_l for w in ["work", "office", "job", "boss", "deadline", "burnout", "naukri", "kaam"]):
            topic = "workload burnout"
            if "workplace burnout" not in facts: facts.append("workplace burnout")

        return facts, topic

    def _calculate_stress(self, message: str, session: ConversationSession) -> float:
        msg_l = message.lower()
        baseline = session.stress_trajectory[-1] if session.stress_trajectory else 35.0
        delta = 0.0
        
        # High distress terms
        if any(w in msg_l for w in ["fail", "panic", "overwhelmed", "cannot handle", "crying", "suffocating", "hate this", "blanking out"]):
            delta += 12.0
        elif any(w in msg_l for w in ["stress", "anxious", "tension", "worry", "pressure", "scared", "chinta", "distract", "pareshan"]):
            delta += 5.0
        elif any(w in msg_l for w in ["calmer", "better", "breathe", "relief", "understand", "thanks", "helpful", "shant", "confident", "theek", "goodbye"]):
            delta -= 10.0
            
        score = max(18.0, min(85.0, baseline + delta))
        return round(score, 1)

    def process_message(self, message: str, session_id: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
        session = self.get_session(session_id)
        msg_raw = message.lower().strip()
        msg_clean = re.sub(r'[^\w\s]', '', msg_raw)
        
        is_hindi = language == "hi" or any(w in msg_raw for w in ["hai", "hoon", "raha", "rahi", "kya", "bhai", "tension", "padhai", "dar", "neend", "bohot", "mujhe", "kaise", "samajh", "batao"])
        is_gujarati = language == "gu" or any(w in msg_raw for w in ["chhe", "chhu", "thay", "mane", "su", "karo", "chinta"])
        lang = "hi" if is_hindi else "gu" if is_gujarati else "en"
        
        session.user_facts, topic = self._extract_facts_and_topic(message, session)
        stress_score = self._calculate_stress(message, session)
        
        direct_answer = ""
        follow_up_q = ""
        
        # 1. SPECIFIC SCENARIOS WITH UNIQUE MULTI-TURN DISPATCH
        
        # Scenario: Farewell / Goodbye
        if any(w in msg_clean for w in ["goodbye", "bye", "alvida", "see you", "signing off", "chalta hoon"]):
            if lang == "hi":
                direct_answer = "Alvida! Aapne aaj bohot acchi progress ki hai. Jab bhi zaroorat ho, Shield AI hamesha yahan hai."
                follow_up_q = "All the best aapke exams aur preparation ke liye!"
            elif lang == "gu":
                direct_answer = "આવજો! તમારી પરીક્ષા માટે ખૂબ ખૂબ શુભેચ્છાઓ."
                follow_up_q = "જ્યારે પણ જરૂર હોય ત્યારે હું અહીં છું."
            else:
                direct_answer = "Goodbye! You've made great progress today breaking down your study plan. Shield AI is always here whenever you need support."
                follow_up_q = "Best of luck with your preparation!"

        # Scenario: Ready to Study / Positive Momentum
        elif any(w in msg_clean for w in ["ready to start", "going to study", "start my", "shuru karta hoon", "padhne ja raha"]):
            if lang == "hi":
                direct_answer = "Bohot badhiya! Phone ko side rakh kar pura focus ek hi topic par lagayein. 25 minute baad break lena mat bhooliyega."
                follow_up_q = "Aap completely ready hain, all the best!"
            elif lang == "gu":
                direct_answer = "ખૂબ સરસ! ૨૫ મિનિટ સંપૂર્ણ ધ્યાન સાથે વાંચો."
                follow_up_q = "ઓલ ધ બેસ્ટ!"
            else:
                direct_answer = "Fantastic! Put your phone on silent, focus strictly on one topic, and enjoy the satisfaction of completing this sprint."
                follow_up_q = "You have got this — go crush your 25-minute study block!"

        # Scenario: Positive Feedback / Calmer / Thanks
        elif any(w in msg_clean for w in ["much calmer", "calmer", "thank you", "thanks", "accha laga", "shukriya", "relief", "better now"]):
            if lang == "hi":
                direct_answer = "Yeh sunkar bohot accha laga. Aapne already pehla step le liya hai apne stress ko acknowledge karke."
                follow_up_q = "Kya aap study start karne se pehle ek 2-minute relaxation breathing exercise karna chahenge?"
            elif lang == "gu":
                direct_answer = "આ સાંભળીને આનંદ થયો. તમે યોગ્ય દિશામાં આગળ વધી રહ્યા છો."
                follow_up_q = "શું તમે ૨ મિનિટ શ્વાસોચ્છવાસની કસરત કરવા માંગો છો?"
            else:
                direct_answer = "I am really glad to hear that. Taking a moment to slow down your breathing and gain perspective is a powerful tool."
                follow_up_q = "How do your energy and focus feel right now?"

        # Scenario: Guided Breathing Request
        elif any(w in msg_clean for w in ["quick breathing", "breathing exercise", "guide a quick", "saans", "shant karwao"]):
            if lang == "hi":
                direct_answer = "Chaliye ek 4-4-4 Box Breathing karte hain: 4 second saans andar lijiye... 4 second rokiye... aur 4 second me dheere se chodiye."
                follow_up_q = "Kya aap thoda relax aur calm feel kar rahe hain?"
            elif lang == "gu":
                direct_answer = "ચાલો ૪ સેકન્ડ ઊંડો શ્વાસ લઈએ... ૪ સેકન્ડ રોકો... અને ૪ સેકન્ડમાં બહાર કાઢો."
                follow_up_q = "શું તમે થોડી શાંતિ અનુભવી રહ્યા છો?"
            else:
                direct_answer = "Let's do a simple 4-4-4 Box Breathing: Inhale slowly for 4 seconds... hold for 4 seconds... and gently exhale for 4 seconds."
                follow_up_q = "How does your body feel after that breath?"

        # Scenario: Racing Thoughts Before Bed
        elif any(w in msg_clean for w in ["mind keeps racing", "racing thoughts", "thoughts before bed", "dimag me thoughts", "racing"]):
            if lang == "hi":
                direct_answer = "Raat ko sote waqt dimag me thoughts daudna stress ka classic sign hai. Sone se 20 minute pehle ek notebook me saari chintaon ko likh dena (brain dump) bohot madad karta hai."
                follow_up_q = "Kya aap aaj raat sone se pehle 5 minute ka brain dump journal try karna chahenge?"
            elif lang == "gu":
                direct_answer = "રાત્રે વિચારોનું ચક્ર ચાલવું તણાવની નિશાની છે. સૂતા પહેલા બધું કાગળ પર લખી લો."
                follow_up_q = "શું તમે આજે રાત્રે આ અજમાવશો?"
            else:
                direct_answer = "Racing thoughts before bed are exhausting. Try a quick 5-minute brain dump in a notebook before sleeping so your mind doesn't feel obligated to hold onto everything overnight."
                follow_up_q = "Does the worrying mostly happen when you're trying to fall asleep, or does it continue throughout the day?"

        # Scenario: Sleep Struggle / Insomnia
        elif any(w in msg_clean for w in ["struggle to sleep", "sleep at night", "can't sleep", "insomnia", "neend", "night"]):
            if lang == "hi":
                direct_answer = "Stress aur neend ka aapas me gehra rishta hai. Sone se 30 minute pehle screen band karna aur kamre ko thanda rakhna sleep quality ko kaafi improve karta hai."
                follow_up_q = "Aap aam taur par kitne baje sone ki koshish karte hain?"
            elif lang == "gu":
                direct_answer = "તણાવ ઊંઘની ગુણવત્તા બગાડે છે. સૂતા પહેલા સ્ક્રીનથી દૂર રહો."
                follow_up_q = "તમે સામાન્ય રીતે કેટલા વાગ્યે સૂવા જાઓ છો?"
            else:
                direct_answer = "Sleep issues and daytime stress create a frustrating feedback loop. A consistent 30-minute digital sunset before bed gives your nervous system time to settle down."
                follow_up_q = "What time do you usually get into bed, and how long does it take to fall asleep?"

        # Scenario: Direct How-to / "What should I do when I can't concentrate?"
        elif any(w in msg_clean for w in ["what should i do", "how can i", "kya karun", "shu karu", "kaise karu"]):
            if lang == "hi":
                direct_answer = "Sabse pehle phone ko doosre room me rakhein aur sirf 20-25 minute ka ek Pomodoro block start karein. Agar focus break ho toh 2 minute ka deep breathing break lein."
                follow_up_q = "Kya aap agla 25-minute focus session try karne ke liye ready hain?"
            elif lang == "gu":
                direct_answer = "૨૦-૨૫ મિનિટનો પોમોડોરો બ્લોક બનાવો અને ફોન બીજા રૂમમાં મૂકો."
                follow_up_q = "શું તમે ૨૫ મિનિટ વાંચવા માટે તૈયાર છો?"
            else:
                direct_answer = "Try studying for just 20–25 minutes without your phone, then take a short break. If concentration is still difficult, we can figure out what's making it harder for you."
                follow_up_q = "Is it mainly distraction or anxiety?"

        # Scenario: Choice / "Both" / "Yes" / "No"
        elif msg_clean in ["both", "dono", "donoj", "yes", "haan", "ha", "yep", "no", "nahi", "na"]:
            if lang == "hi":
                direct_answer = "Dono ka combination kaafi exhausting ho sakta hai. Pehle exam preparation ko prioritize karte hain taaki aapka self-confidence wapas build ho."
                follow_up_q = "Kya hum milkar agle 2 din ka ek manageable timetable bana sakte hain?"
            elif lang == "gu":
                direct_answer = "બંને બાબતો એકસાથે થકવી નાખે તેવી છે. ચાલો સરળ આયોજન બનાવીએ."
                follow_up_q = "શું આપણે આગામી દિવસોનું નાનું ટાઈમટેબલ બનાવીએ?"
            else:
                direct_answer = "Dealing with both simultaneously is undeniably exhausting. Let's focus on building your confidence through small, clear study milestones."
                follow_up_q = "Would you like to outline a simple 2-day micro-plan together?"

        # Scenario: Parental Expectations
        elif any(w in msg_clean for w in ["parent", "parents", "expect very high", "expect", "marks", "95", "90", "papa", "mummy", "maa", "disappoint"]):
            if lang == "hi":
                direct_answer = "Exams ke saath parents ki expectations ka pressure judna bohot bhari lagta hai. Yaad rakhiye: aapki koshish aapke control me hai, unka reaction nahi."
                follow_up_q = "Abhi aapko kis baat ka zyada darr hai — exam ka paper ya unhe disappoint karne ka?"
            elif lang == "gu":
                direct_answer = "માતાપિતાની ઊંચી અપેક્ષાઓ તણાવ વધારે છે. તમારી મહેનત તમારા હાથમાં છે."
                follow_up_q = "તમને પરીક્ષાનો વધુ ડર છે કે તેમની અપેક્ષાઓનો?"
            else:
                direct_answer = "Earlier you mentioned exam preparation was already stressful, and now pressure from parents adds another heavy layer."
                follow_up_q = "Which feels heavier right now — the fear of the exam itself or disappointing them?"

        # Scenario: Specific Subjects (Maths / Physics)
        elif any(w in msg_clean for w in ["mathematics", "math", "physics", "chemistry", "biology", "accounts"]):
            if lang == "hi":
                direct_answer = "Maths aur Physics me active problem-solving bohot zaroori hoti hai. Pehle core formula sheet banana aur high-weightage topics cover karna instant confidence deta hai."
                follow_up_q = "Kya aapne past year question papers solve karna shuru kiya hai?"
            elif lang == "gu":
                direct_answer = "ગણિત અને ભૌતિકશાસ્ત્રમાં પાયાના સૂત્રો પહેલા કરવાથી આત્મવિશ્વાસ વધશે."
                follow_up_q = "શું તમે જૂના પ્રશ્નપત્રો જોયા છે?"
            else:
                direct_answer = "Mathematics and Physics require heavy active problem-solving rather than passive reading. Breaking chapters into core formula sheets first helps build early momentum."
                follow_up_q = "Have you started practicing sample papers or past year questions yet?"

        # Scenario: Study Hours (4-5 hours)
        elif any(w in msg_clean for w in ["45 hours", "45", "56", "34", "hours", "ghante", "ghanta", "kalak"]):
            if lang == "hi":
                direct_answer = "4–5 ghante ka target already kaafi solid hai. Zaroori nahi ki continuous 5 hours 100% productive ho; chhote blocks me padhna zyada effective hota hai."
                follow_up_q = "Aapka sabse pehla exam kis subject ka scheduled hai?"
            elif lang == "gu":
                direct_answer = "૪-૫ કલાકનો લક્ષ્યાંક સારો છે. નાના ભાગોમાં વાંચવું વધુ અસરકારક રહે છે."
                follow_up_q = "તમારી પહેલી પરીક્ષા કયા વિષયની છે?"
            else:
                direct_answer = "4–5 hours is already a significant target; the goal should be high-quality focused intervals rather than forcing continuous hours."
                follow_up_q = "Which subject or topic is scheduled first in your exam timetable?"

        # Scenario: Phone Distraction
        elif any(w in msg_clean for w in ["checking my phone", "phone", "instagram", "reels", "mobile"]):
            if lang == "hi":
                direct_answer = "Phone ka dopamine loop focus ko bohot jaldi break kar deta hai. Ek simple strategy try karte hain: phone ko doosre room me rakh kar sirf 20 minute padho, fir 5 minute ka short break lo."
                follow_up_q = "Normally aap din me kitne ghante padhne ki koshish karte ho?"
            elif lang == "gu":
                direct_answer = "ફોન ધ્યાન ભટકાવવામાં મોટો ભાગ ભજવે છે. ૨૦ મિનિટ ફોન વગર વાંચો અને ૫ મિનિટ આરામ કરો."
                follow_up_q = "સામાન્ય રીતે તમે દિવસમાં કેટલા કલાક વાંચવાનો પ્રયત્ન કરો છો?"
            else:
                direct_answer = "That sounds frustrating — phones are designed to pull our attention away constantly. Putting your phone in another room creates instant friction against mindless checking."
                follow_up_q = "How many hours do you typically try to study in a day?"

        # Scenario: Difficulty Concentrating
        elif any(w in msg_clean for w in ["cant concentrate", "concentrate", "concentration", "dhyan nahi", "focus nahi"]):
            if lang == "hi":
                direct_answer = "Samajh gaya. Focus na ban pana bohot frustrating hota hai, chahe hum kitna bhi try karein."
                follow_up_q = "Jab padhne baithte ho toh kya hota hai — distraction zyada hota hai ya dimag me dusre thoughts aane lagte hain?"
            elif lang == "gu":
                direct_answer = "સમજી ગયો. એકાગ્રતા ન જળવાય ત્યારે ચિંતા વધુ થાય છે."
                follow_up_q = "જ્યારે તમે વાંચવા બેસો છો ત્યારે તમારું ધ્યાન બીજે ભટકે છે કે થાક લાગે છે?"
            else:
                direct_answer = "Got it. Difficulty focusing is frustrating when you really want to get work done."
                follow_up_q = "When you sit down to study, what usually happens? Do you get distracted, start worrying, or feel mentally tired?"

        # Scenario: Upcoming Exams
        elif any(w in msg_clean for w in ["exams are coming", "exam are coming", "exam", "pariksha", "test"]):
            if lang == "hi":
                direct_answer = "Exams ke time aisa lagna normal hai. Padhai ka load aur expectations dono ek saath aate hain."
                follow_up_q = "Tujhe sabse zyada dikkat preparation me aa rahi hai ya result ko lekar darr lag raha hai?"
            elif lang == "gu":
                direct_answer = "પરીક્ષાના સમયે તણાવ આવવો સામાન્ય છે."
                follow_up_q = "તમને તૈયારીમાં મુશ્કેલી પડે છે કે પરિણામનો ડર સતાવે છે?"
            else:
                direct_answer = "That makes sense. Upcoming exams create a heavy mental load."
                follow_up_q = "Is it the amount of studying, the fear of the results, or something else that is bothering you the most?"

        # Scenario: Initial Distress / "I am feeling stressed"
        elif any(w in msg_clean for w in ["i am feeling stressed", "i am stressed", "stress ho raha", "bohot tension"]):
            if lang == "hi":
                direct_answer = "Main sun raha hoon. Exams ka ya kisi aur cheez ka pressure kaafi overwhelming ho sakta hai."
                follow_up_q = "Aapko sabse zyada tension kis baat ki ho rahi hai — padhai, result, ya family expectations?"
            elif lang == "gu":
                direct_answer = "હું ધ્યાનથી સાંભળી રહ્યો છું. તણાવ અનુભવવો સ્વાભાવિક છે."
                follow_up_q = "તમને અત્યારે સૌથી વધુ ચિંતા શેની થઈ રહી છે — ભણવાની કે અન્ય કોઈ બાબતની?"
            else:
                direct_answer = "I'm listening. What has been making you feel stressed lately?"
                follow_up_q = "Is it your upcoming exams, study workload, or something else?"

        # General Fallback
        else:
            if lang == "hi":
                direct_answer = f"Main samajh raha hoon. {message.strip()} ke baare me baat karna zaroori tha."
                follow_up_q = "Is cheez ka aapke daily routine aur energy par sabse zyada kya asar pad raha hai?"
            elif lang == "gu":
                direct_answer = f"હું સમજી રહ્યો છું. {message.strip()} વિશે વાત કરવી ઉપયોગી છે."
                follow_up_q = "આની તમારી દિનચર્યા પર શું અસર થઈ રહી છે?"
            else:
                direct_answer = f"I hear what you're sharing regarding '{message.strip()}'. Giving voice to what you are experiencing is often the first step toward finding relief."
                follow_up_q = "How is this currently impacting your focus and daily energy?"

        final_response = f"{direct_answer} {follow_up_q}".strip()
        
        session.add_turn(
            user_msg=message,
            ai_msg=final_response,
            question=follow_up_q,
            stress_score=stress_score,
            topic=topic
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
            "response": final_response,
            "turn_id": session.turn_counter,
            "current_topic": session.current_topic,
            "conversation_summary": session.conversation_summary,
            "stress_score": stress_score,
            "stress_trend": trend,
            "user_facts": session.user_facts
        }

conversation_engine = ConversationEngine()
