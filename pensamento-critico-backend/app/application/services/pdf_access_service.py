from __future__ import annotations

from dataclasses import dataclass

from app.domain.interfaces.repositories import (
    EnrollmentRepository,
    ModuleRepository,
)
from app.infrastructure.database.supabase_client import get_supabase
from app.shared.exceptions import DomainError


@dataclass
class SignedPdfUrl:
    url: str
    expires_in: int


class PdfAccessService:
    """Serviço responsável por liberar acesso a PDFs de módulos.

    SRP: verificar matrícula e gerar URL temporária no Supabase Storage.
    """

    def __init__(
        self,
        module_repo: ModuleRepository,
        enrollment_repo: EnrollmentRepository,
        bucket: str = "course_pdfs",
        expires_in: int = 600,
    ) -> None:
        self._module_repo = module_repo
        self._enrollment_repo = enrollment_repo
        self._bucket = bucket
        self._expires_in = expires_in
        self._supabase = get_supabase()

    def get_signed_url(self, user_id: str, module_id: int) -> SignedPdfUrl:
        module = self._module_repo.get_by_id(module_id)
        if not module:
            raise DomainError("module_not_found", "Módulo não encontrado")

        enrollment = self._enrollment_repo.get_active_enrollment(
            user_id=user_id, course_id=module.course_id
        )
        if not enrollment or not enrollment.is_active:
            raise DomainError(
                "enrollment_not_found",
                "Você não possui acesso ativo a este curso",
                http_status=403,
            )

        storage = self._supabase.storage.from_(self._bucket)
        result = storage.create_signed_url(
            path=module.pdf_path,
            expires_in=self._expires_in,
        )

        signed_url = result.get("signedURL") or result.get("signed_url")
        if not signed_url:
            raise DomainError("pdf_url_error", "Não foi possível gerar URL do PDF")
 
        return SignedPdfUrl(url=signed_url, expires_in=self._expires_in)

