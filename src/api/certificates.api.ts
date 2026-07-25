import { apiClient } from '@/api/api-client';
import type { PaginatedResponse } from '@/types/pagination';
import type { VerifyCertificateResponse } from '@/types/certificate';

import type { CertificateTemplate } from '@/types/certificate';

export type IssuedCertificate = {
  id: string;
  certificateCode: string;
  learnerProfileId: string;
  courseId: string;
  enrollmentId: string;
  institutionId: string;
  learnerName: string;
  courseTitle: string;
  overallGrade: number | null;
  pdfUrl: string | null;
  issuedAt: string;
  revokedAt: string | null;
  verifyUrl: string;
  template?: CertificateTemplate | null;
};

type CertificateListResponse = {
  success: boolean;
  message: string;
  data: IssuedCertificate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type SingleCertificateResponse = {
  success: boolean;
  message: string;
  data: IssuedCertificate | null;
};

export async function getMyCertificates(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<CertificateListResponse>('/certificates/my', {
    params,
  });
  return response.data;
}

export async function getCourseCertificate(courseIdOrSlug: string) {
  const response = await apiClient.get<SingleCertificateResponse>(
    `/certificates/course/${courseIdOrSlug}`,
  );
  return response.data;
}

export async function issueCourseCertificate(courseIdOrSlug: string) {
  const response = await apiClient.post<SingleCertificateResponse>(
    `/certificates/course/${courseIdOrSlug}/issue`,
  );
  return response.data;
}

export async function verifyCertificate(code: string) {
  const response = await apiClient.get<{ success: boolean; data: VerifyCertificateResponse }>(
    `/certificates/verify/${code}`,
  );
  return response.data;
}

export const certificatesApi = {
  getMyCertificates,
  getCourseCertificate,
  issueCourseCertificate,
  verifyCertificate,
};

export type { PaginatedResponse };
