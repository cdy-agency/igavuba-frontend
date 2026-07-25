'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Share2, Loader2, Award } from 'lucide-react';
import { toast } from '@/lib/toast';
import { GeneratedCertificate } from '@/types/certificate';
import { Button } from '@/components/ui/button';

interface CertificateModalProps {
  certificate: GeneratedCertificate | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export function CertificateModal({
  certificate,
  isOpen,
  onClose,
  isLoading,
}: CertificateModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) setImageError(false);
  }, [isOpen, certificate?.id]);

  if (!isOpen) return null;

  const getPreviewUrl = () => {
    if (!certificate || !certificate.metadata) return null;
    return (certificate.metadata as { previewUrl?: string }).previewUrl || null;
  };

  const previewUrl = getPreviewUrl();

  const handleDownload = async () => {
    if (!certificate?.finalAsset?.url) return;

    try {
      setIsDownloading(true);

      const response = await fetch(certificate.finalAsset.url);

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download =
        certificate.finalAsset.fileName || `certificate-${certificate.certificateCode}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast.success('Download Started', 'Your certificate is being downloaded');
    } catch {
      toast.error('Download Failed', 'Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareToLinkedIn = async () => {
    try {
      setIsSharing(true);

      const verificationUrl = `${window.location.origin}/certificate/verify/${certificate?.certificateCode}`;

      const linkedInShareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
      linkedInShareUrl.searchParams.set('url', verificationUrl);

      window.open(linkedInShareUrl.toString(), '_blank', 'width=600,height=600');

      toast.success('Opening LinkedIn', 'Share your achievement with your network!');
    } catch {
      toast.error('Share Failed', 'Failed to open LinkedIn share dialog');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 text-destructive hover:text-destructive/70 cursor-pointer transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : certificate && previewUrl ? (
            <div className="space-y-6">
              {/* Certificate Image Preview */}
              <div className="bg-gray-50 dark:bg-gray-900 border">
                <div className="h-[70vh] overflow-auto flex justify-center">
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                      <svg
                        className="h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Failed to load certificate preview.
                        <br />
                        You can still download the PDF below.
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-275 max-w-none">
                      <Image
                        src={previewUrl}
                        alt="Certificate Preview"
                        width={900}
                        height={200}
                        className="shadow-lg"
                        onError={() => setImageError(true)}
                        priority
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : certificate ? (
            <div className="text-center py-20">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Certificate preview not available
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                You can still download the PDF using the button below
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400">Certificate not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {certificate && (
          <div className="border-t border-gray-200 px-20 py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download PDF
                  </>
                )}
              </Button>

              <Button
                onClick={handleShareToLinkedIn}
                disabled={isSharing}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" />
                    Share on LinkedIn
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
