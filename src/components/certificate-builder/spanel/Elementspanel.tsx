'use client';

import React from 'react';
import { CertificateElementType } from '@/types/certificate';

interface ElementsPanelProps {
  onAddElement: (
    type: CertificateElementType,
    options?: {
      value?: string;
      locked?: boolean;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      textStyle?: {
        fontFamily?: string;
        fontSize?: number;
        fontWeight?: string;
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
      };
    },
  ) => void;
  disabled?: boolean;
}

interface ElementTypeConfig {
  type: CertificateElementType;
  label: string;
  icon: string;
}

export function ElementsPanel({ onAddElement, disabled = false }: ElementsPanelProps) {
  const elementTypes: ElementTypeConfig[] = [
    { type: CertificateElementType.TEXT, label: 'Text', icon: '📝' },
    { type: CertificateElementType.IMAGE, label: 'Image', icon: '🖼️' },
    // { type: CertificateElementType.SHAPE, label: 'Shape', icon: '▭' },
    { type: CertificateElementType.CODE, label: 'Certificate code', icon: '#' },
    { type: CertificateElementType.QR_CODE, label: 'QR code', icon: '⚡' },
    { type: CertificateElementType.DATE, label: 'Current Date', icon: '📅' },
  ];

  const courseFields: ElementTypeConfig[] = [
    { type: CertificateElementType.COURSE_NAME, label: 'Course name', icon: '📚' },
    { type: CertificateElementType.COURSE_DETAILS, label: 'Details', icon: '📋' },
    { type: CertificateElementType.COURSE_PROGRESS, label: 'Progress', icon: '📊' },
    { type: CertificateElementType.COURSE_DURATION, label: 'Course Duration', icon: '⏱️' },
    { type: CertificateElementType.COURSE_START_DATE, label: 'Start Date', icon: '📅' },
    { type: CertificateElementType.COURSE_END_DATE, label: 'End Date', icon: '📅' },
  ];

  const studentFields: ElementTypeConfig[] = [
    { type: CertificateElementType.STUDENT_NAME, label: 'Student name', icon: '👤' },
    { type: CertificateElementType.STUDENT_CODE, label: 'Student code', icon: '🔢' },
  ];

  const instructorFields: ElementTypeConfig[] = [
    { type: CertificateElementType.INSTRUCTOR_NAME, label: 'Instructor name', icon: '👨‍🏫' },
    { type: CertificateElementType.CO_INSTRUCTOR_NAME, label: 'Co Instructor name', icon: '👩‍🏫' },
  ];

  return (
    <div className="space-y-6">
      {/* Certificate Elements Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          CERTIFICATE
        </h3>
        <div className="space-y-2">
          {elementTypes.map((element) => (
            <button
              key={element.type}
              onClick={() => onAddElement(element.type)}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-base">{element.icon}</span>
              {element.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          COURSE
        </h3>
        <div className="space-y-2">
          {courseFields.map((field) => (
            <button
              key={field.type}
              onClick={() => onAddElement(field.type)}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-base">{field.icon}</span>
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          STUDENT
        </h3>
        <div className="space-y-2">
          {studentFields.map((field) => (
            <button
              key={field.type}
              onClick={() => onAddElement(field.type)}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-base">{field.icon}</span>
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instructor Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          INSTRUCTOR
        </h3>
        <div className="space-y-2">
          {instructorFields.map((field) => (
            <button
              key={field.type}
              onClick={() => onAddElement(field.type)}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-base">{field.icon}</span>
              {field.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
