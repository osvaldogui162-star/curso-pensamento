from __future__ import annotations

from dataclasses import replace
from typing import Iterable, List, Optional

import pytest

from app.application.services.admin_payment_service import AdminPaymentService
from app.application.services.payment_service import PaymentService
from app.domain.entities.course import Course, Enrollment
from app.domain.entities.payment import PaymentRequest
from app.domain.interfaces.repositories import CourseRepository, EnrollmentRepository, PaymentRequestRepository
from app.shared.exceptions import DomainError


class InMemoryCourseRepo(CourseRepository):
    def __init__(self, courses: Optional[List[Course]] = None) -> None:
        self._courses = courses or []

    def get_by_id(self, course_id: int) -> Optional[Course]:
        for c in self._courses:
            if c.id == course_id:
                return c
        return None

    def list_all(self) -> Iterable[Course]:
        return list(self._courses)

    def create(self, name: str, description: str, price: float) -> Course:  # pragma: no cover
        raise NotImplementedError

    def update(self, course: Course) -> Course:  # pragma: no cover
        raise NotImplementedError

    def delete(self, course_id: int) -> None:  # pragma: no cover
        raise NotImplementedError


class InMemoryPaymentRepo(PaymentRequestRepository):
    def __init__(self) -> None:
        self._items: List[PaymentRequest] = []
        self._next_id = 1

    def create(self, request: PaymentRequest) -> PaymentRequest:
        created = replace(request, id=self._next_id)
        self._next_id += 1
        self._items.append(created)
        return created

    def list_by_user(self, user_id: str, course_id: Optional[int] = None) -> Iterable[PaymentRequest]:
        items = [r for r in self._items if r.user_id == user_id]
        if course_id is not None:
            items = [r for r in items if r.course_id == course_id]
        return list(items)

    def list_by_status(self, status: str = "pending") -> Iterable[PaymentRequest]:
        return [r for r in self._items if r.status == status]

    def get_by_id(self, request_id: int) -> Optional[PaymentRequest]:
        for r in self._items:
            if r.id == request_id:
                return r
        return None

    def update_status(self, request_id: int, status: str, reviewed_by: str, note: Optional[str] = None) -> PaymentRequest:
        for idx, r in enumerate(self._items):
            if r.id == request_id:
                updated = replace(r, status=status, reviewed_by=reviewed_by, note=note)
                self._items[idx] = updated
                return updated
        raise RuntimeError("not_found")


class InMemoryEnrollmentRepo(EnrollmentRepository):
    def __init__(self) -> None:
        self._items: List[Enrollment] = []
        self._next_id = 1

    def get_active_enrollment(self, user_id: str, course_id: int) -> Optional[Enrollment]:
        for e in self._items:
            if e.user_id == user_id and e.course_id == course_id and e.is_active:
                return e
        return None

    def upsert_enrollment(self, user_id: str, course_id: int, is_active: bool, paid_at: Optional[str] = None) -> Enrollment:
        for idx, e in enumerate(self._items):
            if e.user_id == user_id and e.course_id == course_id:
                updated = Enrollment(id=e.id, user_id=user_id, course_id=course_id, is_active=is_active, paid_at=paid_at)
                self._items[idx] = updated
                return updated
        created = Enrollment(id=self._next_id, user_id=user_id, course_id=course_id, is_active=is_active, paid_at=paid_at)
        self._next_id += 1
        self._items.append(created)
        return created


def test_student_creates_receipt_request_success():
    courses = [Course(id=1, name="Curso", description="Desc", price=150.0)]
    service = PaymentService(payment_repo=InMemoryPaymentRepo(), course_repo=InMemoryCourseRepo(courses=courses))

    req = service.create_request(
        user_id="u1",
        course_id=1,
        method="receipt_upload",
        receipt_path="receipts/u1/x.pdf",
    )

    assert req.id == 1
    assert req.status == "pending"
    assert req.amount == 150.0


def test_student_cannot_create_duplicate_pending_request():
    courses = [Course(id=1, name="Curso", description="Desc", price=150.0)]
    repo = InMemoryPaymentRepo()
    service = PaymentService(payment_repo=repo, course_repo=InMemoryCourseRepo(courses=courses))

    service.create_request(user_id="u1", course_id=1, method="reference", reference_code="REF-1")
    with pytest.raises(DomainError) as excinfo:
        service.create_request(user_id="u1", course_id=1, method="reference", reference_code="REF-2")

    assert excinfo.value.code == "payment_request_exists"
    assert excinfo.value.http_status == 409


def test_admin_approves_and_activates_enrollment():
    payment_repo = InMemoryPaymentRepo()
    enrollment_repo = InMemoryEnrollmentRepo()
    admin = AdminPaymentService(payment_repo=payment_repo, enrollment_repo=enrollment_repo)

    req = payment_repo.create(
        PaymentRequest(
            id=0,
            user_id="u1",
            course_id=10,
            method="reference",
            status="pending",
            reference_code="REF-10",
        )
    )

    enrollment = admin.approve(request_id=req.id, admin_user_id="admin1")

    assert enrollment.user_id == "u1"
    assert enrollment.course_id == 10
    assert enrollment.is_active is True


def test_admin_cannot_approve_twice():
    payment_repo = InMemoryPaymentRepo()
    enrollment_repo = InMemoryEnrollmentRepo()
    admin = AdminPaymentService(payment_repo=payment_repo, enrollment_repo=enrollment_repo)

    req = payment_repo.create(
        PaymentRequest(
            id=0,
            user_id="u1",
            course_id=10,
            method="reference",
            status="pending",
            reference_code="REF-10",
        )
    )
    admin.approve(request_id=req.id, admin_user_id="admin1")

    with pytest.raises(DomainError) as excinfo:
        admin.approve(request_id=req.id, admin_user_id="admin1")

    assert excinfo.value.code == "payment_request_not_pending"

