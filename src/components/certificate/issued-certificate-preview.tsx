'use client';

import { forwardRef } from 'react';
import type { CertificateElement, CertificateTemplate } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import type { DocumentOrientation } from '@/types/enum';
import {
  normalizeCertificateElement,
  normalizeLayoutData,
  resolveIssuedCertificateElementValue,
  resolveIssuedCertificateQrValue,
  type IssuedCertificateContext,
} from '@/utils/certificate-template';
import { renderCertificateTextElement } from '@/components/certificate/certificate-text-element';
import { cn } from '@/lib/utils';

interface IssuedCertificatePreviewProps {
  template: CertificateTemplate;
  context: IssuedCertificateContext;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  mode?: 'display' | 'export';
  imageUrlOverrides?: Record<string, string>;
}

function renderIssuedElement(
  element: CertificateElement,
  context: IssuedCertificateContext,
  scale: number,
  mode: 'display' | 'export',
  imageUrlOverrides?: Record<string, string>,
) {
  const baseStyle: React.CSSProperties = {
    fontFamily: element.textStyle?.fontFamily || 'Montserrat',
    fontSize: `${(element.textStyle?.fontSize || 14) * scale}px`,
    fontWeight: element.textStyle?.fontWeight || 'normal',
    fontStyle: element.textStyle?.fontStyle || 'normal',
    color: element.textStyle?.color || '#000000',
    textAlign: element.textStyle?.textAlign ?? 'center',
  };

  if (
    element.type === CertificateElementType.TEXT ||
    element.type === CertificateElementType.STUDENT_NAME ||
    element.type === CertificateElementType.COURSE_NAME ||
    element.type === CertificateElementType.INSTRUCTOR_NAME ||
    element.type === CertificateElementType.CO_INSTRUCTOR_NAME ||
    element.type === CertificateElementType.CODE ||
    element.type === CertificateElementType.STUDENT_CODE ||
    element.type === CertificateElementType.COURSE_DETAILS ||
    element.type === CertificateElementType.COURSE_PROGRESS ||
    element.type === CertificateElementType.COURSE_DURATION ||
    element.type === CertificateElementType.COURSE_START_DATE ||
    element.type === CertificateElementType.COURSE_END_DATE ||
    element.type === CertificateElementType.DATE
  ) {
    const value = resolveIssuedCertificateElementValue(element, context);
    const textAlign = element.textStyle?.textAlign ?? 'center';
    return renderCertificateTextElement(value, baseStyle, textAlign);
  }

  if (element.type === CertificateElementType.IMAGE) {
    const imageSrc =
      element.value && imageUrlOverrides?.[element.value]
        ? imageUrlOverrides[element.value]
        : element.value;

    return imageSrc ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt=""
        crossOrigin="anonymous"
        className="h-full w-full object-contain"
        style={{ display: 'block', background: 'transparent' }}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
        Image
      </div>
    );
  }

  if (element.type === CertificateElementType.QR_CODE) {
    const qrData = resolveIssuedCertificateQrValue(element, context);
    const width = element.size.width * scale;
    const height = element.size.height * scale;
    const qrSize = Math.max(32, Math.floor(Math.min(width, height)));

    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: mode === 'export' ? 'transparent' : '#ffffff' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}`}
          alt="Certificate verification QR code"
          crossOrigin="anonymous"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (element.type === CertificateElementType.SHAPE) {
    return (
      <div
        className="h-full w-full"
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

  return null;
}

function getDisplaySize(
  layoutWidth: number,
  layoutHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  const aspectRatio = layoutWidth / layoutHeight;
  let displayWidth = maxWidth;
  let displayHeight = maxWidth / aspectRatio;

  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * aspectRatio;
  }

  return { displayWidth, displayHeight };
}

export const IssuedCertificatePreview = forwardRef<HTMLDivElement, IssuedCertificatePreviewProps>(
  function IssuedCertificatePreview(
    {
      template,
      context,
      className,
      maxWidth = 760,
      maxHeight = 540,
      mode = 'display',
      imageUrlOverrides,
    },
    ref,
  ) {
    const layoutData = normalizeLayoutData(template.layoutData);
    const isExport = mode === 'export';
    const { displayWidth, displayHeight } = isExport
      ? { displayWidth: layoutData.size.width, displayHeight: layoutData.size.height }
      : getDisplaySize(layoutData.size.width, layoutData.size.height, maxWidth, maxHeight);
    const scale = isExport ? 1 : displayWidth / layoutData.size.width;
    const backgroundUrl =
      layoutData.background?.type === 'image' && layoutData.background.value
        ? layoutData.background.value
        : layoutData.type === 'image' && layoutData.value
          ? layoutData.value
          : null;
    const backgroundColor =
      layoutData.background?.type === 'color'
        ? layoutData.background.value
        : layoutData.type === 'color'
          ? layoutData.value
          : '#FFFFFF';

    return (
      <div className={cn(isExport ? undefined : 'flex justify-center', className)}>
        <div
          ref={ref}
          data-certificate-export-root
          className={cn(
            'relative bg-white',
            isExport ? 'overflow-hidden' : 'overflow-hidden rounded-xl border border-gray-200 shadow-sm',
          )}
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        >
          {backgroundUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backgroundUrl}
              alt={template.title}
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor }} />
          )}

          <div className="absolute inset-0">
            {layoutData.elements.map((rawElement) => {
              const element = normalizeCertificateElement(rawElement);

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
                  {renderIssuedElement(element, context, scale, mode, imageUrlOverrides)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

export function getIssuedCertificatePreviewAspectRatio(orientation?: DocumentOrientation | string) {
  return orientation === 'PORTRAIT' ? '595/842' : '842/595';
}
