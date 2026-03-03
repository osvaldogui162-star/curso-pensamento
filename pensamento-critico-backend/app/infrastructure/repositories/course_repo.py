from __future__ import annotations

from typing import Iterable, List, Optional
import re

from app.domain.entities.course import Course, Module, Enrollment
from app.domain.interfaces.repositories import (
    CourseRepository,
    ModuleRepository,
    EnrollmentRepository,
)
from app.infrastructure.database.supabase_client import get_supabase


class SupabaseCourseRepository(CourseRepository):
    TABLE = "courses"

    def __init__(self) -> None:
        self._client = get_supabase()

    def get_by_id(self, course_id: int) -> Optional[Course]:
        response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("id", course_id)
            .maybe_single()
            .execute()
        )
        data = response.data
        if not data:
            return None
        return Course(
            id=data["id"],
            name=data["name"],
            description=data.get("description", ""),
            price=float(data.get("price", 0)),
        )

    def list_all(self) -> Iterable[Course]:
        response = self._client.table(self.TABLE).select("*").execute()
        items = response.data or []
        courses: List[Course] = []
        for row in items:
            courses.append(
                Course(
                    id=row["id"],
                    name=row["name"],
                    description=row.get("description", ""),
                    price=float(row.get("price", 0)),
                )
            )
        return courses

    def create(self, name: str, description: str, price: float) -> Course:
        # Gera slug simples a partir do nome para atender à coluna NOT NULL no banco
        base_slug = re.sub(r"[^a-z0-9]+", "-", name.strip().lower())
        slug = (base_slug or "curso").strip("-")

        response = (
            self._client.table(self.TABLE)
            .insert(
                {
                    "name": name,
                    "slug": slug,
                    "description": description,
                    "price": price,
                }
            )
            .execute()
        )
        items = response.data or []
        if not items:
            raise RuntimeError("Falha ao criar curso no Supabase")

        data = items[0]
        return Course(
            id=data["id"],
            name=data["name"],
            description=data.get("description", ""),
            price=float(data.get("price", 0)),
        )

    def update(self, course: Course) -> Course:
        base_slug = re.sub(r"[^a-z0-9]+", "-", course.name.strip().lower())
        slug = (base_slug or "curso").strip("-")

        response = (
            self._client.table(self.TABLE)
            .update(
                {
                    "name": course.name,
                    "slug": slug,
                    "description": course.description,
                    "price": course.price,
                }
            )
            .eq("id", course.id)
            .execute()
        )
        items = response.data or []
        if not items:
            raise RuntimeError("Falha ao atualizar curso no Supabase")

        data = items[0]
        return Course(
            id=data["id"],
            name=data["name"],
            description=data.get("description", ""),
            price=float(data.get("price", 0)),
        )

    def delete(self, course_id: int) -> None:
        self._client.table(self.TABLE).delete().eq("id", course_id).execute()


class SupabaseModuleRepository(ModuleRepository):
    TABLE = "modules"

    def __init__(self) -> None:
        self._client = get_supabase()

    def list_by_course(self, course_id: int) -> Iterable[Module]:
        response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("course_id", course_id)
            .order("order", desc=False)
            .execute()
        )
        modules: List[Module] = []
        for row in response.data or []:
            modules.append(
                Module(
                    id=row["id"],
                    course_id=row["course_id"],
                    title=row["title"],
                    order=row["order"],
                    pdf_path=row["pdf_path"],
                )
            )
        return modules

    def get_by_id(self, module_id: int) -> Optional[Module]:
        response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("id", module_id)
            .maybe_single()
            .execute()
        )
        data = response.data
        if not data:
            return None
        return Module(
            id=data["id"],
            course_id=data["course_id"],
            title=data["title"],
            order=data["order"],
            pdf_path=data["pdf_path"],
        )

    def create(self, course_id: int, title: str, order: int, pdf_path: str) -> Module:
        base_slug = re.sub(r"[^a-z0-9]+", "-", title.strip().lower())
        clean_slug = (base_slug or "modulo").strip("-")
        slug = f"{order}-{clean_slug}"

        response = (
            self._client.table(self.TABLE)
            .insert(
                {
                    "course_id": course_id,
                    "title": title,
                    "slug": slug,
                    "order": order,
                    "pdf_path": pdf_path,
                }
            )
            .execute()
        )
        items = response.data or []
        if not items:
            raise RuntimeError("Falha ao criar módulo no Supabase")

        data = items[0]
        return Module(
            id=data["id"],
            course_id=data["course_id"],
            title=data["title"],
            order=data["order"],
            pdf_path=data["pdf_path"],
        )

    def update(self, module: Module) -> Module:
        base_slug = re.sub(r"[^a-z0-9]+", "-", module.title.strip().lower())
        clean_slug = (base_slug or "modulo").strip("-")
        slug = f"{module.order}-{clean_slug}"

        response = (
            self._client.table(self.TABLE)
            .update(
                {
                    "title": module.title,
                    "slug": slug,
                    "order": module.order,
                    "pdf_path": module.pdf_path,
                }
            )
            .eq("id", module.id)
            .execute()
        )
        items = response.data or []
        if not items:
            raise RuntimeError("Falha ao atualizar módulo no Supabase")

        data = items[0]
        return Module(
            id=data["id"],
            course_id=data["course_id"],
            title=data["title"],
            order=data["order"],
            pdf_path=data["pdf_path"],
        )

    def delete(self, module_id: int) -> None:
        self._client.table(self.TABLE).delete().eq("id", module_id).execute()


class SupabaseEnrollmentRepository(EnrollmentRepository):
    TABLE = "enrollments"

    def __init__(self) -> None:
        self._client = get_supabase()

    def get_active_enrollment(
        self, user_id: str, course_id: int
    ) -> Optional[Enrollment]:
        try:
            response = (
                self._client.table(self.TABLE)
                .select("*")
                .eq("user_id", user_id)
                .eq("course_id", course_id)
                .eq("is_active", True)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            # Falha ao consultar matrícula: tratamos como erro de infraestrutura
            # e deixamos a camada de aplicação traduzir para um DomainError.
            from app.shared.exceptions import DomainError

            raise DomainError(
                "enrollment_query_failed",
                "Falha ao verificar matrícula do usuário",
                str(exc),
                http_status=500,
            )

        items = None
        if response is None:
            items = []
        elif isinstance(response, dict):
            items = response.get("data") or []
        else:
            items = getattr(response, "data", None) or []

        if not items:
            return None

        data = items[0]
        return Enrollment(
            id=data["id"],
            user_id=data["user_id"],
            course_id=data["course_id"],
            is_active=data["is_active"],
            paid_at=data.get("paid_at"),
        )

    def upsert_enrollment(
        self,
        user_id: str,
        course_id: int,
        is_active: bool,
        paid_at: Optional[str] = None,
    ) -> Enrollment:
        # Estratégia sem depender de constraint unique: tenta buscar e atualizar, senão insere.
        existing = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("user_id", user_id)
            .eq("course_id", course_id)
            .limit(1)
            .execute()
        )
        items = getattr(existing, "data", None) or []
        payload = {
            "user_id": user_id,
            "course_id": course_id,
            "is_active": is_active,
            "paid_at": paid_at,
        }
        if items:
            enrollment_id = items[0]["id"]
            response = (
                self._client.table(self.TABLE)
                .update(payload)
                .eq("id", enrollment_id)
                .execute()
            )
        else:
            response = self._client.table(self.TABLE).insert(payload).execute()

        out_items = getattr(response, "data", None) or []
        row = out_items[0] if out_items else None
        if not row:
            raise RuntimeError("Falha ao persistir matrícula")

        return Enrollment(
            id=row["id"],
            user_id=row["user_id"],
            course_id=row["course_id"],
            is_active=row["is_active"],
            paid_at=row.get("paid_at"),
        )

