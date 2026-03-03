/**
 * Tipos de domínio para cursos, alinhados ao backend Flask.
 */
export interface Course {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  order: number;
  pdf_path: string;
}

export interface CourseWithModules {
  course: Course;
  modules: Module[];
}

export interface CourseCreatePayload {
  name: string;
  description: string;
  price: number;
}

export interface CourseUpdatePayload extends Partial<CourseCreatePayload> {}

export interface ModuleCreatePayload {
  title: string;
  order: number;
  pdf_path: string;
}

export interface ModuleUpdatePayload extends ModuleCreatePayload {}

export interface PaymentRequest {
  id: number;
  user_id: string;
  course_id: number;
  method: "receipt_upload" | "reference";
  status: "pending" | "approved" | "rejected";
  amount?: number | null;
  receipt_path?: string | null;
  reference_code?: string | null;
  note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
}

export interface PaymentRequestCreatePayload {
  course_id: number;
  method: "receipt_upload" | "reference";
  receipt_path?: string;
  reference_code?: string;
  note?: string;
}
