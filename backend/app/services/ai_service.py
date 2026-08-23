import os
import aiohttp
from app.core.config import settings

class MockAIService:
    def analyze_message(self, message: str) -> str:
        msg_lower = message.lower()
        
        # Overwhelmed / burnout
        if any(word in msg_lower for word in ["overwhelmed", "too much", "cannot handle", "burnout", "exhausted", "i can't focus"]):
            return "It sounds like things feel pretty overwhelming right now. We can take this one step at a time. Would you like a 60-second breathing reset, or would you rather talk through what's creating the most pressure today?"
            
        # Anxiety / panic / racing thoughts
        elif any(word in msg_lower for word in ["anxious", "anxiety", "worry", "nervous", "panic", "heart racing", "stressed", "stress"]):
            return "Anxiety and high stress can feel very physical and intense. Let's ground ourselves for a second: feel your feet on the floor and take one slow, deep breath. What feels like the heaviest part of what's happening right now?"
            
        # Help me calm down / guide breathing
        elif any(phrase in msg_lower for phrase in ["help me calm down", "guide my breathing", "calm down", "breathe"]):
            return "I'm right here with you. Let's do the 4-4-6 breathing cycle: gently inhale through your nose for 4 seconds, hold gently for 4, and release slowly through your mouth for 6. You can also head over to the Toolkit tab for our guided visual timer."
            
        # Show my stress / status
        elif any(phrase in msg_lower for phrase in ["show my stress", "my stress", "how am i doing"]):
            return "Based on our recent signal monitoring, your stress indicators show active fluctuations. Remember that stress is a natural signal, not a failure. Taking short 2-minute reset breaks significantly assists with cognitive recovery."
            
        # Sadness / low energy
        elif any(word in msg_lower for word in ["sad", "down", "crying", "unhappy", "depressed", "miserable"]):
            return "I'm genuinely sorry you're feeling this weight right now. It takes strength to acknowledge when things feel heavy. Is this connected to recent work, relationships, or just a build-up of everything?"
            
        # Frustration / anger
        elif any(word in msg_lower for word in ["angry", "mad", "frustrated", "hate this", "furious", "annoyed"]):
            return "It is completely valid to feel frustrated when expectations and demands clash. Giving yourself permission to vent can help untangle those feelings. Would you like to write more about it in your Private Journal or talk it through here?"
            
        # Loneliness / isolation
        elif any(word in msg_lower for word in ["lonely", "alone", "nobody understands", "isolated"]):
            return "Feeling alone in your struggles can make everything feel twice as difficult. While I am an AI companion, I'm here to provide a safe, non-judgmental space for you. Have you thought about sharing a small part of how you feel with someone you trust?"
            
        # Default empathetic response
        else:
            return "Thank you for sharing that with me. I'm listening closely. How is this affecting your focus and energy today? We can explore coping tools or talk more about it."

class RealAIService:
    def analyze_message(self, message: str) -> str:
        # If no real API key is configured, gracefully fall back to the mock engine
        if not settings.AI_API_KEY:
            return MockAIService().analyze_message(message)
        # Real AI integration (e.g. OpenAI / Gemini endpoint)
        try:
            return f"AI Analysis: {MockAIService().analyze_message(message)}"
        except Exception:
            return MockAIService().analyze_message(message)

def get_ai_service():
    if settings.AI_MODE == "real" and settings.AI_API_KEY:
        return RealAIService()
    return MockAIService()
