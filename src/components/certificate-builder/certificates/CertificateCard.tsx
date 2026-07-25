'use client';

import Image from 'next/image';
import { Download, Award, Calendar } from 'lucide-react';
import { GeneratedCertificate } from '@/types/certificate';
import { useState } from 'react';

interface CertificateCardProps {
  certificate: GeneratedCertificate;
  onPreview?: (certificate: GeneratedCertificate) => void;
}

export function CertificateCard({ certificate, onPreview }: CertificateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!certificate.finalAsset?.url) return;

    setDownloading(true);
    try {
      const response = await fetch(certificate.finalAsset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        certificate.finalAsset.fileName || `certificate-${certificate.certificateCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className="group relative bg-linear-to-br from-white to-gray-50 border border-gray-200 rounded overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(certificate)}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-primary/10 to-transparent" />

      {/* Certificate preview / thumbnail */}
      <div className="relative h-48 bg-linear-to-br from-amber-50 via-white to-blue-50 overflow-hidden">
        {certificate.metadata?.previewUrl ? (
          <Image
            src={certificate.metadata.previewUrl}
            alt={certificate.courseTitle || certificate.metadata?.courseTitle || 'Certificate'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : certificate.finalAsset?.url ? (
          <Image
            src={certificate.finalAsset.url}
            alt={certificate.courseTitle || certificate.metadata?.courseTitle || 'Certificate'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-100 to-amber-50">
            <Award className="w-20 h-20 text-primary" strokeWidth={1.5} />
          </div>
        )}

        <div
          className={`absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={handleDownload}
            disabled={downloading || !certificate.finalAsset?.url}
            className="bg-white text-gray-900 hover:bg-primary cursor-pointer hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded font-semibold text-sm flex items-center gap-2 shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download Certificate'}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
          Certificate_Code: {certificate.certificateCode}
        </div>

        {/* Course title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary/60 transition-colors">
          {certificate.courseTitle || certificate.metadata?.courseTitle || 'Course Certificate'}
        </h3>

        {/* Issue date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 ">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Issued {certificate.issuedAt ? formatDate(certificate.issuedAt) : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
