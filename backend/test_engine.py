import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))
sys.path.insert(0, os.path.dirname(__file__))

from app.services.ai_service import get_ai_service

def test():
    service = get_ai_service()
    res1 = service.analyze_message("I have an exam soon and I'm distracted by my phone", session_id="test_session")
    print(res1)
    res2 = service.analyze_message("What should I do?", session_id="test_session")
    print(res2)

if __name__ == "__main__":
    test()
