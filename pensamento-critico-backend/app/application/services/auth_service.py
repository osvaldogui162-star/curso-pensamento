from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

from app.infrastructure.database.supabase_client import get_supabase
from app.domain.interfaces.repositories import UserRepository
from app.shared.exceptions import DomainError


@dataclass
class AuthResult:
    access_token: str
    user: Dict[str, Any]


class AuthService:
    """Serviço de autenticação.

    SRP: orquestrar login/registro usando Supabase Auth e UserRepository.
    """

    def __init__(self, user_repo: UserRepository) -> None:
        self._supabase = get_supabase()
        self._user_repo = user_repo

    def register(self, email: str, password: str, name: str) -> AuthResult:
        try:
            result = self._supabase.auth.sign_up(
                {"email": email, "password": password, "options": {"data": {"full_name": name}}}
            )
        except Exception as exc:  # pragma: no cover - proteção geral
            raise DomainError("auth_register_failed", "Falha ao registrar usuário", str(exc))

        session = getattr(result, "session", None)
        user = getattr(result, "user", None)
        if not session or not user:
            raise DomainError("auth_register_failed", "Registro não retornou sessão válida")

        # Sincroniza usuário na tabela local e retorna representação de domínio
        domain_user = self._user_repo.upsert_from_supabase(user.model_dump())  # type: ignore[arg-type]

        user_payload: Dict[str, Any] = {
            "id": domain_user.id,
            "email": domain_user.email,
            "name": domain_user.name,
            "role": domain_user.role,
        }

        return AuthResult(access_token=session.access_token, user=user_payload)

    def login(self, email: str, password: str) -> AuthResult:
        try:
            result = self._supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
        except Exception as exc:  # pragma: no cover
            raise DomainError("auth_login_failed", "Falha ao autenticar usuário", str(exc))

        session = getattr(result, "session", None)
        user = getattr(result, "user", None)
        if not session or not user:
            raise DomainError("auth_login_failed", "Login não retornou sessão válida")

        domain_user = self._user_repo.upsert_from_supabase(user.model_dump())  # type: ignore[arg-type]

        user_payload: Dict[str, Any] = {
            "id": domain_user.id,
            "email": domain_user.email,
            "name": domain_user.name,
            "role": domain_user.role,
        }

        return AuthResult(access_token=session.access_token, user=user_payload)

    def get_user_from_token(self, access_token: str) -> dict:
        """Obtém o usuário atual a partir do JWT fornecido pelo Supabase."""
        try:
            result = self._supabase.auth.get_user(access_token)
        except Exception as exc:  # pragma: no cover
            raise DomainError("auth_invalid_token", "Token inválido", str(exc))

        supabase_user = getattr(result, "user", None)
        if not supabase_user:
            raise DomainError("auth_invalid_token", "Token inválido")

        user_id = getattr(supabase_user, "id", None)
        if not user_id:
          raise DomainError("auth_invalid_token", "Token inválido")

        domain_user = self._user_repo.get_by_id(user_id)
        if not domain_user:
            raise DomainError("auth_invalid_token", "Usuário não encontrado para este token")

        return {
            "id": domain_user.id,
            "email": domain_user.email,
            "name": domain_user.name,
            "role": domain_user.role,
        }

