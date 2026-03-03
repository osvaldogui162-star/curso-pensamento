from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from app.domain.entities.course import Course
from app.domain.interfaces.repositories import CourseRepository
from app.shared.exceptions import DomainError


@dataclass
class AdminCourseService:
    """Serviço administrativo de cursos.

    SRP: operações de criação, atualização e remoção de cursos (sem HTTP, sem DB direto).
    """

    course_repo: CourseRepository

    def list_courses(self) -> Iterable[Course]:
        return self.course_repo.list_all()

    def create_course(self, name: str, description: str, price: float) -> Course:
        if not name or len(name.strip()) < 2:
            raise DomainError(
                "invalid_course_name",
                "Nome do curso deve ter pelo menos 2 caracteres",
            )
        if price < 0:
            raise DomainError("invalid_course_price", "Preço do curso não pode ser negativo")

        return self.course_repo.create(name=name.strip(), description=description.strip(), price=price)

    def update_course(self, course_id: int, name: str, description: str, price: float) -> Course:
        existing = self.course_repo.get_by_id(course_id)
        if not existing:
            raise DomainError("course_not_found", "Curso não encontrado")

        if not name or len(name.strip()) < 2:
            raise DomainError(
                "invalid_course_name",
                "Nome do curso deve ter pelo menos 2 caracteres",
            )
        if price < 0:
            raise DomainError("invalid_course_price", "Preço do curso não pode ser negativo")

        existing.name = name.strip()
        existing.description = description.strip()
        existing.price = price

        return self.course_repo.update(existing)

    def delete_course(self, course_id: int) -> None:
        existing = self.course_repo.get_by_id(course_id)
        if not existing:
            raise DomainError("course_not_found", "Curso não encontrado")

        self.course_repo.delete(course_id)

