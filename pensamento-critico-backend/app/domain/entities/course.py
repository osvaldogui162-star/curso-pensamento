from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Course:
    id: int
    name: str
    description: str
    price: float
    created_at: Optional[datetime] = None


@dataclass
class Module:
    id: int
    course_id: int
    title: str
    order: int
    pdf_path: str
    created_at: Optional[datetime] = None


@dataclass
class Enrollment:
    id: int
    user_id: str
    course_id: int
    is_active: bool
    paid_at: Optional[datetime]
    created_at: Optional[datetime] = None

