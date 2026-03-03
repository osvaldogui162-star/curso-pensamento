from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


UserRole = Literal["student", "admin"]


@dataclass
class User:
    """Entidade de domínio para usuário.

    Não conhece detalhes de framework, HTTP ou banco.
    """

    id: str
    email: str
    name: str
    role: UserRole = "student"
    created_at: Optional[datetime] = None

