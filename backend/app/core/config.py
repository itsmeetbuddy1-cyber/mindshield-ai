import os
from dotenv import load_dotenv

load_dotenv()

def _get_secret(key: str, default: str = "") -> str:
    val = os.getenv(key, "")
    if not val:
        # Check Render secret files directory (/etc/secrets/<key>)
        secret_file = f"/etc/secrets/{key}"
        if os.path.exists(secret_file):
            try:
                with open(secret_file, "r") as f:
                    val = f.read().strip()
            except Exception:
                pass
    return val or default

class Settings:
    AI_MODE: str = _get_secret("AI_MODE", "real")
    DATABASE_URL: str = _get_secret("DATABASE_URL", "sqlite:///./mindshield.db")
    AI_API_KEY: str = _get_secret("AI_API_KEY", "")
    GEMINI_API_KEY: str = _get_secret("GEMINI_API_KEY", "") or _get_secret("AI_API_KEY", "")
    GROQ_API_KEY: str = _get_secret("GROQ_API_KEY", "")
    HUGGINGFACE_API_KEY: str = _get_secret("HUGGINGFACE_API_KEY", "") or _get_secret("HF_API_KEY", "") or _get_secret("HF_TOKEN", "")
    GOOGLE_CLIENT_ID: str = _get_secret("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = _get_secret("GOOGLE_CLIENT_SECRET", "")
    SAFETY_KEYWORDS: list[str] = [
        "suicide", "kill myself", "end it all", "hurt myself", "die", "harm",
        "no reason to live", "better off without me"
    ]

settings = Settings()
