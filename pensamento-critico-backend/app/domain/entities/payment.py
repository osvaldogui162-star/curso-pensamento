from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


PaymentMethod = Literal["receipt_upload", "reference"]
PaymentStatus = Literal["pending", "approved", "rejected"]


@dataclass
class PaymentRequest:
    """Pedido de validação de pagamento.

    Criado pelo aluno e aprovado/rejeitado por um admin.
    """

    id: int
    user_id: str
    course_id: int
    method: PaymentMethod
    status: PaymentStatus = "pending"
    amount: Optional[float] = None
    receipt_path: Optional[str] = None
    reference_code: Optional[str] = None
    note: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

