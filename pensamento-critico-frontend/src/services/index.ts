/**
 * Barrel export dos serviços.
 * Facilita imports: import { authService, courseService } from "@/services"
 */
export { api } from "./api";
export { authService, type IAuthService } from "./auth.service";
export { courseService, type ICourseService } from "./course.service";
export { pdfService, type IPdfService } from "./pdf.service";
export { paymentService, type IPaymentService } from "./payment.service";
export * from "./types/auth.types";
export * from "./types/course.types";
