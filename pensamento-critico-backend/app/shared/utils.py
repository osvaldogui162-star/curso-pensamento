from __future__ import annotations

from typing import Type, TypeVar

from flask import Request, request
from pydantic import BaseModel, ValidationError

from app.shared.exceptions import DomainError


T = TypeVar("T", bound=BaseModel)


def parse_body(model: Type[T], req: Request | None = None) -> T:
    """Valida o corpo JSON de uma requisição usando Pydantic.

    SRP: transformar JSON em DTO tipado, disparando DomainError em caso de erro.
    """
    req = req or request
    try:
        data = req.get_json(force=True, silent=False) or {}
    except Exception as exc:  # pragma: no cover
        raise DomainError("invalid_json", "JSON malformado", str(exc))

    try:
        return model.model_validate(data)
    except ValidationError as exc:
        raise DomainError("validation_error", "Dados inválidos", exc.errors())

