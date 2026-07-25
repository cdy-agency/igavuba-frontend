import { Metadata } from 'next';
import type { VerifyCertificateResponse } from '@/types/certificate';
import CertificateVerificationClient from './CertificateVerificationClient';

type Props = {
  params: Promise<{ certificateCode: string }>;
};

async function fetchCertificate(
  code: string,
): Promise<VerifyCertificateResponse | null> {
  const apiUrl = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/certificates/verify/${code}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return (payload?.data ?? payload) as VerifyCertificateResponse;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certificateCode } = await params;
  const cert = await fetchCertificate(certificateCode);

  if (!cert) {
    return { title: 'Certificate Verification' };
  }

  const verifyUrl = `/certificate/verify/${certificateCode}`;
  const title = `${cert.learnerName} earned a certificate in ${cert.courseTitle}`;
  const description = `Verified certificate issued by ${cert.institutionName ?? 'Iga Vuba'}. Click to verify authenticity.`;

  return {
    title,
    description,
    alternates: {
      canonical: verifyUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: verifyUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CertificateVerificationPage({ params }: Props) {
  await params;
  return <CertificateVerificationClient />;
}
