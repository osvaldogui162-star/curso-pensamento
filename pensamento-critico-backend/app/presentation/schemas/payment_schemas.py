from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class PaymentRequestCreateSchema(BaseModel):
    course_id: int = Field(gt=0)
    method: str = Field(pattern="^(receipt_upload|reference)$")
    receipt_path: Optional[str] = Field(default=None, max_length=1000)
    reference_code: Optional[str] = Field(default=None, max_length=120)
    note: Optional[str] = Field(default=None, max_length=500)


class PaymentRequestSchema(BaseModel):
    id: int
    user_id: str
    course_id: int
    method: str
    status: str
    amount: Optional[float] = None
    receipt_path: Optional[str] = None
    reference_code: Optional[str] = None
    note: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: Optional[str] = None


class PaymentReviewSchema(BaseModel):
    note: Optional[str] = Field(default=None, max_length=500)

