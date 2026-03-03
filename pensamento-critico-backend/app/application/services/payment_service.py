from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from app.domain.entities.payment import PaymentRequest
from app.domain.interfaces.repositories import CourseRepository, PaymentRequestRepository
from app.shared.exceptions import DomainError


@dataclass
class PaymentService:
    """Serviço do aluno para submeter pedidos de validação de pagamento."""

    payment_repo: PaymentRequestRepository
    course_repo: CourseRepository

    def list_my_requests(self, user_id: str, course_id: Optional[int] = None) -> Iterable[PaymentRequest]:
        return self.payment_repo.list_by_user(user_id=user_id, course_id=course_id)

    def create_request(
        self,
        user_id: str,
        course_id: int,
        method: str,
        receipt_path: Optional[str] = None,
        reference_code: Optional[str] = None,
        note: Optional[str] = None,
    ) -> PaymentRequest:
        course = self.course_repo.get_by_id(course_id)
        if not course:
            raise DomainError("course_not_found", "Curso não encontrado")

        if method not in ("receipt_upload", "reference"):
            raise DomainError("invalid_payment_method", "Método de pagamento inválido")

        if method == "receipt_upload" and not receipt_path:
            raise DomainError("missing_receipt", "Envie o comprovativo do pagamento")

        if method == "reference" and not reference_code:
            raise DomainError("missing_reference", "Informe a referência do pagamento")

        # Evita duplicar pedidos pendentes para o mesmo curso
        pending = [
            r for r in self.payment_repo.list_by_user(user_id=user_id, course_id=course_id)
            if r.status == "pending"
        ]
        if pending:
            raise DomainError(
                "payment_request_exists",
                "Já existe um pedido de validação pendente para este curso",
                http_status=409,
            )

        req = PaymentRequest(
            id=0,
            user_id=user_id,
            course_id=course_id,
            method=method,  # type: ignore[arg-type]
            status="pending",
            amount=float(course.price),
            receipt_path=receipt_path,
            reference_code=reference_code,
            note=note,
        )
        return self.payment_repo.create(req)

