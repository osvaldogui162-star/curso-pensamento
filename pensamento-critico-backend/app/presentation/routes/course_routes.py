from __future__ import annotations

from flask import Blueprint, jsonify

from app.application.services.course_service import CourseService
from app.infrastructure.repositories.course_repo import (
    SupabaseCourseRepository,
    SupabaseModuleRepository,
)
from app.presentation.schemas.course_schemas import (
    CourseSchema,
    CourseWithModulesSchema,
    ModuleSchema,
)


course_bp = Blueprint("courses", __name__)


def _get_course_service() -> CourseService:
    course_repo = SupabaseCourseRepository()
    module_repo = SupabaseModuleRepository()
    return CourseService(course_repo=course_repo, module_repo=module_repo)


@course_bp.get("/courses")
def list_courses():
    service = _get_course_service()
    courses = service.list_courses()
    data = [CourseSchema(**c).model_dump() for c in courses]
    return jsonify(data), 200


@course_bp.get("/courses/<int:course_id>/modules")
def get_course_with_modules(course_id: int):
    service = _get_course_service()
    result = service.get_course_with_modules(course_id)

    course_data = CourseSchema(**result.course.__dict__)  # type: ignore[arg-type]
    modules_data = [ModuleSchema(**m.__dict__) for m in result.modules]  # type: ignore[arg-type]

    data = CourseWithModulesSchema(course=course_data, modules=modules_data)
    return jsonify(data.model_dump()), 200

