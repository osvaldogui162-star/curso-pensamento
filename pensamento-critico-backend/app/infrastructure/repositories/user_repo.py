from __future__ import annotations

from typing import Optional

from app.domain.entities.user import User
from app.domain.interfaces.repositories import UserRepository
from app.infrastructure.database.supabase_client import get_supabase


class SupabaseUserRepository(UserRepository):
    """Implementação de UserRepository usando tabelas do Supabase.

    Assumimos a existência de uma tabela `users` que espelha os dados básicos
    do usuário autenticado.
    """

    TABLE = "users"

    def __init__(self) -> None:
        self._client = get_supabase()

    def get_by_id(self, user_id: str) -> Optional[User]:
        response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )

        data = response.data
        if not data:
            return None

        return User(
            id=data["id"],
            email=data["email"],
            name=data.get("name") or "",
            role=data.get("role", "student"),
        )

    def upsert_from_supabase(self, supabase_user: dict) -> User:
        user_id = supabase_user["id"]
        email = supabase_user.get("email") or ""
        name = supabase_user.get("user_metadata", {}).get("full_name", "")

        # Busca usuário existente para preservar o role já definido (ex.: admin)
        existing_response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        existing = existing_response.data or {}
        role = existing.get("role", "student")

        payload = {
            "id": user_id,
            "email": email,
            "name": name,
            "role": role,
        }

        self._client.table(self.TABLE).upsert(payload).execute()

        return User(id=user_id, email=email, name=name, role=role)

