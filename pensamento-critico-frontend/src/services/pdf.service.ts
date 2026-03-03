import { api } from "./api";

export interface SignedPdfResponse {
  signed_url: string;
  expires_in: number;
}

export interface IPdfService {
  getModulePdf(moduleId: number): Promise<SignedPdfResponse>;
}

export const pdfService: IPdfService = {
  async getModulePdf(moduleId) {
    const { data } = await api.get<SignedPdfResponse>(`/modules/${moduleId}/pdf`);
    return data;
  },
};

