'use client';

import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { Certificate, CertificateElement } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import { normalizeCertificateElement } from '@/utils/certificate-template';
import Image from 'next/image';

interface CertificateListProps {
  certificates: Certificate[];
  selectedCertificateId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCertificate: (id: string) => void;
  onAddCertificate: () => void;
  onRenameCertificate: (id: string, title: string) => void;
  onDeleteCertificate: (certificate: Certificate) => void;
  isCreating: boolean;
}

export function CertificateList({
  certificates,
  selectedCertificateId,
  searchQuery,
  onSearchChange,
  onSelectCertificate,
  onAddCertificate,
  onRenameCertificate,
  onDeleteCertificate,
  isCreating,
}: CertificateListProps) {
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (cert: Certificate) => {
    setEditingCertificateId(cert.id);
    setEditingName(cert.title);
  };

  const handleSaveEdit = () => {
    if (editingCertificateId && editingName.trim()) {
      onRenameCertificate(editingCertificateId, editingName.trim());
      setEditingCertificateId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCertificateId(null);
    setEditingName('');
  };

  // Render a single element for the thumbnail preview
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
          <span className="truncate px-0.5">{element.value || element.content || 'Text'}</span>
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
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[6px] text-gray-400">
          IMG
        </div>
      );
    }

    // QR CODE
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
    <div className="w-[200px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Certificates{' '}
            {certificates.length > 0 && (
              <span className="text-gray-500">{certificates.length}</span>
            )}
          </h2>
          <button
            onClick={onAddCertificate}
            disabled={isCreating}
            className="p-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Add new certificate"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search certificates"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Certificate List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {certificates.map((cert) => {
            const layoutData = cert.layoutData;
            const thumbnailWidth = 200;
            const scale = layoutData?.size ? thumbnailWidth / layoutData.size.width : 1;

            return (
              <div
                key={cert.id}
                className={`group overflow-hidden transition-all ${
                  selectedCertificateId === cert.id
                    ? 'ring-1 ring-blue-500 shadow-md'
                    : 'hover:shadow-sm border border-gray-200'
                }`}
              >
                {/* Certificate Card */}
                <div
                  onClick={() => onSelectCertificate(cert.id)}
                  className="w-full text-left relative cursor-pointer"
                >
                  {/* Thumbnail - Full width with elements */}
                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    {/* Background Layer */}
                    {cert.layoutData?.background?.type === 'image' &&
                    cert.layoutData?.background?.value ? (
                      <Image
                        src={cert.layoutData.background.value}
                        alt={cert.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : cert.layoutData?.type === 'image' && cert.layoutData?.value ? (
                      <Image
                        src={cert.layoutData.value}
                        alt={cert.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor:
                            cert.layoutData?.background?.type === 'color'
                              ? cert.layoutData.background.value
                              : cert.layoutData?.type === 'color'
                                ? cert.layoutData.background?.value
                                : '#f3f4f6',
                        }}
                      />
                    )}

                    {/* Elements Layer */}
                    {layoutData?.elements && layoutData.elements.length > 0 && (
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
                              transform: element.rotation
                                ? `rotate(${element.rotation}deg)`
                                : 'none',
                            }}
                          >
                            {renderThumbnailElement(element, scale)}
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Delete button overlay on image */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCertificate(cert);
                        }}
                        className="p-1.5 bg-red-500 hover:bg-red-600 shadow-lg transition-colors"
                        title="Delete certificate"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Title and ID section - Always visible */}
                  <div className="p-3 bg-white">
                    {editingCertificateId === cert.id ? (
                      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-2 py-1 text-sm font-semibold border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={handleSaveEdit}
                          placeholder="Certificate name"
                        />
                      </div>
                    ) : (
                      // Normal Display Mode
                      <div className="space-y-1">
                        <h3
                          className="text-sm font-semibold text-gray-900 text-wrap cursor-text hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(cert);
                          }}
                          title="Click to edit name"
                        >
                          {cert.title}
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {certificates.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <p className="text-sm font-medium text-gray-900 mb-1">
                {searchQuery ? 'No certificates found' : 'No certificates yet'}
              </p>
              {!searchQuery && (
                <p className="text-xs text-gray-500">
                  Click the + button to create your first certificate
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
