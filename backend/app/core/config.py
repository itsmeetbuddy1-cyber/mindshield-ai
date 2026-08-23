import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AI_MODE: str = os.getenv("AI_MODE", "mock")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mindshield.db")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    SAFETY_KEYWORDS: list[str] = [
        "suicide", "kill myself", "end it all", "hurt myself", "die", "harm",
        "no reason to live", "better off without me"
    ]

settings = Settings()
