from typing import Dict, Any

class DemoService:
    def __init__(self):
        self.stage = 1
        self.stages_data = {
            1: {"stress_score": 32.0, "category": "calm", "message": "Demo started in Calm state.", "action": "None"},
            2: {"stress_score": 47.0, "category": "mild", "message": "Stress is building up slightly.", "action": "Suggesting a short break."},
            3: {"stress_score": 63.0, "category": "elevated", "message": "Stress is now elevated.", "action": "Recommending grounding exercise."},
            4: {"stress_score": 78.0, "category": "high", "message": "High stress detected. AI Intervention initiated.", "action": "Emergency cooling technique triggered."},
            5: {"stress_score": 53.0, "category": "mild", "message": "Recovery detected after intervention. Stress decreasing (78 -> 69 -> 61 -> 53).", "action": "Positive reinforcement."}
        }
        
    def advance_stage(self) -> Dict[str, Any]:
        if self.stage < 5:
            self.stage += 1
        return self.get_current_state()
        
    def get_current_state(self) -> Dict[str, Any]:
        data = self.stages_data[self.stage]
        return {
            "stage": self.stage,
            "stress_score": data["stress_score"],
            "category": data["category"],
            "message": data["message"],
            "action": data["action"]
        }
        
    def reset(self) -> Dict[str, Any]:
        self.stage = 1
        return self.get_current_state()

demo_service = DemoService()
