from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class CourseSchema(BaseModel):
    id: int
    name: str
    description: str
    price: float


class CourseCreateSchema(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=0, max_length=4_000)
    price: float = Field(ge=0)


class CourseUpdateSchema(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=0, max_length=4_000)
    price: float = Field(ge=0)


class ModuleSchema(BaseModel):
    id: int
    course_id: int
    title: str
    order: int
    # Caminho relativo no Supabase Storage para o PDF
    pdf_path: str


class ModuleCreateSchema(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    order: int = Field(ge=1)
    pdf_path: str = Field(min_length=1, max_length=1_000)


class ModuleUpdateSchema(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    order: int = Field(ge=1)
    pdf_path: str = Field(min_length=1, max_length=1_000)


class CourseWithModulesSchema(BaseModel):
    course: CourseSchema
    modules: List[ModuleSchema]

