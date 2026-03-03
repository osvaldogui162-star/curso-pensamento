from __future__ import annotations

from typing import Optional

from supabase import Client, create_client

from app.config.settings import settings

_supabase_client: Optional[Client] = None


def init_supabase_client() -> Client:
    """Inicializa o cliente Supabase em modo singleton.

    Responsabilidade única: conectar ao Supabase.
    """

    global _supabase_client

    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_service_key:
            raise RuntimeError(
                "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados"
            )

        _supabase_client = create_client(
            settings.supabase_url, settings.supabase_service_key
        )

    return _supabase_client


def get_supabase() -> Client:
    """Obtém o cliente já inicializado."""
    if _supabase_client is None:
        return init_supabase_client()
    return _supabase_client


def new_supabase_service_client() -> Client:
    """Cria um novo cliente Supabase com Service Role Key.

    Importante: o client do supabase pode carregar estado de auth em memória.
    Para operações administrativas (Storage/DB) queremos um client "limpo",
    sempre autenticado como service_role, para evitar falhas de RLS.
    """
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError(
            "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados"
        )
    return create_client(settings.supabase_url, settings.supabase_service_key)

