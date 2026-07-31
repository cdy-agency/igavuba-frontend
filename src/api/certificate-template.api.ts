import { apiClient } from '@/api/api-client';
import type {
  Certificate,
  CertificateBackground,
  CertificateTemplate,
  CertificateTemplatesListResponse,
  CreateCertificateTemplateFormData,
  LayoutData,
} from '@/types/certificate';

function unwrapTemplate(payload: unknown): Certificate {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid template response');
  }

  if ('data' in payload && payload.data) {
    return payload.data as Certificate;
  }

  return payload as Certificate;
}

export async function getCertificates(): Promise<CertificateTemplatesListResponse> {
  const response = await apiClient.get<CertificateTemplatesListResponse>(
    '/certificate-templates',
  );
  return response.data;
}

export async function createCertificate(
  data: CreateCertificateTemplateFormData,
): Promise<Certificate> {
  const response = await apiClient.post('/certificate-templates', data);
  return unwrapTemplate(response.data);
}

export async function updateCertificate(
  id: string,
  updates: Partial<Certificate>,
): Promise<Certificate> {
  const response = await apiClient.patch(`/certificate-templates/${id}`, updates);
  return unwrapTemplate(response.data);
}

export async function deleteCertificate(id: string) {
  const response = await apiClient.delete(`/certificate-templates/${id}`);
  return response.data;
}

export async function updateBackground(
  id: string,
  background: CertificateBackground | File,
): Promise<Certificate> {
  if (background instanceof File) {
    const formData = new FormData();
    formData.append('file', background);
    const response = await apiClient.post(
      `/certificate-templates/${id}/background/upload`,
      formData,
    );
    return unwrapTemplate(response.data);
  }

  const response = await apiClient.patch(`/certificate-templates/${id}/background`, background);
  return unwrapTemplate(response.data);
}

export async function deleteBackground(id: string): Promise<Certificate> {
  const response = await apiClient.delete(`/certificate-templates/${id}/background`);
  return unwrapTemplate(response.data);
}

export async function assignTemplateToCourse(templateId: string, courseId: string) {
  const response = await apiClient.post(
    `/certificate-templates/${templateId}/assign-course`,
    { courseId },
  );
  return response.data;
}

export async function applyTemplateToCoursesWithoutCertificate(templateId: string) {
  const response = await apiClient.post(
    `/certificate-templates/${templateId}/set-default`,
  );
  return response.data;
}

export const certificateApi = {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  updateBackground,
  deleteBackground,
  assignTemplateToCourse,
  applyTemplateToCoursesWithoutCertificate,
};

export type { CertificateTemplate, LayoutData };
