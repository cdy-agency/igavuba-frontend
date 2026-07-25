import { apiClient } from '@/api/api-client';
import type { CertificateElement } from '@/types/certificate';

function unwrapElement(payload: unknown): CertificateElement {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid element response');
  }

  if ('data' in payload && payload.data) {
    return payload.data as CertificateElement;
  }

  return payload as CertificateElement;
}

export async function addElement(
  templateId: string,
  data: Partial<CertificateElement>,
): Promise<CertificateElement> {
  const response = await apiClient.post(
    `/certificate-templates/${templateId}/elements`,
    data,
  );
  return unwrapElement(response.data);
}

export async function updateElement(
  templateId: string,
  elementId: string,
  updates: Partial<CertificateElement>,
): Promise<CertificateElement> {
  const response = await apiClient.patch(
    `/certificate-templates/${templateId}/elements/${elementId}`,
    updates,
  );
  return unwrapElement(response.data);
}

export async function deleteElement(templateId: string, elementId: string) {
  const response = await apiClient.delete(
    `/certificate-templates/${templateId}/elements/${elementId}`,
  );
  return response.data;
}

export async function reorderElements(templateId: string, elementIds: string[]) {
  const response = await apiClient.put(
    `/certificate-templates/${templateId}/elements/reorder`,
    { elementIds },
  );
  return response.data;
}

export async function updateElementImage(
  templateId: string,
  elementId: string,
  file: File,
): Promise<CertificateElement> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(
    `/certificate-templates/${templateId}/elements/${elementId}/image`,
    formData,
  );
  return unwrapElement(response.data);
}

export const certificateElementApi = {
  addElement,
  updateElement,
  deleteElement,
  reorderElements,
  updateElementImage,
};
