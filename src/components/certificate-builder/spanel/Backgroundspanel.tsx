'use client';

import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Certificate, CertificateBackground } from '@/types/certificate';
import Image from 'next/image';

interface BackgroundsPanelProps {
  selectedCertificate: Certificate | null;
  selectedBackground?: CertificateBackground;
  onUploadBackground: (file: File) => Promise<void>;
  onDeleteBackground: () => Promise<void>;
  disabled?: boolean;
}

export function BackgroundsPanel({
  selectedCertificate,
  onUploadBackground,
  onDeleteBackground,
  disabled = false,
}: BackgroundsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setIsUploading(true);
      try {
        await onUploadBackground(file);
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleDelete = async () => {
    if (disabled) return;

    setIsDeleting(true);
    try {
      await onDeleteBackground();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          BACKGROUND IMAGE
        </h3>

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <p className="text-xs text-gray-500 text-center mb-4">
          We recommend images with 1600 × 1050 px or higher (max 5MB)
        </p>

        {/* Current Certificate Background */}
        {selectedCertificate && (
          <div className="space-y-2 mt-4">
            {(() => {
              const certBackground = selectedCertificate.layoutData;
              const hasImageBackground = certBackground?.type === 'image' && certBackground?.value;

              return (
                <div className="relative group border border-gray-200 overflow-hidden">
                  {/* Certificate Preview */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {certBackground?.type === 'image' && certBackground.value ? (
                      <Image
                        src={certBackground.value}
                        alt={selectedCertificate.title}
                        width={280}
                        height={210}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            certBackground?.type === 'color' ? certBackground.value : '#FFFFFF',
                        }}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">📄</div>
                          <span className="text-xs text-gray-500">
                            {certBackground?.type === 'color'
                              ? 'Color Background'
                              : 'No Background'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Delete button - show if there's an image background */}
                    {hasImageBackground && (
                      <button
                        onClick={handleDelete}
                        disabled={disabled || isDeleting}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-all disabled:opacity-50"
                        title="Remove background"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
