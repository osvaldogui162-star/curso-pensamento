from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.application.services.auth_service import AuthService
from app.infrastructure.repositories.user_repo import SupabaseUserRepository
from app.presentation.schemas.auth_schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
)
from app.shared.utils import parse_body


auth_bp = Blueprint("auth", __name__)


def _get_auth_service() -> AuthService:
    # Composição local das dependências (DIP)
    user_repo = SupabaseUserRepository()
    return AuthService(user_repo=user_repo)


@auth_bp.post("/login")
def login():
    payload = parse_body(LoginRequest)
    service = _get_auth_service()
    result = service.login(email=payload.email, password=payload.password)

    data = AuthResponse(access_token=result.access_token, user=result.user)
    return jsonify(data.model_dump()), 200


@auth_bp.post("/register")
def register():
    payload = parse_body(RegisterRequest)
    service = _get_auth_service()
    result = service.register(
        email=payload.email, password=payload.password, name=payload.name
    )

    data = AuthResponse(access_token=result.access_token, user=result.user)
    return jsonify(data.model_dump()), 201


@auth_bp.get("/me")
def me():
    """Retorna o usuário autenticado com base no token Bearer."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "missing_token", "message": "Token não informado"}), 401

    token = auth_header.removeprefix("Bearer ").strip()

    service = _get_auth_service()
    user = service.get_user_from_token(token)

    return jsonify(user), 200


@auth_bp.post("/logout")
def logout():
    """Endpoint de logout.

    Com Supabase Auth baseado em JWT, o logout é tratado principalmente no cliente.
    Este endpoint existe para simetria e eventual auditoria.
    """
    return "", 204

