from __future__ import annotations

from typing import Iterable, List, Optional

import pytest

from app.application.services.admin_course_service import AdminCourseService
from app.domain.entities.course import Course
from app.domain.interfaces.repositories import CourseRepository
from app.shared.exceptions import DomainError


class InMemoryCourseRepository(CourseRepository):
    def __init__(self, initial: Optional[List[Course]] = None) -> None:
        self._items: List[Course] = initial or []
        self._next_id = max([c.id for c in self._items], default=0) + 1

    def get_by_id(self, course_id: int) -> Optional[Course]:
        for c in self._items:
            if c.id == course_id:
                return c
        return None

    def list_all(self) -> Iterable[Course]:
        return list(self._items)

    def create(self, name: str, description: str, price: float) -> Course:
        course = Course(id=self._next_id, name=name, description=description, price=price)
        self._next_id += 1
        self._items.append(course)
        return course

    def update(self, course: Course) -> Course:
        for idx, existing in enumerate(self._items):
            if existing.id == course.id:
                self._items[idx] = course
                return course
        raise RuntimeError("course_not_found_in_repo")

    def delete(self, course_id: int) -> None:
        self._items = [c for c in self._items if c.id != course_id]


def _make_service(initial: Optional[List[Course]] = None) -> AdminCourseService:
    repo = InMemoryCourseRepository(initial=initial)
    return AdminCourseService(course_repo=repo)


def test_create_course_success():
    service = _make_service()

    course = service.create_course(
        name="Novo Curso",
        description="Descrição do curso",
        price=100.0,
    )

    assert course.id == 1
    assert course.name == "Novo Curso"
    assert course.price == 100.0


def test_create_course_invalid_name_raises_domain_error():
    service = _make_service()

    with pytest.raises(DomainError) as excinfo:
        service.create_course(name="A", description="desc", price=10.0)

    assert excinfo.value.code == "invalid_course_name"


def test_create_course_negative_price_raises_domain_error():
    service = _make_service()

    with pytest.raises(DomainError) as excinfo:
        service.create_course(name="Curso válido", description="desc", price=-1.0)

    assert excinfo.value.code == "invalid_course_price"


def test_update_course_success():
    existing = Course(id=1, name="Antigo", description="Desc antiga", price=50.0)
    service = _make_service(initial=[existing])

    updated = service.update_course(
        course_id=1,
        name="Atualizado",
        description="Nova descrição",
        price=75.0,
    )

    assert updated.id == 1
    assert updated.name == "Atualizado"
    assert updated.price == 75.0


def test_update_course_not_found_raises_domain_error():
    service = _make_service()

    with pytest.raises(DomainError) as excinfo:
        service.update_course(course_id=999, name="X", description="Y", price=10.0)

    assert excinfo.value.code == "course_not_found"


def test_delete_course_success():
    existing = Course(id=1, name="Curso", description="Desc", price=50.0)
    service = _make_service(initial=[existing])

    service.delete_course(course_id=1)

    assert list(service.list_courses()) == []


def test_delete_course_not_found_raises_domain_error():
    service = _make_service()

    with pytest.raises(DomainError) as excinfo:
        service.delete_course(course_id=999)

    assert excinfo.value.code == "course_not_found"

