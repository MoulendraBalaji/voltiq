import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables and .env file.
    """
    # Secrets
    anthropic_api_key: str = Field(default="sk-ant-placeholder")
    
    # Database
    database_url: str = Field(default="sqlite:///./voltiq.db")
    
    # CORS
    allowed_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    
    # Server configs
    host: str = Field(default="127.0.0.1")
    port: int = Field(default=8000)

    # Load from .env file at backend/../.env (which is root .env)
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated origins string to list."""
        if not self.allowed_origins:
            return []
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

# Initialize settings
settings = Settings()
