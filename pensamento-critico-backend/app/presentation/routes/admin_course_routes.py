from __future__ import annotations

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from uuid import uuid4

from app.application.services.admin_course_service import AdminCourseService
from app.application.services.admin_module_service import AdminModuleService
from app.application.services.auth_service import AuthService
from app.infrastructure.database.supabase_client import new_supabase_service_client
from app.infrastructure.repositories.course_repo import SupabaseCourseRepository, SupabaseModuleRepository
from app.infrastructure.repositories.user_repo import SupabaseUserRepository
from app.presentation.schemas.course_schemas import (
    CourseCreateSchema,
    CourseSchema,
    CourseUpdateSchema,
    ModuleSchema,
    ModuleCreateSchema,
    ModuleUpdateSchema,
)
from app.shared.utils import parse_body
from app.shared.exceptions import DomainError


admin_course_bp = Blueprint("admin_courses", __name__)


def _get_auth_service() -> AuthService:
    return AuthService(user_repo=SupabaseUserRepository())


def _get_admin_course_service() -> AdminCourseService:
    course_repo = SupabaseCourseRepository()
    return AdminCourseService(course_repo=course_repo)


def _get_admin_module_service() -> AdminModuleService:
    module_repo = SupabaseModuleRepository()
    return AdminModuleService(module_repo=module_repo)


def _require_admin() -> str:
    """Extrai o token Bearer e valida se o usuário é admin.

    Retorna o ID do usuário autenticado.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise DomainError("missing_token", "Token não informado", http_status=401)

    token = auth_header.removeprefix("Bearer ").strip()

    auth_service = _get_auth_service()
    user = auth_service.get_user_from_token(token)

    if user.get("role") != "admin":
        raise DomainError("forbidden", "Apenas administradores podem realizar esta operação", http_status=403)

    return user["id"]


@admin_course_bp.get("/courses")
def admin_list_courses():
    _require_admin()
    service = _get_admin_course_service()
    courses = service.list_courses()
    data = [CourseSchema(**c.__dict__).model_dump() for c in courses]  # type: ignore[arg-type]
    return jsonify(data), 200


@admin_course_bp.post("/courses")
def admin_create_course():
    _require_admin()
    payload = parse_body(CourseCreateSchema)
    service = _get_admin_course_service()
    course = service.create_course(
        name=payload.name,
        description=payload.description,
        price=payload.price,
    )
    data = CourseSchema(**course.__dict__).model_dump()  # type: ignore[arg-type]
    return jsonify(data), 201


@admin_course_bp.patch("/courses/<int:course_id>")
def admin_update_course(course_id: int):
    _require_admin()
    payload = parse_body(CourseUpdateSchema)
    service = _get_admin_course_service()
    course = service.update_course(
        course_id=course_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
    )
    data = CourseSchema(**course.__dict__).model_dump()  # type: ignore[arg-type]
    return jsonify(data), 200


@admin_course_bp.delete("/courses/<int:course_id>")
def admin_delete_course(course_id: int):
    _require_admin()
    service = _get_admin_course_service()
    service.delete_course(course_id)
    return "", 204


@admin_course_bp.get("/courses/<int:course_id>/modules")
def admin_list_modules(course_id: int):
    _require_admin()
    service = _get_admin_module_service()
    modules = service.list_modules(course_id)
    data = [ModuleSchema(**m.__dict__).model_dump() for m in modules]  # type: ignore[arg-type]
    return jsonify(data), 200


@admin_course_bp.post("/courses/<int:course_id>/modules")
def admin_create_module(course_id: int):
    _require_admin()
    payload = parse_body(ModuleCreateSchema)
    service = _get_admin_module_service()
    module = service.create_module(
        course_id=course_id,
        title=payload.title,
        order=payload.order,
        pdf_path=payload.pdf_path,
    )
    data = ModuleSchema(**module.__dict__).model_dump()  # type: ignore[arg-type]
    return jsonify(data), 201


@admin_course_bp.patch("/modules/<int:module_id>")
def admin_update_module(module_id: int):
    _require_admin()
    payload = parse_body(ModuleUpdateSchema)
    service = _get_admin_module_service()
    module = service.update_module(
        module_id=module_id,
        title=payload.title,
        order=payload.order,
        pdf_path=payload.pdf_path,
    )
    data = ModuleSchema(**module.__dict__).model_dump()  # type: ignore[arg-type]
    return jsonify(data), 200


@admin_course_bp.delete("/modules/<int:module_id>")
def admin_delete_module(module_id: int):
    _require_admin()
    service = _get_admin_module_service()
    service.delete_module(module_id)
    return "", 204


@admin_course_bp.post("/modules/upload")
def admin_upload_module_pdf():
    user_id = _require_admin()

    if "file" not in request.files:
        raise DomainError("missing_file", "Nenhum arquivo enviado")

    file = request.files["file"]
    if not file.filename:
        raise DomainError("missing_file_name", "Arquivo sem nome")

    filename = secure_filename(file.filename)
    if not filename.lower().endswith(".pdf"):
        raise DomainError("invalid_file_type", "Apenas arquivos PDF são permitidos")

    # Caminho organizado por usuário e nome único
    path = f"{user_id}/{uuid4().hex}_{filename}"

    supabase = new_supabase_service_client()
    storage = supabase.storage.from_("course_pdfs")

    try:
        file_bytes = file.read()
        if not file_bytes:
            raise DomainError("empty_file", "Arquivo vazio")

        # storage3 aceita bytes diretamente; definimos o content-type corretamente.
        storage.upload(path, file_bytes, {"content-type": "application/pdf"})
    except Exception as exc:  # pragma: no cover - proteção
        raise DomainError("pdf_upload_failed", "Não foi possível enviar o PDF", str(exc))

    return jsonify({"path": path}), 201

