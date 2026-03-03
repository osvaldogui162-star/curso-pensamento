from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Iterable, List

from app.domain.entities.course import Course, Module
from app.domain.interfaces.repositories import (
    CourseRepository,
    ModuleRepository,
)


@dataclass
class CourseWithModules:
    course: Course
    modules: List[Module]


class CourseService:
    """Serviço de cursos.

    SRP: regras de negócio relacionadas a cursos e módulos (sem HTTP, sem DB direto).
    """

    def __init__(
        self,
        course_repo: CourseRepository,
        module_repo: ModuleRepository,
    ) -> None:
        self._course_repo = course_repo
        self._module_repo = module_repo

    def list_courses(self) -> Iterable[dict]:
        courses = self._course_repo.list_all()
        return [asdict(c) for c in courses]

    def get_course_with_modules(self, course_id: int) -> CourseWithModules:
        course = self._course_repo.get_by_id(course_id)
        if not course:
            from app.shared.exceptions import DomainError

            raise DomainError("course_not_found", "Curso não encontrado")

        modules = list(self._module_repo.list_by_course(course_id))
        return CourseWithModules(course=course, modules=modules) 

