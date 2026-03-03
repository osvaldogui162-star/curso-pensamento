from __future__ import annotations

from typing import Iterable, List, Optional

import pytest

from app.application.services.course_service import CourseService
from app.domain.entities.course import Course, Module
from app.domain.interfaces.repositories import CourseRepository, ModuleRepository
from app.shared.exceptions import DomainError


class InMemoryCourseRepository(CourseRepository):
    def __init__(self, courses: Optional[List[Course]] = None) -> None:
        self._courses = courses or []

    def get_by_id(self, course_id: int) -> Optional[Course]:
        for c in self._courses:
            if c.id == course_id:
                return c
        return None

    def list_all(self) -> Iterable[Course]:
        return list(self._courses)


class InMemoryModuleRepository(ModuleRepository):
    def __init__(self, modules: Optional[List[Module]] = None) -> None:
        self._modules = modules or []

    def list_by_course(self, course_id: int) -> Iterable[Module]:
        return [m for m in self._modules if m.course_id == course_id]

    def get_by_id(self, module_id: int) -> Optional[Module]:
        for m in self._modules:
            if m.id == module_id:
                return m
        return None


def _make_service(
    courses: Optional[List[Course]] = None,
    modules: Optional[List[Module]] = None,
) -> CourseService:
    course_repo = InMemoryCourseRepository(courses=courses)
    module_repo = InMemoryModuleRepository(modules=modules)
    return CourseService(course_repo=course_repo, module_repo=module_repo)


def test_list_courses_returns_plain_dicts():
    courses = [
        Course(id=1, name="Pensamento Crítico", description="Curso principal", price=150000.0),
        Course(id=2, name="Outro Curso", description="Secundário", price=50000.0),
    ]
    service = _make_service(courses=courses)

    result = list(service.list_courses())

    assert len(result) == 2
    assert result[0]["id"] == 1
    assert result[0]["name"] == "Pensamento Crítico"
    assert result[0]["price"] == 150000.0


def test_get_course_with_modules_raises_domain_error_when_course_not_found():
    service = _make_service(courses=[], modules=[])

    with pytest.raises(DomainError) as excinfo:
        service.get_course_with_modules(course_id=999)

    error = excinfo.value
    assert error.code == "course_not_found"
    assert "Curso não encontrado" in error.message


def test_get_course_with_modules_returns_course_and_modules():
    course = Course(
        id=1,
        name="Pensamento Crítico",
        description="Curso principal",
        price=150000.0,
    )
    modules = [
        Module(id=1, course_id=1, title="Módulo 1", order=1, pdf_path="mod1.pdf"),
        Module(id=2, course_id=1, title="Módulo 2", order=2, pdf_path="mod2.pdf"),
        Module(id=3, course_id=2, title="Outro curso", order=1, pdf_path="outro.pdf"),
    ]

    service = _make_service(courses=[course], modules=modules)

    result = service.get_course_with_modules(course_id=1)

    assert result.course.id == 1
    assert result.course.name == "Pensamento Crítico"
    assert len(result.modules) == 2
    titles = {m.title for m in result.modules}
    assert titles == {"Módulo 1", "Módulo 2"}

