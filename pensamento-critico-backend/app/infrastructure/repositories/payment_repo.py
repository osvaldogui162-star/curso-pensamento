from __future__ import annotations

from datetime import datetime
from typing import Iterable, List, Optional

from app.domain.entities.payment import PaymentRequest
from app.domain.interfaces.repositories import PaymentRequestRepository
from app.infrastructure.database.supabase_client import new_supabase_service_client


class SupabasePaymentRequestRepository(PaymentRequestRepository):
    TABLE = "payment_requests"

    def __init__(self) -> None:
        self._client = new_supabase_service_client()

    def _row_to_entity(self, row: dict) -> PaymentRequest:
        return PaymentRequest(
            id=row["id"],
            user_id=row["user_id"],
            course_id=row["course_id"],
            method=row["method"],
            status=row.get("status", "pending"),
            amount=row.get("amount"),
            receipt_path=row.get("receipt_path"),
            reference_code=row.get("reference_code"),
            note=row.get("note"),
            reviewed_by=row.get("reviewed_by"),
            reviewed_at=row.get("reviewed_at"),
            created_at=row.get("created_at"),
        )

    def create(self, request: PaymentRequest) -> PaymentRequest:
        payload = {
            "user_id": request.user_id,
            "course_id": request.course_id,
            "method": request.method,
            "status": request.status,
            "amount": request.amount,
            "receipt_path": request.receipt_path,
            "reference_code": request.reference_code,
            "note": request.note,
        }
        response = self._client.table(self.TABLE).insert(payload).execute()
        items = getattr(response, "data", None) or []
        row = items[0] if items else None
        if not row:
            raise RuntimeError("Falha ao criar pedido de pagamento")
        return self._row_to_entity(row)

    def list_by_user(self, user_id: str, course_id: Optional[int] = None) -> Iterable[PaymentRequest]:
        q = self._client.table(self.TABLE).select("*").eq("user_id", user_id).order("created_at", desc=True)
        if course_id is not None:
            q = q.eq("course_id", course_id)
        response = q.execute()
        items = getattr(response, "data", None) or []
        return [self._row_to_entity(r) for r in items]

    def list_by_status(self, status: str = "pending") -> Iterable[PaymentRequest]:
        response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("status", status)
            .order("created_at", desc=True)
            .execute()
        )
        items = getattr(response, "data", None) or []
        return [self._row_to_entity(r) for r in items]

    def get_by_id(self, request_id: int) -> Optional[PaymentRequest]:
        response = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("id", request_id)
            .limit(1)
            .execute()
        )
        items = getattr(response, "data", None) or []
        if not items:
            return None
        return self._row_to_entity(items[0])

    def update_status(
        self,
        request_id: int,
        status: str,
        reviewed_by: str,
        note: Optional[str] = None,
    ) -> PaymentRequest:
        payload = {
            "status": status,
            "reviewed_by": reviewed_by,
            "reviewed_at": datetime.utcnow().isoformat(),
            "note": note,
        }
        response = (
            self._client.table(self.TABLE)
            .update(payload)
            .eq("id", request_id)
            .execute()
        )
        items = getattr(response, "data", None) or []
        row = items[0] if items else None
        if not row:
            raise RuntimeError("Falha ao atualizar pedido de pagamento")
        return self._row_to_entity(row)

