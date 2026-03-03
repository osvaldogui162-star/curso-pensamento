"use client";

import { useCallback, useState } from "react";
import { courseService } from "@/services";
import type { Course, CourseCreatePayload, CourseUpdatePayload } from "@/services/types/course.types";

type LoadingState = "idle" | "loading" | "error";

/**
 * Hook para listagem e criação de cursos.
 * Encapsula estado de loading/erro e delega para courseService (SRP).
 */
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await courseService.list();
      setCourses(data);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar cursos");
      setStatus("error");
    }
  }, []);

  const createCourse = useCallback(async (payload: CourseCreatePayload) => {
    setError(null);
    try {
      const created = await courseService.create(payload);
      setCourses((prev) => [...prev, created]);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar curso");
      throw e;
    }
  }, []);

  const updateCourse = useCallback(async (id: number, payload: CourseUpdatePayload) => {
    setError(null);
    try {
      const updated = await courseService.update(id, payload);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar curso");
      throw e;
    }
  }, []);

  const deleteCourse = useCallback(async (id: number) => {
    setError(null);
    try {
      await courseService.delete(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao remover curso");
      throw e;
    }
  }, []);

  return { courses, status, error, fetchCourses, createCourse, updateCourse, deleteCourse };
}
