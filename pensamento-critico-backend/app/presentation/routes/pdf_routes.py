from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.application.services.auth_service import AuthService
from app.application.services.pdf_access_service import PdfAccessService
from app.infrastructure.repositories.course_repo import (
    SupabaseEnrollmentRepository,
    SupabaseModuleRepository,
)
from app.infrastructure.repositories.user_repo import SupabaseUserRepository


pdf_bp = Blueprint("pdf", __name__)


def _get_auth_service() -> AuthService:
    return AuthService(user_repo=SupabaseUserRepository())


def _get_pdf_service() -> PdfAccessService:
    module_repo = SupabaseModuleRepository()
    enrollment_repo = SupabaseEnrollmentRepository()
    return PdfAccessService(module_repo=module_repo, enrollment_repo=enrollment_repo)


@pdf_bp.get("/modules/<int:module_id>/pdf")
def get_module_pdf(module_id: int):
    """Retorna uma URL temporária para o PDF do módulo.

    Espera receber o token de acesso do Supabase no header Authorization:
      Authorization: Bearer <access_token>
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "missing_token", "message": "Token não informado"}), 401

    token = auth_header.removeprefix("Bearer ").strip()

    auth_service = _get_auth_service()
    user_dict = auth_service.get_user_from_token(token)
    user_id = user_dict["id"]

    pdf_service = _get_pdf_service()
    signed = pdf_service.get_signed_url(user_id=user_id, module_id=module_id)

    return jsonify({"signed_url": signed.url, "expires_in": signed.expires_in}), 200

