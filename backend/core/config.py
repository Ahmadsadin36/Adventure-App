# backend/core/config.py
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
import json
import os

class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False

    DATABASE_URL: Optional[str] = None

    # Accept either comma-separated OR JSON list string
    ALLOWED_ORIGINS: str = ""

    #[sample-update]: Made API key optional and added Choreo-compatible vars.
    OPENAI_API_KEY: Optional[str] = None
    CHOREO_OPENAI_CONNECTION_OPENAI_API_KEY: Optional[str] = None
    CHOREO_OPENAI_CONNECTION_SERVICEURL: Optional[str] = None

    def __init__(self, **values):
        super().__init__(**values)
        #[sample-update]: Graceful DB URL default & builder.
        if not self.DATABASE_URL:
            db_url = os.getenv("DATABASE_URL")
            if db_url:
                self.DATABASE_URL = db_url.strip()
            else:
                db_user = os.getenv("DB_USER")
                db_password = os.getenv("DB_PASSWORD")
                db_host = os.getenv("DB_HOST")
                db_port = os.getenv("DB_PORT")
                db_name = os.getenv("DB_NAME")
                if all([db_user, db_password, db_host, db_port, db_name]):
                    self.DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
                else:
                    # Default to local SQLite so the app runs out-of-the-box.
                    self.DATABASE_URL = "sqlite:///./database.database"

    @property
    def has_openai(self) -> bool:
        # [sample-update]: Single toggle used across the app.
        return bool(self.OPENAI_API_KEY or self.CHOREO_OPENAI_CONNECTION_OPENAI_API_KEY)

    @property
    def openai_base_url(self) -> Optional[str]:
        # [sample-update]: Optional non-default OpenAI-compatible base URL (e.g., Choreo).
        return self.CHOREO_OPENAI_CONNECTION_SERVICEURL

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def parse_allowed_origins(cls, v: str) -> List[str]:
        # [sample-update]: Accept JSON list or comma-separated string.
        if not v:
            return []
        v = v.strip()
        try:
            if v.startswith("["):
                data = json.loads(v)
                if isinstance(data, list):
                    return [str(x) for x in data]
        except Exception:
            pass
        # Fallback: comma-separated
        return [s.strip() for s in v.split(",") if s.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
