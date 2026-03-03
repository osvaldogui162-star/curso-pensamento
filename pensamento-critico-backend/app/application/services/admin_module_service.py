from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from app.domain.entities.course import Module
from app.domain.interfaces.repositories import ModuleRepository
from app.shared.exceptions import DomainError


@dataclass
class AdminModuleService:
    """Serviço administrativo de módulos.

    SRP: operações de criação, atualização e remoção de módulos de curso.
    """

    module_repo: ModuleRepository

    def list_modules(self, course_id: int) -> Iterable[Module]:
        return self.module_repo.list_by_course(course_id)

    def create_module(self, course_id: int, title: str, order: int, pdf_path: str) -> Module:
        if not title or len(title.strip()) < 2:
            raise DomainError(
                "invalid_module_title",
                "Título do módulo deve ter pelo menos 2 caracteres",
            )
        if order < 1:
            raise DomainError("invalid_module_order", "Ordem do módulo deve ser maior ou igual a 1")
        if not pdf_path:
            raise DomainError("invalid_module_pdf", "Caminho do PDF do módulo é obrigatório")

        return self.module_repo.create(
            course_id=course_id,
            title=title.strip(),
            order=order,
            pdf_path=pdf_path.strip(),
        )

    def update_module(self, module_id: int, title: str, order: int, pdf_path: str) -> Module:
        existing = self.module_repo.get_by_id(module_id)
        if not existing:
            raise DomainError("module_not_found", "Módulo não encontrado")

        if not title or len(title.strip()) < 2:
            raise DomainError(
                "invalid_module_title",
                "Título do módulo deve ter pelo menos 2 caracteres",
            )
        if order < 1:
            raise DomainError("invalid_module_order", "Ordem do módulo deve ser maior ou igual a 1")
        if not pdf_path:
            raise DomainError("invalid_module_pdf", "Caminho do PDF do módulo é obrigatório")

        existing.title = title.strip()
        existing.order = order
        existing.pdf_path = pdf_path.strip()

        return self.module_repo.update(existing)

    def delete_module(self, module_id: int) -> None:
        existing = self.module_repo.get_by_id(module_id)
        if not existing:
            raise DomainError("module_not_found", "Módulo não encontrado")

        self.module_repo.delete(module_id)

