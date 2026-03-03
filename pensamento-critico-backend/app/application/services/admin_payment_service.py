from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, Optional

from app.domain.interfaces.repositories import EnrollmentRepository, PaymentRequestRepository
from app.shared.exceptions import DomainError


@dataclass
class AdminPaymentService:
    """Serviço administrativo para análise de pagamentos."""

    payment_repo: PaymentRequestRepository
    enrollment_repo: EnrollmentRepository

    def list_requests(self, status: str = "pending") -> Iterable:
        return self.payment_repo.list_by_status(status=status)

    def approve(self, request_id: int, admin_user_id: str, note: Optional[str] = None):
        req = self.payment_repo.get_by_id(request_id)
        if not req:
            raise DomainError("payment_request_not_found", "Pedido de pagamento não encontrado")
        if req.status != "pending":
            raise DomainError("payment_request_not_pending", "Pedido já foi analisado")

        self.payment_repo.update_status(
            request_id=request_id,
            status="approved",
            reviewed_by=admin_user_id,
            note=note,
        )

        paid_at = datetime.utcnow().isoformat()
        enrollment = self.enrollment_repo.upsert_enrollment(
            user_id=req.user_id,
            course_id=req.course_id,
            is_active=True,
            paid_at=paid_at,
        )
        return enrollment

    def reject(self, request_id: int, admin_user_id: str, note: Optional[str] = None):
        req = self.payment_repo.get_by_id(request_id)
        if not req:
            raise DomainError("payment_request_not_found", "Pedido de pagamento não encontrado")
        if req.status != "pending":
            raise DomainError("payment_request_not_pending", "Pedido já foi analisado")

        return self.payment_repo.update_status(
            request_id=request_id,
            status="rejected",
            reviewed_by=admin_user_id,
            note=note,
        )

