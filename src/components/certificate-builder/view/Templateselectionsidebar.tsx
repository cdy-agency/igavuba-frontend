'use client';

import React from 'react';
import type { CertificateTemplate, CertificateElement } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import { normalizeCertificateElement } from '@/utils/certificate-template';
import Image from 'next/image';

interface TemplateSelectionSidebarProps {
  templates: CertificateTemplate[];
  selectedTemplateId: string | null;
  defaultTemplateId: string | null;
  onSelectTemplate: (template: CertificateTemplate) => void;
}

export function TemplateSelectionSidebar({
  templates,
  selectedTemplateId,
  defaultTemplateId,
  onSelectTemplate,
}: TemplateSelectionSidebarProps) {
  const renderThumbnailElement = (element: CertificateElement, scale: number) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: element.textStyle?.fontFamily || 'Montserrat',
      fontSize: `${(element.textStyle?.fontSize || 14) * scale}px`,
      fontWeight: element.textStyle?.fontWeight || 'normal',
      fontStyle: element.textStyle?.fontStyle || 'normal',
      color: element.textStyle?.color || '#000000',
      textAlign: element.textStyle?.textAlign ?? 'center',
    };

    // TEXT-BASED ELEMENTS (simplified for thumbnail)
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
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={baseStyle}
        >
          <span className="truncate px-1">{element.value || element.content || 'Text'}</span>
        </div>
      );
    }

    // DATE
    if (element.type === CertificateElementType.DATE) {
      return (
        <div className="w-full h-full flex items-center justify-center" style={baseStyle}>
          {element.value || new Date().toLocaleDateString()}
        </div>
      );
    }

    // IMAGE
    if (element.type === CertificateElementType.IMAGE) {
      return element.value ? (
        <Image src={element.value} alt="Element" fill className="object-contain" sizes="200px" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">
          IMG
        </div>
      );
    }

    // QR CODE - Show simplified placeholder for thumbnail
    if (element.type === CertificateElementType.QR_CODE) {
      return (
        <div className="w-full h-full bg-white flex items-center justify-center p-0.5">
          <div className="w-full h-full bg-black opacity-80" />
        </div>
      );
    }

    // SHAPE
    if (element.type === CertificateElementType.SHAPE) {
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: element.fillColor || '#9ca3af',
            borderRadius: element.borderRadius ? `${element.borderRadius * scale}px` : undefined,
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="w-[220px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">
          Select Template
          {templates.length > 0 && <span className="text-gray-500 ml-1">({templates.length})</span>}
        </h2>
        <p className="text-xs text-gray-500 mt-1">Choose a certificate template</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            const isDefault = template.id === defaultTemplateId;
            const layoutData = template.layoutData;

            // Calculate scale for thumbnail
            const thumbnailWidth = 200;
            const scale = thumbnailWidth / layoutData.size.width;

            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`w-full max-w-[200px] text-left overflow-hidden transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-sm'
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Certificate Thumbnail Preview */}
                <div className="w-full aspect-[3/2] bg-gray-100 overflow-hidden relative">
                  {/* Background */}
                  {layoutData.type === 'image' && layoutData.value ? (
                    <Image
                      src={layoutData.value}
                      alt={template.title}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: layoutData.type === 'color' ? layoutData.value : '#FFFFFF',
                      }}
                    />
                  )}

                  {/* Elements Layer */}
                  <div className="absolute inset-0">
                    {layoutData.elements?.map((rawElement) => {
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

                  {/* Default Badge */}
                  {isDefault && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] rounded bg-green-500 text-white font-medium z-10">
                      Default
                    </span>
                  )}
                </div>

                {/* Template Info */}
                <div className="px-2 py-1.5 bg-white">
                  <h3 className="text-xs font-semibold text-gray-900 truncate">{template.title}</h3>
                  <p className="text-[10px] text-gray-500">{template.orientation}</p>
                </div>
              </button>
            );
          })}

          {templates.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
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
              </div>
              <p className="text-xs text-gray-500">No templates available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
