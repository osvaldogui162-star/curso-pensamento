import { api } from "./api";
import type { PaymentRequest, PaymentRequestCreatePayload } from "./types/course.types";

export interface IPaymentService {
  uploadReceipt(file: File): Promise<{ path: string }>;
  createRequest(payload: PaymentRequestCreatePayload): Promise<PaymentRequest>;
  listMyRequests(courseId?: number): Promise<PaymentRequest[]>;
  adminListRequests(status?: string): Promise<PaymentRequest[]>;
  adminApprove(requestId: number, note?: string): Promise<{ enrollment_id: number; is_active: boolean }>;
  adminReject(requestId: number, note?: string): Promise<PaymentRequest>;
}

export const paymentService: IPaymentService = {
  async uploadReceipt(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ path: string }>(
      "/payments/receipts/upload",
      formData,
    );
    return data;
  },

  async createRequest(payload) {
    const { data } = await api.post<PaymentRequest>("/payments/requests", payload);
    return data;
  },

  async listMyRequests(courseId) {
    const { data } = await api.get<PaymentRequest[]>("/payments/requests", {
      params: courseId ? { course_id: courseId } : undefined,
    });
    return data;
  },

  async adminListRequests(status = "pending") {
    const { data } = await api.get<PaymentRequest[]>("/admin/payments/requests", {
      params: { status },
    });
    return data;
  },

  async adminApprove(requestId, note) {
    const { data } = await api.post<{ enrollment_id: number; is_active: boolean }>(
      `/admin/payments/requests/${requestId}/approve`,
      { note },
    );
    return data;
  },

  async adminReject(requestId, note) {
    const { data } = await api.post<PaymentRequest>(
      `/admin/payments/requests/${requestId}/reject`,
      { note },
    );
    return data;
  },
};

