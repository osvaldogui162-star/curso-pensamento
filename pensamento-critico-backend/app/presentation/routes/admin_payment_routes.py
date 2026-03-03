from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.application.services.admin_payment_service import AdminPaymentService
from app.application.services.auth_service import AuthService
from app.infrastructure.repositories.course_repo import SupabaseEnrollmentRepository
from app.infrastructure.repositories.payment_repo import SupabasePaymentRequestRepository
from app.infrastructure.repositories.user_repo import SupabaseUserRepository
from app.presentation.schemas.payment_schemas import PaymentRequestSchema, PaymentReviewSchema
from app.shared.exceptions import DomainError
from app.shared.utils import parse_body


admin_payment_bp = Blueprint("admin_payments", __name__)


def _get_auth_service() -> AuthService:
    return AuthService(user_repo=SupabaseUserRepository())


def _require_admin() -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise DomainError("missing_token", "Token não informado", http_status=401)
    token = auth_header.removeprefix("Bearer ").strip()
    user = _get_auth_service().get_user_from_token(token)
    if user.get("role") != "admin":
        raise DomainError("forbidden", "Apenas administradores podem realizar esta operação", http_status=403)
    return user["id"]


def _get_service() -> AdminPaymentService:
    return AdminPaymentService(
        payment_repo=SupabasePaymentRequestRepository(),
        enrollment_repo=SupabaseEnrollmentRepository(),
    )


@admin_payment_bp.get("/payments/requests")
def admin_list_requests():
    _require_admin()
    status = request.args.get("status", "pending")
    service = _get_service()
    items = service.list_requests(status=status)
    data = [PaymentRequestSchema(**r.__dict__).model_dump() for r in items]  # type: ignore[arg-type]
    return jsonify(data), 200


@admin_payment_bp.post("/payments/requests/<int:request_id>/approve")
def admin_approve(request_id: int):
    admin_id = _require_admin()
    payload = parse_body(PaymentReviewSchema)
    enrollment = _get_service().approve(request_id=request_id, admin_user_id=admin_id, note=payload.note)
    return jsonify({"enrollment_id": enrollment.id, "is_active": enrollment.is_active}), 200


@admin_payment_bp.post("/payments/requests/<int:request_id>/reject")
def admin_reject(request_id: int):
    admin_id = _require_admin()
    payload = parse_body(PaymentReviewSchema)
    req = _get_service().reject(request_id=request_id, admin_user_id=admin_id, note=payload.note)
    return jsonify(PaymentRequestSchema(**req.__dict__).model_dump()), 200  # type: ignore[arg-type]

