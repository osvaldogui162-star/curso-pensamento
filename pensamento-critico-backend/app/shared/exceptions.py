from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class DomainError(Exception):
    """Erro de domínio padrão.

    Não conhece frameworks; é traduzido para HTTP na camada de apresentação.
    """

    code: str
    message: str
    details: Optional[Any] = None
    http_status: int = 400

    def __str__(self) -> str:  # pragma: no cover - apenas representação
        return f"{self.code}: {self.message}"

