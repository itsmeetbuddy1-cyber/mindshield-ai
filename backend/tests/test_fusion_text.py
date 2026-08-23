import pytest
from app.services.multimodal_fusion import fuse_signals
from app.services.text_analyzer import analyze_text_stress

def test_text_analyzer_low_stress():
    text = "I am feeling very calm and relaxed today. Everything is fine."
    result = analyze_text_stress(text)
    assert 10.0 <= result["text_stress_score"] <= 30.0

def test_text_analyzer_high_stress():
    text = "I am so overwhelmed and stressed out. I cannot handle this panic and exhaustion anymore!"
    result = analyze_text_stress(text)
    assert 70.0 <= result["text_stress_score"] <= 100.0

def test_fusion_low_stress():
    result = fuse_signals(self_report_score=20.0, text_score=15.0)
    assert 15.0 <= result["fused_score"] <= 30.0
    assert result["category"] == "calm"

def test_fusion_high_stress():
    result = fuse_signals(self_report_score=90.0, text_score=85.0, interaction_score=80.0)
    assert 80.0 <= result["fused_score"] <= 100.0
    assert result["category"] == "high"

def test_fusion_camera_off():
    result = fuse_signals(self_report_score=50.0, text_score=50.0, voice_score=50.0, camera_score=None, interaction_score=50.0)
    assert "camera_features" not in result["signals_used"]
    assert result["fused_score"] == 50.0

def test_fusion_mic_off():
    result = fuse_signals(self_report_score=60.0, text_score=60.0, voice_score=None, camera_score=60.0, interaction_score=60.0)
    assert "voice_features" not in result["signals_used"]
    assert result["fused_score"] == 60.0

def test_fusion_both_sensors_off():
    result = fuse_signals(self_report_score=40.0, text_score=40.0, voice_score=None, camera_score=None, interaction_score=40.0)
    assert len(result["signals_used"]) == 3
    assert result["fused_score"] == 40.0

def test_dynamic_variation_and_self_report_impact():
    res_low = fuse_signals(self_report_score=20.0, text_score=30.0)
    res_high = fuse_signals(self_report_score=90.0, text_score=85.0)
    assert res_high["fused_score"] > res_low["fused_score"] + 40.0
    assert res_high["fused_score"] != res_low["fused_score"]

def test_multilingual_text_analysis():
    hindi_res = analyze_text_stress("padhai ka bahut tension hai aur mujhe bohot chinta ho rahi hai")
    assert hindi_res["text_stress_score"] >= 60.0
    
    gujarati_res = analyze_text_stress("pariksha mate khub chinta thay chhe mane")
    assert gujarati_res["text_stress_score"] >= 50.0

def test_continuous_voice_five_turn_conversation():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    session_id = "test_voice_session_5turn"
    turns = [
        ("Mujhe exams ka stress ho raha hai.", "hi"),
        ("Concentration nahi ho raha.", "hi"),
        ("Main kya kar sakta hoon?", "hi"),
        ("Breathing exercise karwao.", "hi"),
        ("Ab thoda better lag raha hai.", "hi")
    ]
    
    for idx, (user_text, lang) in enumerate(turns, 1):
        res = client.post("/api/analyze-message", json={
            "message": user_text,
            "language": lang,
            "session_id": session_id
        })
        assert res.status_code == 200, f"Turn {idx} failed"
        data = res.json()
        assert "response" in data
        assert len(data["response"]) > 10, f"Turn {idx} response too short"

def test_continuous_voice_ten_turns():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    session_id = "test_voice_session_10turn"
    queries = [
        "I am feeling very anxious about deadlines",
        "Yes, tell me more about how to manage this",
        "What should I do first?",
        "I also have trouble sleeping at night",
        "My thoughts keep racing before bed",
        "Could you suggest a quick routine?",
        "Thanks, what about relationships stress?",
        "Sometimes communication gets hard",
        "I appreciate the guidance",
        "I am feeling much calmer now"
    ]
    
    for idx, query in enumerate(queries, 1):
        res = client.post("/api/analyze-message", json={
            "message": query,
            "language": "en",
            "session_id": session_id
        })
        assert res.status_code == 200, f"Turn {idx} failed: {res.text}"
        data = res.json()
        assert len(data["response"]) > 0
        assert data["safety_level"] in ["LOW", "MODERATE", "HIGH"]

def test_continuous_voice_twenty_turns_multilingual_loop():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    session_id = "test_alexa_voice_session_20turn"
    
    conversation_turns = [
        # Turn 1-5 (Hindi Academic Pressure)
        ("Mujhe exams ka bohot zyada tension ho raha hai.", "hi"),
        ("Concentration bilkul nahi ban raha hai.", "hi"),
        ("Aisa lagta hai sab bhool jaunga.", "hi"),
        ("Main padhai kaise schedule karun?", "hi"),
        ("Chalo pehle breathing exercise try karte hain.", "hi"),
        
        # Turn 6-10 (English Sleep & Routine)
        ("I also struggle to fall asleep when stressed.", "en"),
        ("My mind keeps racing with thoughts at midnight.", "en"),
        ("What is a good 10-minute wind down routine?", "en"),
        ("Should I avoid screens before sleeping?", "en"),
        ("That sounds doable, I will try it tonight.", "en"),
        
        # Turn 11-15 (Gujarati Family & Balance)
        ("મારે ઘર અને ભણતર બંનેનું સંતુલન રાખવું છે.", "gu"),
        ("ક્યારેક ઘરમાં પણ થોડો તણાવ રહે છે.", "gu"),
        ("મારે મારી જાત માટે સમય કેવી રીતે કાઢવો?", "gu"),
        ("તમારી સલાહ ખૂબ મદદરૂપ છે.", "gu"),
        ("હું હવે થોડો હળવો અનુભવું છું.", "gu"),
        
        # Turn 16-20 (English & Hindi Wrap-up & Followups)
        ("Can you summarize our focus areas for this week?", "en"),
        ("How often should I do the grounding exercises?", "en"),
        ("Bahut accha laga baat karke.", "hi"),
        ("Ab main confident feel kar raha hoon.", "hi"),
        ("Thank you Shield AI, goodbye!", "en")
    ]
    
    assert len(conversation_turns) == 20
    
    for idx, (prompt, lang) in enumerate(conversation_turns, 1):
        res = client.post("/api/analyze-message", json={
            "message": prompt,
            "language": lang,
            "session_id": session_id
        })
        assert res.status_code == 200, f"Turn {idx} failed"
        data = res.json()
        assert "response" in data
        assert len(data["response"]) > 5, f"Turn {idx} response empty"

def test_exact_15_turn_two_way_conversation():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    session_id = "test_two_way_conversation_15turn"
    
    script = [
        ("I am feeling stressed.", "en"),
        ("My exams are coming.", "en"),
        ("Mostly I can't concentrate.", "en"),
        ("I keep checking my phone.", "en"),
        ("4-5 hours.", "en"),
        ("Mathematics and Physics.", "en"),
        ("My parents also expect very high marks.", "en"),
        ("Both.", "en"),
        ("What should I do when I can't concentrate?", "en"),
        ("I also struggle to sleep at night.", "en"),
        ("My mind keeps racing before bed.", "en"),
        ("Could you guide a quick breathing exercise?", "en"),
        ("Thank you, I feel much calmer now.", "en"),
        ("I feel ready to start my 25-minute study block.", "en"),
        ("Goodbye Shield AI!", "en")
    ]
    
    assert len(script) == 15
    previous_responses = set()
    
    for turn, (msg, lang) in enumerate(script, 1):
        res = client.post("/api/analyze-message", json={
            "message": msg,
            "language": lang,
            "session_id": session_id
        })
        assert res.status_code == 200, f"Turn {turn} failed"
        data = res.json()
        
        # Verify rich metadata
        assert "response" in data
        assert len(data["response"]) > 10
        assert data["response"] not in previous_responses, f"Duplicate response detected on turn {turn}"
        previous_responses.add(data["response"])
        
        assert data["turn_id"] == turn
        assert data["current_topic"] is not None
        assert data["conversation_summary"] is not None
        assert data["stress_score"] is not None
        
        print(f"\n[TURN {turn:02d}] User: '{msg}'\nAI: '{data['response']}'\nTopic: {data['current_topic']} | Summary: {data['conversation_summary']} | Stress: {data['stress_score']} ({data['stress_trend']})")




