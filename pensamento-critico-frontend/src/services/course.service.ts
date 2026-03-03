import { api } from "./api";
import type {
  Course,
  CourseCreatePayload,
  CourseUpdatePayload,
  CourseWithModules,
  Module,
  ModuleCreatePayload,
  ModuleUpdatePayload,
} from "./types/course.types";

/**
 * Contrato do serviço de cursos (DIP).
 */
export interface ICourseService {
  list(): Promise<Course[]>;
  getByIdWithModules(id: number): Promise<CourseWithModules>;
  create(payload: CourseCreatePayload): Promise<Course>;
  update(id: number, payload: CourseUpdatePayload): Promise<Course>;
  delete(id: number): Promise<void>;
  adminListModules(courseId: number): Promise<Module[]>;
  adminCreateModule(courseId: number, payload: ModuleCreatePayload): Promise<Module>;
  adminUpdateModule(moduleId: number, payload: ModuleUpdatePayload): Promise<Module>;
  adminDeleteModule(moduleId: number): Promise<void>;
  adminUploadModulePdf(file: File): Promise<{ path: string }>;
}

const COURSES_BASE = "/courses";
const ADMIN_COURSES_BASE = "/admin/courses";

/**
 * Serviço de cursos — única responsabilidade: CRUD de cursos (SRP).
 */
export const courseService: ICourseService = {
  async list() {
    const { data } = await api.get<Course[]>(COURSES_BASE);
    return data;
  },

  async getByIdWithModules(id) {
    const { data } = await api.get<CourseWithModules>(`${COURSES_BASE}/${id}/modules`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post<Course>(ADMIN_COURSES_BASE, payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch<Course>(`${ADMIN_COURSES_BASE}/${id}`, payload);
    return data;
  },

  async delete(id) {
    await api.delete(`${ADMIN_COURSES_BASE}/${id}`);
  },

  async adminListModules(courseId) {
    const { data } = await api.get<Module[]>(`${ADMIN_COURSES_BASE}/${courseId}/modules`);
    return data;
  },

  async adminCreateModule(courseId, payload) {
    const { data } = await api.post<Module>(
      `${ADMIN_COURSES_BASE}/${courseId}/modules`,
      payload,
    );
    return data;
  },

  async adminUpdateModule(moduleId, payload) {
    const { data } = await api.patch<Module>(
      `/admin/modules/${moduleId}`,
      payload,
    );
    return data;
  },

  async adminDeleteModule(moduleId) {
    await api.delete(`/admin/modules/${moduleId}`);
  },

  async adminUploadModulePdf(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ path: string }>(
      "/admin/modules/upload",
      formData,
    );
    return data;
  },
};
