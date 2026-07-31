'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CertificateElement, CertificateTemplate } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import { normalizeCertificateElement } from '@/utils/certificate-template';

function renderThumbnailElement(element: CertificateElement, scale: number) {
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
    element.type === CertificateElementType.COURSE_END_DATE
  ) {
    return (
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden"
        style={baseStyle}
      >
        <span className="truncate px-0.5">{element.value || element.content || 'Text'}</span>
      </div>
    );
  }

  if (element.type === CertificateElementType.DATE) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={baseStyle}>
        {element.value || new Date().toLocaleDateString()}
      </div>
    );
  }

  if (element.type === CertificateElementType.IMAGE) {
    return element.value ? (
      <Image src={element.value} alt="Element" fill className="object-contain" sizes="200px" />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-[8px] text-gray-400">
        IMG
      </div>
    );
  }

  if (element.type === CertificateElementType.QR_CODE) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-0.5">
        <div className="h-full w-full bg-black opacity-80" />
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
        }}
      />
    );
  }

  return null;
}

interface CertificateTemplateThumbnailProps {
  template: CertificateTemplate;
  selected?: boolean;
  isDefault?: boolean;
  onClick?: () => void;
  className?: string;
  previewWidth?: number;
}

export function CertificateTemplateThumbnail({
  template,
  selected = false,
  isDefault = false,
  onClick,
  className,
  previewWidth = 160,
}: CertificateTemplateThumbnailProps) {
  const layoutData = template.layoutData;
  const canvasWidth = layoutData?.size?.width || 842;
  const scale = previewWidth / canvasWidth;

  const content = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {layoutData?.background?.type === 'image' && layoutData.background.value ? (
          <Image
            src={layoutData.background.value}
            alt={template.title}
            fill
            className="object-cover"
            sizes={`${previewWidth}px`}
          />
        ) : layoutData?.type === 'image' && layoutData.value ? (
          <Image
            src={layoutData.value}
            alt={template.title}
            fill
            className="object-cover"
            sizes={`${previewWidth}px`}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                layoutData?.background?.type === 'color'
                  ? layoutData.background.value
                  : layoutData?.type === 'color'
                    ? layoutData.value
                    : '#FFFFFF',
            }}
          />
        )}

        <div className="absolute inset-0">
          {layoutData?.elements?.map((rawElement) => {
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
                {renderThumbnailElement(element, scale)}
              </div>
            );
          })}
        </div>

        {isDefault && (
          <span className="absolute right-1 top-1 z-10 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Default
          </span>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white px-2 py-2">
        <p className="truncate text-center text-xs font-medium text-gray-900">{template.title}</p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full overflow-hidden rounded-md bg-white text-left transition-all',
          selected
            ? 'ring-2 ring-blue-500 ring-offset-1'
            : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm',
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-md bg-white',
        selected ? 'ring-2 ring-blue-500 ring-offset-1' : 'border border-gray-200',
        className,
      )}
    >
      {content}
    </div>
  );
}
