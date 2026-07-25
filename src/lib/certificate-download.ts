import { apiClient } from '@/api/api-client';
import {
  exportCertificateElementToPdf,
  exportCertificatePreviewToPdf,
} from '@/lib/certificate-pdf-export';
import type { CertificateTemplate } from '@/types/certificate';
import type { IssuedCertificateContext } from '@/utils/certificate-template';

type VerifyDownloadPayload = {
  pdfUrl?: string | null;
  certificateCode?: string;
};

export async function downloadCertificateByCode(
  code: string,
  options?: {
    previewElement?: HTMLElement | null;
    template?: CertificateTemplate;
    context?: IssuedCertificateContext;
    fileName?: string;
  },
) {
  const response = await apiClient.get<{ data?: VerifyDownloadPayload }>(
    `/certificates/verify/${code}`,
  );
  const payload = response.data?.data;

  if (payload?.pdfUrl) {
    window.open(payload.pdfUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const fileName = options?.fileName ?? `certificate-${code}.pdf`;

  if (options?.template && options?.context) {
    await exportCertificatePreviewToPdf({
      template: options.template,
      context: options.context,
      fileName,
    });
    return;
  }

  if (options?.previewElement) {
    await exportCertificateElementToPdf(options.previewElement, fileName);
    return;
  }

  throw new Error('Certificate PDF is not available yet');
}
