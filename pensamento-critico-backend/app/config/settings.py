from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Configuração de ambiente centralizada.

    Responsabilidade única: fornecer acesso tipado às variáveis de ambiente.
    """

    env: str = os.getenv("ENV", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"

    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key")

    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # JWT – usado apenas se precisarmos emitir tokens próprios
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")
    jwt_access_expires_minutes: int = int(os.getenv("JWT_ACCESS_EXPIRES_MINUTES", "60"))


settings = Settings()

