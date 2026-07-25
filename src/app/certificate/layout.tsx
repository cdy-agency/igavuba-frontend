'use client';

import { CertificateBuilderProvider } from '@/components/certificate-builder/context/Certificatebuildercontext';

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return <CertificateBuilderProvider>{children}</CertificateBuilderProvider>;
}
