from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable, Optional

from app.domain.entities.course import Course, Enrollment, Module
from app.domain.entities.payment import PaymentRequest
from app.domain.entities.user import User


class UserRepository(ABC):
    """Abstração de acesso a usuários."""

    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def upsert_from_supabase(self, supabase_user: dict) -> User:
        """Garante que o usuário exista na base a partir de dados do Supabase."""
        raise NotImplementedError


class CourseRepository(ABC):
    """Abstração de acesso a cursos."""

    @abstractmethod
    def get_by_id(self, course_id: int) -> Optional[Course]:
        raise NotImplementedError

    @abstractmethod
    def list_all(self) -> Iterable[Course]:
        raise NotImplementedError

    @abstractmethod
    def create(self, name: str, description: str, price: float) -> Course:
        """Cria um novo curso."""
        raise NotImplementedError

    @abstractmethod
    def update(self, course: Course) -> Course:
        """Atualiza um curso existente."""
        raise NotImplementedError

    @abstractmethod
    def delete(self, course_id: int) -> None:
        """Remove um curso."""
        raise NotImplementedError


class ModuleRepository(ABC):
    """Abstração de acesso a módulos."""

    @abstractmethod
    def list_by_course(self, course_id: int) -> Iterable[Module]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, module_id: int) -> Optional[Module]:
        raise NotImplementedError

    @abstractmethod
    def create(self, course_id: int, title: str, order: int, pdf_path: str) -> Module:
        """Cria um novo módulo para um curso."""
        raise NotImplementedError

    @abstractmethod
    def update(self, module: Module) -> Module:
        """Atualiza um módulo existente."""
        raise NotImplementedError

    @abstractmethod
    def delete(self, module_id: int) -> None:
        """Remove um módulo."""
        raise NotImplementedError


class EnrollmentRepository(ABC):
    """Abstração de matrícula do aluno no curso."""

    @abstractmethod
    def get_active_enrollment(
        self, user_id: str, course_id: int
    ) -> Optional[Enrollment]:
        raise NotImplementedError

    @abstractmethod
    def upsert_enrollment(
        self,
        user_id: str,
        course_id: int,
        is_active: bool,
        paid_at: Optional[str] = None,
    ) -> Enrollment:
        """Cria ou atualiza matrícula do usuário no curso."""
        raise NotImplementedError


class PaymentRequestRepository(ABC):
    """Abstração de pedidos de validação de pagamento."""

    @abstractmethod
    def create(self, request: PaymentRequest) -> PaymentRequest:
        raise NotImplementedError

    @abstractmethod
    def list_by_user(self, user_id: str, course_id: Optional[int] = None) -> Iterable[PaymentRequest]:
        raise NotImplementedError

    @abstractmethod
    def list_by_status(self, status: str = "pending") -> Iterable[PaymentRequest]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, request_id: int) -> Optional[PaymentRequest]:
        raise NotImplementedError

    @abstractmethod
    def update_status(
        self,
        request_id: int,
        status: str,
        reviewed_by: str,
        note: Optional[str] = None,
    ) -> PaymentRequest:
        raise NotImplementedError

