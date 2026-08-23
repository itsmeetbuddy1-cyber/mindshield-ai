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


