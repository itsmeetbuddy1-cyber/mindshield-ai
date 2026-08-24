import pytest
from app.services.multimodal_scoring import (
    calculate_voice_score,
    calculate_behavior_score,
    calculate_physiological_score,
    calculate_self_report_score,
    compute_multimodal_stress,
    normalize_deviation,
    DEFAULT_BASELINES
)
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_voice_score_formula():
    """1. Voice Score = 0.30 * Speaking-rate + 0.25 * Pause + 0.25 * Pitch + 0.20 * Loudness"""
    # Test with normalized inputs: 50, 60, 70, 80
    # Expected = 0.30*50 + 0.25*60 + 0.25*70 + 0.20*80 = 15 + 15 + 17.5 + 16 = 63.5
    score, meta = calculate_voice_score(
        speaking_rate_score=50.0,
        pause_score=60.0,
        pitch_score=70.0,
        loudness_score=80.0
    )
    assert score == 63.5
    assert meta["available"] is True
    assert len(meta["active_subcomponents"]) == 4


def test_behavior_score_formula():
    """2. Behavior Score = 0.25 * Blink + 0.25 * Facial-tension + 0.25 * Movement + 0.25 * Posture"""
    # Test with normalized inputs: 40, 60, 80, 20
    # Expected = 0.25*(40 + 60 + 80 + 20) = 0.25 * 200 = 50.0
    score, meta = calculate_behavior_score(
        blink_deviation=40.0,
        facial_tension=60.0,
        movement_restlessness=80.0,
        posture_deviation=20.0
    )
    assert score == 50.0
    assert meta["available"] is True
    assert len(meta["active_subcomponents"]) == 4


def test_physiological_score_formula():
    """3. Physiological Score = 0.40 * HR + 0.40 * HRV + 0.20 * Breathing"""
    # Test with normalized inputs: 70, 50, 40
    # Expected = 0.40*70 + 0.40*50 + 0.20*40 = 28 + 20 + 8 = 56.0
    score, meta = calculate_physiological_score(
        hr_deviation=70.0,
        hrv_deviation=50.0,
        breathing_deviation=40.0
    )
    assert score == 56.0
    assert meta["available"] is True
    assert len(meta["active_subcomponents"]) == 3


def test_self_report_score_formula():
    """4. Self-report Score = answer * 25 (for 0-4 scale)"""
    # 0 -> 0, 1 -> 25, 2 -> 50, 3 -> 75, 4 -> 100
    for ans, expected in [(0, 0.0), (1, 25.0), (2, 50.0), (3, 75.0), (4, 100.0)]:
        score, meta = calculate_self_report_score(ans, scale_type="0-4")
        assert score == expected
        assert meta["available"] is True


def test_final_score_all_four_modalities():
    """5. FINAL SCORE = 0.30 * Voice + 0.20 * Behavior + 0.30 * Physio + 0.20 * Self-report"""
    # Voice=60, Behavior=50, Physio=40, Self-report=75
    # Expected = 0.30*60 + 0.20*50 + 0.30*40 + 0.20*75 = 18 + 10 + 12 + 15 = 55.0
    result = compute_multimodal_stress(
        voice_score=60.0,
        behavior_score=50.0,
        physiological_score=40.0,
        self_report_score=75.0
    )
    assert result["status"] == "success"
    assert result["final_stress_score"] == 55.0
    assert result["interpretation"] == "Moderate"  # 50-74 = Moderate
    assert result["category"] == "moderate"
    assert len(result["modalities_available"]) == 4
    assert len(result["modalities_unavailable"]) == 0
    assert result["is_medical_diagnosis"] is False


def test_missing_data_renormalization():
    """6. Missing Data: Re-normalize available weights so they sum to 1.0"""
    # Scenario A: Only Voice (0.30) and Self-report (0.20) are available.
    # Total active weight = 0.30 + 0.20 = 0.50
    # Voice effective weight = 0.30 / 0.50 = 0.60
    # Self-report effective weight = 0.20 / 0.50 = 0.40
    # Scores: Voice=80, Self-report=50
    # Expected Final = 0.60*80 + 0.40*50 = 48 + 20 = 68.0
    result = compute_multimodal_stress(
        voice_score=80.0,
        behavior_score=None,
        physiological_score=None,
        self_report_score=50.0
    )
    assert result["status"] == "success"
    assert result["final_stress_score"] == 68.0
    assert set(result["modalities_available"]) == {"voice", "self_report"}
    assert set(result["modalities_unavailable"]) == {"behavior", "physiological"}

    # Check that effective weights sum to 100%
    active_weights = [c["effective_weight"] for c in result["contributions"] if c["available"]]
    assert round(sum(active_weights), 1) == 100.0


def test_insufficient_data_handling():
    """6B. Return Insufficient Data if literally no modalities are available"""
    result = compute_multimodal_stress(
        voice_score=None,
        behavior_score=None,
        physiological_score=None,
        self_report_score=None
    )
    assert result["status"] == "insufficient_data"
    assert result["final_stress_score"] is None
    assert result["interpretation"] == "Insufficient data"
    assert len(result["modalities_available"]) == 0


def test_baseline_deviations():
    """7. Test baseline deviation normalization"""
    # Resting HR baseline = 72 bpm, user HR = 93 bpm (delta = 21)
    # Expected deviation on 35 bpm max delta = (21/35)*100 = 60.0
    score, meta = calculate_physiological_score(
        raw_metrics={"heart_rate_bpm": 93.0, "hrv_ms": 55.0, "respiration_rate": 14.0},
        baseline={"resting_hr": 72.0, "resting_hrv": 55.0, "breathing_rate": 14.0}
    )
    assert meta["sub_components"]["hr_deviation"] == 60.0
    assert meta["sub_components"]["hrv_deviation"] == 0.0
    assert meta["sub_components"]["breathing_deviation"] == 0.0
    # Physio Score = 0.40*60 + 0 + 0 = 24.0
    assert score == 24.0


def test_interpretations_and_safety_disclaimer():
    """8 & 9. Interpretation thresholds and non-diagnostic safety wording"""
    # 0-24 = Low
    res_low = compute_multimodal_stress(self_report_score=15.0)
    assert res_low["interpretation"] == "Low"

    # 25-49 = Mild
    res_mild = compute_multimodal_stress(self_report_score=35.0)
    assert res_mild["interpretation"] == "Mild"

    # 50-74 = Moderate
    res_mod = compute_multimodal_stress(self_report_score=65.0)
    assert res_mod["interpretation"] == "Moderate"

    # 75-100 = High
    res_high = compute_multimodal_stress(self_report_score=90.0)
    assert res_high["interpretation"] == "High"

    # Verify disclaimer and safety non-diagnostic wording
    assert res_high["is_medical_diagnosis"] is False
    assert "NOT a medical diagnosis" in res_high["disclaimer"]
    assert "Estimated stress" in res_high["recommended_action"] or "distress indicators" in res_high["recommended_action"]


def test_api_score_multimodal_endpoint():
    """10. Test FastAPI route POST /api/score-multimodal"""
    payload = {
        "voice_score": 65.0,
        "behavior_score": 45.0,
        "self_report_val": 2.0,
        "self_report_scale": "0-4"
    }
    response = client.post("/api/score-multimodal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["voice_score"] == 65.0
    assert data["behavior_score"] == 45.0
    assert data["self_report_score"] == 50.0
    assert data["physiological_score"] is None
    # Effective weights for voice(0.3), behavior(0.2), self(0.2) -> sum=0.7
    # Voice=0.3/0.7, Beh=0.2/0.7, Self=0.2/0.7
    # Expected score = (0.3/0.7)*65 + (0.2/0.7)*45 + (0.2/0.7)*50 = 27.857 + 12.857 + 14.285 = 55.0
    assert data["final_stress_score"] == 55.0
    assert data["interpretation"] == "Moderate"
    assert "voice" in data["modalities_available"]
    assert "physiological" in data["modalities_unavailable"]
    assert data["is_medical_diagnosis"] is False
