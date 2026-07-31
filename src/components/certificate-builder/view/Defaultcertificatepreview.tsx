'use client';

import React from 'react';
import Image from 'next/image';
import { CertificateTemplate, CertificateElementType, CertificateElement } from '@/types/certificate';
import { Edit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TEXT_PLACEHOLDERS } from '@/utils/certificate-template';

interface DefaultCertificatePreviewProps {
  certificate: CertificateTemplate;
  onApplyDefault: () => void;
  isApplying: boolean;
}

export function DefaultCertificatePreview({
  certificate,
  onApplyDefault,
  isApplying,
}: DefaultCertificatePreviewProps) {
  const layoutData = certificate.layoutData;
  const orientation = certificate.orientation;

  const maxWidth = 900;
  const maxHeight = 600;
  const aspectRatio = layoutData.size.width / layoutData.size.height;

  let displayWidth = maxWidth;
  let displayHeight = maxWidth / aspectRatio;

  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * aspectRatio;
  }

  const getCurrentDate = (format?: string) => {
    const date = new Date();
    if (format === 'short') {
      return date.toLocaleDateString();
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderElement = (element: CertificateElement, scale: number) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: element.textStyle?.fontFamily || 'Montserrat',
      fontSize: `${(element.textStyle?.fontSize || 14) * scale}px`,
      fontWeight: element.textStyle?.fontWeight || 'normal',
      fontStyle: element.textStyle?.fontStyle || 'normal',
      color: element.textStyle?.color || '#000000',
      textAlign: element.textStyle?.textAlign ?? 'center',
    };

    if (element.type in TEXT_PLACEHOLDERS) {
      const value =
        element.type === CertificateElementType.DATE
          ? getCurrentDate(element.dateFormat)
          : element.value || TEXT_PLACEHOLDERS[element.type];

      return (
        <div className="w-full h-full flex items-center justify-center" style={baseStyle}>
          {value}
        </div>
      );
    }

    if (element.type === CertificateElementType.IMAGE) {
      return element.value ? (
        <Image src={element.value} alt="Element" fill className="object-contain" />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
          Image
        </div>
      );
    }

    if (element.type === CertificateElementType.QR_CODE) {
      const qrData = element.value || `https://certificate.example.com/${element.id}`;
      const width = element.size.width * scale;
      const height = element.size.height * scale;
      // Use minimum dimension to match certificate output (QR codes are square)
      const qrSize = Math.min(width, height);

      return (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=${Math.floor(qrSize)}x${Math.floor(qrSize)}&data=${encodeURIComponent(qrData)}`}
            alt="QR Code"
            width={qrSize}
            height={qrSize}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (element.type === CertificateElementType.SHAPE) {
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: element.fillColor || '#9ca3af',
            borderRadius: element.borderRadius ? `${element.borderRadius * scale}px` : undefined,
            border: element.borderWidth
              ? `${element.borderWidth * scale}px solid ${element.borderColor || '#000'}`
              : undefined,
          }}
        />
      );
    }

    // ⚠️ Should never happen (dev warning)
    return (
      <div className="w-full h-full bg-red-50 text-red-600 text-xs flex items-center justify-center">
        Unsupported element: {element.type}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-20 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-5 px-20">
          <div>
            <h3 className="text-foreground font-extrabold">Default certificate</h3>
            <p className="text-muted-foreground text-lg font-medium">
              Your students will get this default certificate in all courses where you did not
              assign the specific certificate
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">{certificate.title}</h3>
              <p className="text-[12px] text-muted-foreground mt-1">
                Orientation: {orientation} | Size: {layoutData.size.width} x{' '}
                {layoutData.size.height}px
              </p>
            </div>

            <div className="flex items-center gap-5">
              <Button
                onClick={onApplyDefault}
                disabled={isApplying}
                className="text-sm text-nowrap bg-transparent hover:bg-gray-50 font-bold cursor-pointer text-muted-foreground hover:text-blue-700 disabled:text-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Setting...</span>
                  </>
                ) : (
                  <span>Set as Default</span>
                )}
              </Button>

              <Link
                href="/certificate/builder"
                className="font-medium cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2 px-4 py-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit in Builder</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-8 flex items-center justify-center">
        <div
          className="bg-white border border-gray-200 relative"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        >
          {layoutData.type === 'image' && layoutData.value ? (
            <Image
              src={layoutData.value}
              alt="Certificate Background"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: layoutData.type === 'color' ? layoutData.value : '#FFFFFF',
              }}
            />
          )}

          <div className="absolute inset-0 p-8">
            {layoutData.elements.map((element) => {
              const scale = displayWidth / layoutData.size.width;

              return (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: `${element.position.x * scale}px`,
                    top: `${element.position.y * scale}px`,
                    width: `${element.size.width * scale}px`,
                    height: `${element.size.height * scale}px`,
                    zIndex: element.zIndex || 1,
                    opacity: element.opacity !== undefined ? element.opacity : 1,
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
                  }}
                >
                  {renderElement(element, scale)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
