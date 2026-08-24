import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AI_MODE: str = os.getenv("AI_MODE", "mock")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mindshield.db")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    SAFETY_KEYWORDS: list[str] = [
        "suicide", "kill myself", "end it all", "hurt myself", "die", "harm",
        "no reason to live", "better off without me"
    ]

settings = Settings()
