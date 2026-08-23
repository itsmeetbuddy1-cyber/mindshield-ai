import random
from typing import Optional, List, Dict
from app.core.config import settings

# Trigger-specific response pools
TRIGGER_RESPONSES = {
    "academic": {
        "en": [
            "Academic pressure can feel relentless. Let's break it down — what's the most urgent deadline or task you're facing right now? Sometimes tackling one thing at a time makes it more manageable.",
            "Exam stress is incredibly common. Research shows that spaced study sessions of 25 minutes with 5-minute breaks (the Pomodoro technique) can significantly boost retention. Would you like to try that?",
            "I understand the weight of academic expectations. Remember: your worth isn't defined by a grade. Can we explore what specific aspect is causing the most anxiety — the workload, understanding the material, or fear of results?",
            "Study burnout is real. When was the last time you took a proper break? Even a 10-minute walk outside can reset your focus. Your brain needs recovery time to consolidate learning.",
            "It sounds like academics are really weighing on you. Let's try a quick strategy: write down the three most important things you need to accomplish this week. Prioritizing helps reduce that 'everything at once' feeling.",
            "Academic stress often comes from comparing yourself to others. Focus on your own progress — even small improvements matter. What's one thing you learned recently that you're proud of?"
        ],
        "hi": [
            "पढ़ाई का दबाव बहुत भारी लग सकता है। चलो इसे छोटे हिस्सों में बांटते हैं — अभी सबसे ज़रूरी डेडलाइन या काम क्या है? एक बार में एक चीज़ करना आसान होता है।",
            "परीक्षा का तनाव बहुत आम है। रिसर्च बताती है कि 25 मिनट पढ़ो, 5 मिनट ब्रेक लो (पोमोडोरो तकनीक) — इससे याद रखने में मदद मिलती है। क्या आप ट्राई करना चाहेंगे?",
            "मैं समझता/समझती हूँ कि पढ़ाई की उम्मीदें कितनी भारी होती हैं। याद रखें: आपकी कीमत किसी नंबर से नहीं तय होती। क्या हम जान सकते हैं कि सबसे ज़्यादा चिंता किस बात की है?",
            "पढ़ाई से थकान असली है। आखिरी बार कब आपने अच्छा ब्रेक लिया था? 10 मिनट की सैर भी दिमाग को रिफ्रेश कर सकती है।",
            "ऐसा लगता है कि पढ़ाई का बोझ बहुत है। एक तरीका आज़माइए: इस हफ्ते की 3 सबसे ज़रूरी चीज़ें लिखिए। प्राथमिकता तय करने से 'सब कुछ एक साथ' वाली भावना कम होती है।"
        ],
        "gu": [
            "ભણવાનું દબાણ ઘણું ભારે લાગી શકે છે. ચાલો તેને નાના ભાગોમાં વહેંચીએ — અત્યારે સૌથી અગત્યની ડેડલાઈન કે કામ શું છે?",
            "પરીક્ષાનો તણાવ ખૂબ સામાન્ય છે. 25 મિનિટ વાંચો, 5 મિનિટ બ્રેક લો (પોમોડોરો ટેકનિક) — આ યાદ રાખવામાં મદદ કરે છે.",
            "હું સમજું છું કે ભણવાની અપેક્ષાઓ કેટલી ભારે હોય છે. યાદ રાખો: તમારી કિંમત કોઈ નંબરથી નક્કી નથી થતી.",
            "ભણવાનો થાક સાચો છે. છેલ્લે ક્યારે તમે સારો બ્રેક લીધો હતો? 10 મિનિટની ચાલ પણ મગજને રિફ્રેશ કરી શકે છે.",
            "એવું લાગે છે કે ભણવાનો ભાર ઘણો છે. એક રીત અજમાવો: આ અઠવાડિયાની 3 સૌથી અગત્યની વસ્તુઓ લખો."
        ]
    },
    "relationship": {
        "en": [
            "Relationship challenges can deeply affect our emotional well-being. Would you like to talk about what happened? Sometimes just expressing it helps you see things more clearly.",
            "Communication is often the bridge to resolution. Have you tried sharing how you feel using 'I feel...' statements? It helps the other person understand your perspective without feeling attacked.",
            "Setting healthy boundaries isn't selfish — it's essential for your well-being. What boundary would help you feel more at peace in this situation?",
            "Relationships can be our greatest source of both joy and stress. Remember, it's okay to take space when you need it. What would a healthy next step look like for you?",
            "Conflict in relationships is normal, but it shouldn't consume you. Let's focus on what you can control — your response and your boundaries. What feels most important to address first?"
        ],
        "hi": [
            "रिश्तों की चुनौतियाँ हमारी भावनात्मक सेहत पर गहरा असर डालती हैं। क्या आप बताना चाहेंगे कि क्या हुआ? कभी-कभी बोलने से चीज़ें साफ़ होती हैं।",
            "बातचीत अक्सर समाधान का रास्ता होती है। क्या आपने 'मुझे ऐसा लगता है...' वाले तरीके से बात करने की कोशिश की।",
            "स्वस्थ सीमाएँ बनाना स्वार्थ नहीं है — यह आपकी भलाई के लिए ज़रूरी है।",
            "रिश्ते खुशी और तनाव दोनों का सबसे बड़ा स्रोत हो सकते हैं। जब ज़रूरत हो तो अपने लिए समय लेना ठीक है।",
            "रिश्तों में टकराव सामान्य है, लेकिन यह आपको खा नहीं जाना चाहिए। आप क्या नियंत्रित कर सकते हैं — अपनी प्रतिक्रिया और सीमाएँ।"
        ],
        "gu": [
            "સંબંધોની મુશ્કેલીઓ આપણી ભાવનાત્મક તંદુરસ્તી પર ઊંડી અસર કરે છે. શું તમે જણાવવા માંગો છો કે શું થયું?",
            "વાતચીત ઘણીવાર ઉકેલનો રસ્તો હોય છે. 'મને એવું લાગે છે...' આ રીતે વાત કરવાનો પ્રયાસ કર્યો છે?",
            "તંદુરસ્ત સીમાઓ બનાવવી સ્વાર્થ નથી — તે તમારી ભલાઈ માટે જરૂરી છે.",
            "સંબંધો ખુશી અને તણાવ બંનેનો સ્ત્રોત હોઈ શકે છે. જ્યારે જરૂર હોય ત્યારે પોતાના માટે સમય લેવો યોગ્ય છે.",
            "સંબંધોમાં સંઘર્ષ સામાન્ય છે, પણ તે તમને ખાઈ ન જવું જોઈએ."
        ]
    },
    "sleep": {
        "en": [
            "Sleep issues can cascade into every area of life. Let's start simple: what time did you go to bed last night, and how long did it take to fall asleep? Understanding your pattern is the first step.",
            "A consistent bedtime routine signals your brain it's time to wind down. Try this tonight: no screens 30 minutes before bed, dim the lights, and do 5 minutes of deep breathing.",
            "Racing thoughts at bedtime are exhausting. Try the 'brain dump' technique: write everything on your mind in a notebook before bed. Getting it out of your head and onto paper can be incredibly freeing.",
            "Sleep and stress create a vicious cycle — stress disrupts sleep, and poor sleep increases stress. Breaking the cycle starts with one change. What feels most doable for you tonight?",
            "Your sleep environment matters more than you think. Cool temperature, darkness, and quiet can transform your sleep quality. Is there one small change you could make to your bedroom tonight?"
        ],
        "hi": [
            "नींद की समस्या जीवन के हर क्षेत्र को प्रभावित करती है। सबसे पहले: कल रात कितने बजे सोए और नींद आने में कितना समय लगा?",
            "रोज़ एक जैसी सोने की दिनचर्या दिमाग को संकेत देती है कि अब आराम का समय है। आज रात ट्राई करें: सोने से 30 मिनट पहले स्क्रीन बंद, लाइट कम, और 5 मिनट गहरी सांस लें।",
            "सोते समय दौड़ते विचार थकाने वाले होते हैं। 'ब्रेन डंप' तकनीक आज़माइए: सोने से पहले जो भी मन में है वो एक नोटबुक में लिख दीजिए।",
            "नींद और तनाव एक दुष्चक्र बनाते हैं। इस चक्र को तोड़ने की शुरुआत एक छोटे बदलाव से होती है। आज रात क्या बदलाव कर सकते हैं?",
            "आपके सोने का माहौल बहुत मायने रखता है। ठंडा तापमान, अंधेरा और शांति नींद की गुणवत्ता बदल सकती है।"
        ],
        "gu": [
            "ઊંઘની સમસ્યા જીવનના દરેક ક્ષેત્રને અસર કરે છે. સૌ પ્રથમ: ગઈ રાત્રે કેટલા વાગ્યે સૂઈ ગયા?",
            "દરરોજ એકસરખી સૂવાની દિનચર્યા મગજને સંકેત આપે છે. આજ રાત્રે પ્રયાસ કરો: સૂતા પહેલા 30 મિનિટ સ્ક્રીન બંધ.",
            "સૂતી વખતે દોડતા વિચારો થકવનારા હોય છે. 'બ્રેઈન ડમ્પ' ટેકનિક અજમાવો: સૂતા પહેલા મનમાં જે હોય તે નોટબુકમાં લખો.",
            "ઊંઘ અને તણાવ એક દુષ્ચક્ર બનાવે છે. આ ચક્ર તોડવાની શરૂઆત એક નાના ફેરફારથી થાય છે.",
            "તમારું સૂવાનું વાતાવરણ ઘણું મહત્વ ધરાવે છે. ઠંડું તાપમાન, અંધારું અને શાંતિ ઊંઘની ગુણવત્તા બદલી શકે છે."
        ]
    },
    "financial": {
        "en": [
            "Financial stress can feel suffocating, but remember: it's a situation, not a permanent state. What's the most pressing financial concern right now — bills, debt, or uncertainty about the future?",
            "Creating a simple budget doesn't have to be complicated. Start by tracking just your spending for one week. Awareness alone often reveals where small changes can make a big difference.",
            "Financial anxiety often comes from uncertainty. Writing down your exact expenses vs. income can replace vague fear with concrete numbers you can work with. Would you like to try that?",
            "Money worries can consume your thoughts. Try the 'worry window' technique: set aside 15 minutes to think about finances, then consciously shift your focus. You deserve mental breaks from financial stress.",
            "Remember, asking for help with finances isn't weakness. Many institutions offer free financial counseling. The hardest step is usually the first one — reaching out."
        ],
        "hi": [
            "पैसों का तनाव दम घोंटने जैसा लग सकता है, लेकिन याद रखें: यह एक स्थिति है, स्थायी नहीं। अभी सबसे बड़ी चिंता क्या है — बिल, कर्ज़, या भविष्य की अनिश्चितता?",
            "बजट बनाना मुश्किल नहीं होता। बस एक हफ्ते अपने खर्चे लिखना शुरू करें। सिर्फ जागरूकता से ही पता चलता है कि कहाँ छोटे बदलाव बड़ा फर्क ला सकते हैं।",
            "पैसों की चिंता अक्सर अनिश्चितता से आती है। अपनी आय और खर्चे लिखने से अस्पष्ट डर की जगह ठोस संख्याएँ आ जाती हैं।",
            "पैसों की चिंता दिमाग पर हावी हो सकती है। 'चिंता विंडो' तकनीक आज़माइए: 15 मिनट पैसों के बारे में सोचें, फिर जानबूझकर ध्यान हटाएँ।",
            "मदद माँगना कमज़ोरी नहीं है। कई संस्थान मुफ्त वित्तीय परामर्श देती हैं।"
        ],
        "gu": [
            "નાણાંકીય તણાવ ગૂંગળામણ જેવો લાગી શકે છે, પણ યાદ રાખો: આ એક પરિસ્થિતિ છે, કાયમી નથી.",
            "બજેટ બનાવવું મુશ્કેલ નથી. બસ એક અઠવાડિયું તમારા ખર્ચા લખવાનું શરૂ કરો.",
            "નાણાંકીય ચિંતા ઘણીવાર અનિશ્ચિતતામાંથી આવે છે. તમારી આવક અને ખર્ચા લખવાથી અસ્પષ્ટ ડરની જગ્યાએ ચોક્કસ આંકડા આવે છે.",
            "પૈસાની ચિંતા મગજ પર હાવી થઈ શકે છે. 'ચિંતા વિન્ડો' ટેકનિક અજમાવો: 15 મિનિટ નાણાં વિશે વિચારો, પછી જાણીજોઈને ધ્યાન હટાવો.",
            "મદદ માંગવી નબળાઈ નથી. ઘણી સંસ્થાઓ મફત નાણાકીય સલાહ આપે છે."
        ]
    },
    "family": {
        "en": [
            "Family dynamics can be incredibly complex. It's okay to love your family and still find certain interactions stressful. What aspect of family life is weighing on you most right now?",
            "When family conflicts arise, it helps to identify what you can and cannot control. You can control your responses and boundaries — you cannot control others' behavior. What boundary would help you right now?",
            "Family expectations can feel like a heavy invisible weight. Remember, it's healthy to have your own goals and dreams. What would you do differently if family pressure wasn't a factor?",
            "Taking space from family when needed isn't abandonment — it's self-preservation. Even a short walk or time in your room can help you reset before re-engaging.",
            "Family stress often involves patterns that have built up over years. You don't have to solve everything at once. What's one small thing that could make today a little better?"
        ],
        "hi": [
            "परिवार की गतिशीलता बहुत जटिल हो सकती है। अपने परिवार से प्यार करना और कुछ बातचीत को तनावपूर्ण पाना — दोनों ठीक है। अभी सबसे ज़्यादा क्या परेशान कर रहा है?",
            "जब परिवार में टकराव हो, तो पहचानें कि क्या आपके नियंत्रण में है और क्या नहीं। आप अपनी प्रतिक्रिया नियंत्रित कर सकते हैं।",
            "परिवार की उम्मीदें एक अदृश्य भारी बोझ लग सकती हैं। याद रखें, अपने लक्ष्य और सपने रखना स्वस्थ है।",
            "ज़रूरत पड़ने पर परिवार से थोड़ी दूरी लेना गलत नहीं है — यह आत्म-रक्षा है।",
            "पारिवारिक तनाव में अक्सर सालों से बने पैटर्न होते हैं। सब कुछ एक बार में हल नहीं करना होता।"
        ],
        "gu": [
            "કુટુંબની ગતિશીલતા ખૂબ જટિલ હોઈ શકે છે. તમારા કુટુંબને પ્રેમ કરવો અને અમુક વાતચીતને તણાવપૂર્ણ ગણવી — બંને ઠીક છે.",
            "જ્યારે કુટુંબમાં સંઘર્ષ થાય, ત્યારે ઓળખો કે શું તમારા નિયંત્રણમાં છે અને શું નથી.",
            "કુટુંબની અપેક્ષાઓ અદ્રશ્ય ભારે બોજ જેવી લાગી શકે છે. યાદ રાખો, પોતાના લક્ષ્યો રાખવા તંદુરસ્ત છે.",
            "જરૂર પડે ત્યારે કુટુંબથી થોડું અંતર લેવું ખોટું નથી — તે આત્મ-રક્ષણ છે.",
            "કૌટુંબિક તણાવમાં ઘણીવાર વર્ષોથી બનેલી પેટર્ન હોય છે. બધું એકસાથે ઉકેલવું જરૂરી નથી."
        ]
    },
    "work": {
        "en": [
            "Work overload can make everything feel urgent and impossible. Let's use the Eisenhower Matrix: what's truly urgent AND important vs. what just feels urgent? This distinction can be liberating.",
            "When work stress peaks, your body needs you to listen. Stand up, stretch for 60 seconds, and take three deep breaths. This micro-break activates your parasympathetic nervous system.",
            "Saying 'no' or 'not right now' at work isn't a career ender — it's a skill. Overcommitting leads to burnout and lower quality work. What's one thing on your plate that could wait?",
            "Work-life boundaries matter, especially in high-pressure environments. What time did you stop working yesterday? Having a clear 'shutdown ritual' can help your brain transition to rest.",
            "Task paralysis happens when everything feels equally important. Try this: pick the ONE task that, if completed, would make you feel most relieved. Start there and give it just 10 focused minutes."
        ],
        "hi": [
            "काम का बोझ हर चीज़ को ज़रूरी और असंभव बना सकता है। आइज़ेनहावर मैट्रिक्स आज़माइए: क्या सच में ज़रूरी है vs क्या सिर्फ ज़रूरी लगता है?",
            "जब काम का तनाव चरम पर हो, शरीर को सुनिए। खड़े हों, 60 सेकंड स्ट्रेच करें, तीन गहरी सांसें लें।",
            "काम पर 'ना' या 'अभी नहीं' कहना करियर खत्म नहीं करता — यह एक कौशल है।",
            "काम और जीवन की सीमाएँ मायने रखती हैं। कल आपने कितने बजे काम बंद किया?",
            "टास्क पैरालिसिस तब होता है जब सब कुछ बराबर ज़रूरी लगता है। एक काम चुनें जो पूरा होने पर सबसे ज़्यादा राहत दे।"
        ],
        "gu": [
            "કામનો ભાર દરેક વસ્તુને જરૂરી અને અશક્ય બનાવી શકે છે. આઈઝેનહાવર મેટ્રિક્સ અજમાવો.",
            "જ્યારે કામનો તણાવ ચરમ પર હોય, શરીરને સાંભળો. ઊભા થાઓ, 60 સેકન્ડ સ્ટ્રેચ કરો, ત્રણ ઊંડા શ્વાસ લો.",
            "કામ પર 'ના' કે 'હમણાં નહીં' કહેવું કારકિર્દી ખતમ નથી કરતું — તે એક કૌશલ્ય છે.",
            "કામ અને જીવનની સીમાઓ મહત્વ ધરાવે છે. ગઈકાલે તમે કેટલા વાગ્યે કામ બંધ કર્યું?",
            "ટાસ્ક પેરાલિસિસ ત્યારે થાય છે જ્યારે બધું સમાન રીતે જરૂરી લાગે છે."
        ]
    }
}

# General emotional state responses
EMOTIONAL_RESPONSES = {
    "overwhelmed": {
        "en": [
            "It sounds like things feel pretty overwhelming right now. We can take this one step at a time. Would you like a 60-second breathing reset, or would you rather talk through what's creating the most pressure today?",
            "When everything feels like too much, it's a signal to pause, not push harder. You're already doing the right thing by reaching out. What feels like the biggest weight right now?",
            "Being overwhelmed isn't weakness — it means you care about a lot of things. Let's identify just ONE thing we can take off your mental plate right now."
        ],
        "hi": [
            "लगता है सब कुछ बहुत ज़्यादा हो रहा है। हम एक-एक कदम चलेंगे। क्या 60 सेकंड का ब्रीदिंग रिसेट चाहिए, या बात करना चाहेंगे?",
            "जब सब कुछ बहुत ज़्यादा लगे, तो यह रुकने का संकेत है, और ज़ोर लगाने का नहीं। आप सही कर रहे हैं कि बात कर रहे हैं।",
            "अभिभूत होना कमज़ोरी नहीं है — इसका मतलब है आपको बहुत चीज़ों की परवाह है।"
        ],
        "gu": [
            "એવું લાગે છે કે બધું ખૂબ વધારે થઈ રહ્યું છે. આપણે એક-એક પગલું ભરીશું.",
            "જ્યારે બધું વધારે લાગે, તો તે રોકવાનો સંકેત છે, વધુ દબાવવાનો નહીં.",
            "અભિભૂત થવું નબળાઈ નથી — તેનો અર્થ છે તમને ઘણી વસ્તુઓની પરવા છે."
        ]
    },
    "anxious": {
        "en": [
            "Anxiety and high stress can feel very physical and intense. Let's ground ourselves: feel your feet on the floor and take one slow, deep breath. What feels like the heaviest part of what's happening right now?",
            "Anxiety often makes us focus on worst-case scenarios. Let me ask: what's the MOST LIKELY outcome, not the worst one? Our anxious brain tends to overestimate threats.",
            "Your body is in fight-or-flight mode, which is exhausting. Let's activate your calm system: breathe in for 4, hold for 4, out for 6. Would you like to try our guided breathing exercise?"
        ],
        "hi": [
            "चिंता और तनाव बहुत शारीरिक और तीव्र महसूस हो सकता है। ज़मीन पर पैर महसूस करें और एक धीमी गहरी सांस लें।",
            "चिंता अक्सर हमें सबसे बुरे हालात पर ध्यान केंद्रित कराती है। सबसे संभावित परिणाम क्या है, सबसे बुरा नहीं?",
            "आपका शरीर फाइट-या-फ्लाइट मोड में है। शांत प्रणाली सक्रिय करें: 4 में श्वास लें, 4 रोकें, 6 में छोड़ें।"
        ],
        "gu": [
            "ચિંતા અને તણાવ ખૂબ શારીરિક અને તીવ્ર લાગી શકે છે. જમીન પર પગ અનુભવો અને એક ધીમો ઊંડો શ્વાસ લો.",
            "ચિંતા ઘણીવાર આપણને સૌથી ખરાબ પરિસ્થિતિ પર ધ્યાન કેન્દ્રિત કરાવે છે.",
            "તમારું શરીર ફાઈટ-ઓર-ફ્લાઈટ મોડમાં છે. શાંત સિસ્ટમ સક્રિય કરો: 4માં શ્વાસ લો, 4 રોકો, 6માં છોડો."
        ]
    },
    "sad": {
        "en": [
            "I'm genuinely sorry you're feeling this weight right now. It takes strength to acknowledge when things feel heavy. Is this connected to recent events, relationships, or just a build-up of everything?",
            "Sadness is a valid emotion that deserves space. You don't need to 'fix' it immediately. Sometimes just sitting with it, acknowledging it, is the healthiest response. I'm here with you.",
            "When sadness visits, gentle self-care can help. Have you eaten today? Had water? Sometimes our basic needs get neglected when we're low, and addressing them can shift things slightly."
        ],
        "hi": [
            "मुझे सच में खेद है कि आप यह बोझ महसूस कर रहे हैं। जब चीज़ें भारी लगें तो स्वीकार करने में ताकत लगती है।",
            "उदासी एक वैध भावना है जो जगह की हकदार है। आपको इसे तुरंत 'ठीक' करने की ज़रूरत नहीं है।",
            "जब उदासी आए, तो कोमल आत्म-देखभाल मदद कर सकती है। क्या आज खाना खाया? पानी पिया?"
        ],
        "gu": [
            "મને ખરેખર દુઃખ છે કે તમે આ ભાર અનુભવી રહ્યા છો. જ્યારે વસ્તુઓ ભારે લાગે ત્યારે સ્વીકારવામાં તાકાત લાગે છે.",
            "ઉદાસી એક માન્ય લાગણી છે જે જગ્યાની હકદાર છે. તમારે તેને તરત 'ઠીક' કરવાની જરૂર નથી.",
            "જ્યારે ઉદાસી આવે, ત્યારે હળવી આત્મ-સંભાળ મદદ કરી શકે છે. આજે ખાવાનું ખાધું? પાણી પીધું?"
        ]
    },
    "angry": {
        "en": [
            "It is completely valid to feel frustrated when expectations and demands clash. Giving yourself permission to vent can help untangle those feelings. Would you like to write more about it in your Private Journal or talk it through here?",
            "Anger is often a protective emotion covering hurt, fear, or frustration underneath. What do you think is beneath the anger right now?",
            "When anger rises, physical release helps: try clenching your fists tight for 5 seconds, then releasing. Repeat 3 times. It gives your body an outlet for that energy."
        ],
        "hi": [
            "जब उम्मीदें और माँगें टकराती हैं तो निराश होना बिल्कुल सही है। क्या आप जर्नल में लिखना चाहेंगे या यहाँ बात करना?",
            "गुस्सा अक्सर चोट, डर या निराशा को ढकने वाली सुरक्षात्मक भावना है।",
            "जब गुस्सा बढ़े, शारीरिक रिलीज़ मदद करता है: मुट्ठी 5 सेकंड कसें, फिर छोड़ें। 3 बार दोहराएँ।"
        ],
        "gu": [
            "જ્યારે અપેક્ષાઓ અને માંગ ટકરાય ત્યારે નિરાશ થવું બિલકુલ યોગ્ય છે. જર્નલમાં લખવા માંગો છો કે અહીં વાત કરવી છે?",
            "ગુસ્સો ઘણીવાર ઈજા, ડર કે નિરાશાને ઢાંકતી સુરક્ષાત્મક લાગણી છે.",
            "જ્યારે ગુસ્સો વધે, શારીરિક રિલીઝ મદદ કરે છે: મુઠ્ઠી 5 સેકન્ડ કસો, પછી છોડો. 3 વાર દોહરાવો."
        ]
    },
    "lonely": {
        "en": [
            "Feeling alone in your struggles can make everything feel twice as difficult. While I am an AI companion, I'm here to provide a safe, non-judgmental space for you. Have you thought about sharing a small part of how you feel with someone you trust?",
            "Loneliness is one of the most painful human experiences. You're not broken for feeling it. Connection starts small — even a brief text to a friend can begin to bridge the gap.",
            "Social isolation and loneliness are different things. You can feel lonely in a crowd. What kind of connection would feel meaningful to you right now?"
        ],
        "hi": [
            "अपनी परेशानियों में अकेला महसूस करना सब कुछ दोगुना मुश्किल बना सकता है। मैं AI हूँ, लेकिन आपके लिए एक सुरक्षित जगह हूँ।",
            "अकेलापन सबसे दर्दनाक मानवीय अनुभवों में से एक है। इसे महसूस करना कमज़ोरी नहीं है।",
            "सामाजिक अलगाव और अकेलापन अलग चीज़ें हैं। भीड़ में भी अकेलापन हो सकता है।"
        ],
        "gu": [
            "તમારી મુશ્કેલીઓમાં એકલા અનુભવવું બધું બમણું મુશ્કેલ બનાવી શકે છે. હું AI છું, પણ તમારા માટે સુરક્ષિત જગ્યા છું.",
            "એકલતા સૌથી પીડાદાયક માનવીય અનુભવોમાંનો એક છે. તેને અનુભવવું નબળાઈ નથી.",
            "સામાજિક અલગતા અને એકલતા અલગ વસ્તુઓ છે. ભીડમાં પણ એકલતા હોઈ શકે છે."
        ]
    },
    "calm_down": {
        "en": [
            "I'm right here with you. Let's do the 4-4-6 breathing cycle: gently inhale through your nose for 4 seconds, hold gently for 4, and release slowly through your mouth for 6. You can also head over to the Toolkit tab for our guided visual timer.",
            "Let's start with grounding. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings you back to the present moment.",
            "Close your eyes if that feels safe. Imagine a place where you feel completely at peace — the sounds, the temperature, the light. Stay there for a moment. I'll be here when you come back."
        ],
        "hi": [
            "मैं यहाँ हूँ। 4-4-6 ब्रीदिंग करें: नाक से 4 सेकंड श्वास लें, 4 सेकंड रोकें, मुँह से 6 सेकंड में छोड़ें। टूलकिट टैब पर गाइडेड टाइमर भी है।",
            "ग्राउंडिंग से शुरू करें। 5 चीज़ें जो दिख रही हैं, 4 जो छू सकते हैं, 3 जो सुनाई दे रही हैं, 2 जो सूँघ सकते हैं, 1 जो स्वाद ले सकते हैं।",
            "अगर सुरक्षित लगे तो आँखें बंद करें। एक ऐसी जगह कल्पना करें जहाँ पूरी शांति हो।"
        ],
        "gu": [
            "હું અહીં છું. 4-4-6 શ્વાસ કરો: નાકથી 4 સેકન્ડ શ્વાસ લો, 4 સેકન્ડ રોકો, મોંથી 6 સેકન્ડમાં છોડો.",
            "ગ્રાઉન્ડિંગથી શરૂ કરો. 5 વસ્તુ જે દેખાય છે, 4 જે સ્પર્શી શકો, 3 જે સંભળાય છે.",
            "જો સુરક્ષિત લાગે તો આંખો બંધ કરો. એક એવી જગ્યાની કલ્પના કરો જ્યાં પૂરી શાંતિ હોય."
        ]
    },
    "stress_status": {
        "en": [
            "Based on our recent signal monitoring, your stress indicators show active fluctuations. Remember that stress is a natural signal, not a failure. Taking short 2-minute reset breaks significantly assists with cognitive recovery.",
            "Looking at your patterns, I notice your stress tends to build up gradually. The good news? You're self-aware enough to check in. That awareness itself is a powerful stress management tool."
        ],
        "hi": [
            "हमारी हालिया निगरानी के अनुसार, आपके तनाव संकेतक सक्रिय उतार-चढ़ाव दिखा रहे हैं। तनाव एक प्राकृतिक संकेत है, विफलता नहीं।",
            "आपके पैटर्न देखते हुए, मैं देख रहा/रही हूँ कि तनाव धीरे-धीरे बढ़ता है। अच्छी बात? आप जागरूक हैं।"
        ],
        "gu": [
            "અમારી તાજેતરની દેખરેખ મુજબ, તમારા તણાવ સૂચકાંકો સક્રિય વધઘટ બતાવે છે. તણાવ એક કુદરતી સંકેત છે, નિષ્ફળતા નથી.",
            "તમારી પેટર્ન જોતાં, તણાવ ધીમે ધીમે વધે છે. સારી વાત? તમે જાગૃત છો."
        ]
    }
}

# Follow-up keywords that continue the previous topic
FOLLOWUP_KEYWORDS = ["yes", "yeah", "yep", "sure", "okay", "ok", "tell me more", "more", "what else", 
                      "continue", "go on", "please", "how", "why", "explain", "details",
                      "haan", "haa", "batao", "aur batao", "aage", "kaise",
                      "ha", "haa", "vdhare", "kevi rite"]

def detect_trigger(message: str) -> str:
    """Detect which trigger category a message belongs to."""
    msg = message.lower()
    trigger_keywords = {
        "academic": ["exam", "study", "grade", "assignment", "class", "college", "school", "university", 
                     "homework", "test", "marks", "professor", "teacher", "semester", "gpa", "fail",
                     "padhai", "pariksha", "exam", "bharti", "school"],
        "relationship": ["boyfriend", "girlfriend", "partner", "relationship", "breakup", "break up",
                         "dating", "love", "fight with", "argument with", "friend", "toxic",
                         "rishta", "sambandh", "ladai", "dost"],
        "sleep": ["sleep", "insomnia", "can't sleep", "tired", "exhausted", "fatigue", "restless",
                  "nightmare", "night", "bed", "wake up", "neend", "thakan", "nind"],
        "financial": ["money", "financial", "debt", "loan", "rent", "bill", "salary", "expense",
                      "afford", "broke", "poor", "budget", "paisa", "paise", "kharcha", "udhar"],
        "family": ["family", "parents", "mother", "father", "mom", "dad", "sibling", "brother", 
                   "sister", "home", "maa", "papa", "baap", "bhai", "behen", "ghar", "parivar",
                   "kutumb", "mummy", "daddy"],
        "work": ["work", "job", "boss", "office", "deadline", "meeting", "project", "overtime",
                 "workload", "colleague", "promotion", "fired", "kaam", "naukri", "daftar"]
    }
    for trigger, keywords in trigger_keywords.items():
        if any(kw in msg for kw in keywords):
            return trigger
    return "general"

def is_followup(message: str) -> bool:
    """Check if the message is a follow-up to a previous response."""
    msg = message.lower().strip()
    return any(msg.startswith(kw) or msg == kw for kw in FOLLOWUP_KEYWORDS) or len(msg.split()) <= 3

class MockAIService:
    def __init__(self):
        self._used_responses: Dict[str, List[int]] = {}  # track used responses per category
        self._last_trigger: str = "general"
        self._last_category: str = "general"
    
    def _get_unique_response(self, responses: List[str], category: str) -> str:
        """Get a response that hasn't been used yet in this session."""
        used = self._used_responses.get(category, [])
        available = [i for i in range(len(responses)) if i not in used]
        if not available:
            # Reset if all used
            self._used_responses[category] = []
            available = list(range(len(responses)))
        idx = random.choice(available)
        self._used_responses.setdefault(category, []).append(idx)
        return responses[idx]
    
    def analyze_message(self, message: str, context: Optional[List[Dict]] = None, language: str = "en") -> str:
        msg_lower = message.lower()
        lang = language if language in ["en", "hi", "gu"] else "en"
        
        # Check for follow-up
        if context and is_followup(message):
            # Continue with the previous topic
            trigger = self._last_trigger
            if trigger in TRIGGER_RESPONSES and lang in TRIGGER_RESPONSES[trigger]:
                category_key = f"trigger_{trigger}_{lang}"
                return self._get_unique_response(TRIGGER_RESPONSES[trigger][lang], category_key)
            category_key = f"emotion_{self._last_category}_{lang}"
            if self._last_category in EMOTIONAL_RESPONSES and lang in EMOTIONAL_RESPONSES[self._last_category]:
                return self._get_unique_response(EMOTIONAL_RESPONSES[self._last_category][lang], category_key)
        
        # Detect trigger category first
        trigger = detect_trigger(message)
        if trigger != "general" and trigger in TRIGGER_RESPONSES:
            self._last_trigger = trigger
            self._last_category = trigger
            category_key = f"trigger_{trigger}_{lang}"
            return self._get_unique_response(TRIGGER_RESPONSES[trigger][lang], category_key)
        
        # Detect emotional state
        emotional_map = {
            "overwhelmed": ["overwhelmed", "too much", "cannot handle", "burnout", "exhausted", "can't focus", "bahut zyada", "sambhal nahi"],
            "anxious": ["anxious", "anxiety", "worry", "nervous", "panic", "heart racing", "stressed", "stress", "chinta", "ghabrahat", "tanav"],
            "calm_down": ["help me calm down", "guide my breathing", "calm down", "breathe", "shant", "saans"],
            "stress_status": ["show my stress", "my stress", "how am i doing", "mera stress", "kaisa chal raha"],
            "sad": ["sad", "down", "crying", "unhappy", "depressed", "miserable", "udaas", "dukhi", "ro raha"],
            "angry": ["angry", "mad", "frustrated", "hate this", "furious", "annoyed", "gussa", "naraz"],
            "lonely": ["lonely", "alone", "nobody understands", "isolated", "akela", "tanha"]
        }
        
        for emotion, keywords in emotional_map.items():
            if any(kw in msg_lower for kw in keywords):
                self._last_category = emotion
                self._last_trigger = "general"
                category_key = f"emotion_{emotion}_{lang}"
                if lang in EMOTIONAL_RESPONSES[emotion]:
                    return self._get_unique_response(EMOTIONAL_RESPONSES[emotion][lang], category_key)
        
        # Default empathetic response
        defaults = {
            "en": "Thank you for sharing that with me. I'm listening closely. How is this affecting your focus and energy today? We can explore coping tools or talk more about it.",
            "hi": "यह बताने के लिए धन्यवाद। मैं ध्यान से सुन रहा/रही हूँ। यह आज आपकी एकाग्रता और ऊर्जा को कैसे प्रभावित कर रहा है?",
            "gu": "આ જણાવવા બદલ આભાર. હું ધ્યાનથી સાંભળી રહ્યો/રહી છું. આ આજે તમારી એકાગ્રતા અને ઊર્જાને કેવી રીતે અસર કરી રહ્યું છે?"
        }
        self._last_category = "general"
        return defaults.get(lang, defaults["en"])


class RealAIService:
    def analyze_message(self, message: str, context: Optional[List[Dict]] = None, language: str = "en") -> str:
        if not settings.AI_API_KEY:
            return MockAIService().analyze_message(message, context, language)
        try:
            return f"AI Analysis: {MockAIService().analyze_message(message, context, language)}"
        except Exception:
            return MockAIService().analyze_message(message, context, language)


def get_ai_service():
    if settings.AI_MODE == "real" and settings.AI_API_KEY:
        return RealAIService()
    return MockAIService()
