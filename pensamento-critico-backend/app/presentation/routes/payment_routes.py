from __future__ import annotations

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from uuid import uuid4
from storage3.exceptions import StorageApiError

from app.application.services.auth_service import AuthService
from app.application.services.payment_service import PaymentService
from app.infrastructure.database.supabase_client import new_supabase_service_client
from app.infrastructure.repositories.course_repo import SupabaseCourseRepository
from app.infrastructure.repositories.payment_repo import SupabasePaymentRequestRepository
from app.infrastructure.repositories.user_repo import SupabaseUserRepository
from app.presentation.schemas.payment_schemas import (
    PaymentRequestCreateSchema,
    PaymentRequestSchema,
)
from app.shared.exceptions import DomainError
from app.shared.utils import parse_body


payment_bp = Blueprint("payments", __name__)


def _get_auth_service() -> AuthService:
    return AuthService(user_repo=SupabaseUserRepository())


def _require_user_id() -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise DomainError("missing_token", "Token não informado", http_status=401)
    token = auth_header.removeprefix("Bearer ").strip()
    user = _get_auth_service().get_user_from_token(token)
    return user["id"]


def _get_payment_service() -> PaymentService:
    return PaymentService(
        payment_repo=SupabasePaymentRequestRepository(),
        course_repo=SupabaseCourseRepository(),
    )


@payment_bp.get("/payments/requests")
def list_my_requests():
    user_id = _require_user_id()
    course_id = request.args.get("course_id")
    cid = int(course_id) if course_id and course_id.isdigit() else None
    service = _get_payment_service()
    items = service.list_my_requests(user_id=user_id, course_id=cid)
    data = [PaymentRequestSchema(**r.__dict__).model_dump() for r in items]  # type: ignore[arg-type]
    return jsonify(data), 200


@payment_bp.post("/payments/requests")
def create_request():
    user_id = _require_user_id()
    payload = parse_body(PaymentRequestCreateSchema)
    service = _get_payment_service()
    req = service.create_request(
        user_id=user_id,
        course_id=payload.course_id,
        method=payload.method,
        receipt_path=payload.receipt_path,
        reference_code=payload.reference_code,
        note=payload.note,
    )
    data = PaymentRequestSchema(**req.__dict__).model_dump()  # type: ignore[arg-type]
    return jsonify(data), 201


@payment_bp.post("/payments/receipts/upload")
@payment_bp.post("/payments/receipts/upload/")
def upload_receipt():
    user_id = _require_user_id()

    if "file" not in request.files:
        raise DomainError("missing_file", "Nenhum arquivo enviado")

    file = request.files["file"]
    if not file.filename:
        raise DomainError("missing_file_name", "Arquivo sem nome")

    filename = secure_filename(file.filename)
    allowed = (".pdf", ".png", ".jpg", ".jpeg")
    if not filename.lower().endswith(allowed):
        raise DomainError("invalid_file_type", "Envie um PDF ou imagem (PNG/JPG)")

    path = f"receipts/{user_id}/{uuid4().hex}_{filename}"

    supabase = new_supabase_service_client()
    # Garante que o bucket exista (evita falhas silenciosas em ambientes novos)
    try:
        supabase.storage.get_bucket("payment_receipts")
    except StorageApiError:
        # cria bucket privado com tipos comuns
        supabase.storage.create_bucket(
            "payment_receipts",
            options={
                "public": False,
                "allowed_mime_types": [
                    "application/pdf",
                    "image/png",
                    "image/jpeg",
                ],
            },
        )

    storage = supabase.storage.from_("payment_receipts")

    content_type = "application/pdf"
    if filename.lower().endswith(".png"):
        content_type = "image/png"
    if filename.lower().endswith(".jpg") or filename.lower().endswith(".jpeg"):
        content_type = "image/jpeg"

    try:
        file_bytes = file.read()
        if not file_bytes:
            raise DomainError("empty_file", "Arquivo vazio")
        storage.upload(path, file_bytes, {"content-type": content_type})
    except Exception as exc:  # pragma: no cover
        raise DomainError("receipt_upload_failed", "Não foi possível enviar o comprovativo", str(exc))

    return jsonify({"path": path}), 201

