import { CertificateElementType } from '@/types/enum';
import type { CanvasDimensions, Certificate, CertificateElement, LayoutData } from '@/types/certificate';

export function getDefaultPlaceholder(type: CertificateElementType): string {
  switch (type) {
    case CertificateElementType.STUDENT_NAME:
      return 'Student Name';
    case CertificateElementType.COURSE_NAME:
      return 'Course Name';
    case CertificateElementType.INSTRUCTOR_NAME:
      return 'Instructor Name';
    case CertificateElementType.CO_INSTRUCTOR_NAME:
      return 'Co-Instructor Name';
    case CertificateElementType.CODE:
      return 'CERT-000000';
    case CertificateElementType.STUDENT_CODE:
      return 'STU-000000';
    case CertificateElementType.COURSE_DETAILS:
      return 'Course details';
    case CertificateElementType.COURSE_PROGRESS:
      return '100%';
    case CertificateElementType.COURSE_DURATION:
      return '40 hours';
    case CertificateElementType.COURSE_START_DATE:
    case CertificateElementType.COURSE_END_DATE:
    case CertificateElementType.DATE:
      return new Date().toLocaleDateString();
    case CertificateElementType.QR_CODE:
      return '';
    case CertificateElementType.IMAGE:
      return '';
    default:
      return 'Text';
  }
}

export function getDefaultSize(type: CertificateElementType) {
  switch (type) {
    case CertificateElementType.QR_CODE:
      return { width: 120, height: 120 };
    case CertificateElementType.IMAGE:
      return { width: 180, height: 120 };
    case CertificateElementType.SHAPE:
      return { width: 120, height: 80 };
    default:
      return { width: 280, height: 48 };
  }
}

export function isLockedByDefault(type: CertificateElementType) {
  return [
    CertificateElementType.STUDENT_NAME,
    CertificateElementType.COURSE_NAME,
    CertificateElementType.INSTRUCTOR_NAME,
    CertificateElementType.CO_INSTRUCTOR_NAME,
    CertificateElementType.CODE,
    CertificateElementType.STUDENT_CODE,
    CertificateElementType.COURSE_DETAILS,
    CertificateElementType.COURSE_PROGRESS,
    CertificateElementType.COURSE_DURATION,
    CertificateElementType.COURSE_START_DATE,
    CertificateElementType.COURSE_END_DATE,
    CertificateElementType.DATE,
    CertificateElementType.QR_CODE,
  ].includes(type);
}

export function isTextBasedElement(type: CertificateElementType | string) {
  return [
    CertificateElementType.TEXT,
    CertificateElementType.STUDENT_NAME,
    CertificateElementType.COURSE_NAME,
    CertificateElementType.INSTRUCTOR_NAME,
    CertificateElementType.CO_INSTRUCTOR_NAME,
    CertificateElementType.CODE,
    CertificateElementType.STUDENT_CODE,
    CertificateElementType.COURSE_DETAILS,
    CertificateElementType.COURSE_PROGRESS,
    CertificateElementType.COURSE_DURATION,
    CertificateElementType.COURSE_START_DATE,
    CertificateElementType.COURSE_END_DATE,
    CertificateElementType.DATE,
  ].includes(type as CertificateElementType);
}

export function isContentEditable(type: CertificateElementType | string) {
  return type === CertificateElementType.TEXT;
}

export function normalizeCertificateElement(
  element: CertificateElement,
): CertificateElement {
  const elementType = (element.type as CertificateElementType) || CertificateElementType.TEXT;
  const defaultSize = getDefaultSize(elementType);

  return {
    ...element,
    type: elementType,
    position: {
      x: element.position?.x ?? 0,
      y: element.position?.y ?? 0,
    },
    size: {
      width: element.size?.width ?? defaultSize.width,
      height: element.size?.height ?? defaultSize.height,
    },
    zIndex: element.zIndex ?? 1,
  };
}

export function normalizeLayoutData(layoutData?: LayoutData | null): LayoutData {
  const size = layoutData?.size ?? { width: 842, height: 595 };
  const background = layoutData?.background ?? {
    id: 'default-bg',
    type: 'color' as const,
    value: layoutData?.value ?? '#FFFFFF',
  };

  return {
    size,
    type: layoutData?.type ?? background.type ?? 'color',
    value: layoutData?.value ?? background.value ?? '#FFFFFF',
    background,
    elements: (layoutData?.elements ?? []).map(normalizeCertificateElement),
  };
}

export function normalizeCertificate(certificate: Certificate): Certificate {
  const layoutData = normalizeLayoutData(certificate.layoutData);

  return {
    ...certificate,
    layoutData,
    elements: layoutData.elements,
  };
}

export function getDisplayDimensions(
  size: CanvasDimensions,
  scale: number,
): CanvasDimensions {
  return {
    width: size.width * scale,
    height: size.height * scale,
  };
}

export const TEXT_PLACEHOLDERS: Record<string, string> = {
  [CertificateElementType.TEXT]: 'Text',
  [CertificateElementType.STUDENT_NAME]: 'Student Name',
  [CertificateElementType.STUDENT_CODE]: 'STU-000000',
  [CertificateElementType.COURSE_NAME]: 'Course Name',
  [CertificateElementType.COURSE_DETAILS]: 'Course details',
  [CertificateElementType.COURSE_PROGRESS]: '100%',
  [CertificateElementType.COURSE_DURATION]: '40 hours',
  [CertificateElementType.COURSE_START_DATE]: new Date().toLocaleDateString(),
  [CertificateElementType.COURSE_END_DATE]: new Date().toLocaleDateString(),
  [CertificateElementType.INSTRUCTOR_NAME]: 'Instructor Name',
  [CertificateElementType.CO_INSTRUCTOR_NAME]: 'Co-Instructor Name',
  [CertificateElementType.CODE]: 'CERT-000000',
  [CertificateElementType.DATE]: new Date().toLocaleDateString(),
};

export function constrainToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  const maxX = Math.max(0, canvasWidth - width);
  const maxY = Math.max(0, canvasHeight - height);

  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
    width: Math.min(width, canvasWidth),
    height: Math.min(height, canvasHeight),
  };
}

export type IssuedCertificateContext = {
  learnerName: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: string;
  overallGrade?: number | null;
  verifyUrl?: string;
  institutionName?: string | null;
};

function formatIssuedDate(value: string, format?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (format === 'short') {
    return date.toLocaleDateString();
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function resolveIssuedCertificateElementValue(
  element: CertificateElement,
  context: IssuedCertificateContext,
): string {
  const elementType = (element.type as CertificateElementType) || CertificateElementType.TEXT;

  switch (elementType) {
    case CertificateElementType.STUDENT_NAME:
      return context.learnerName;
    case CertificateElementType.COURSE_NAME:
      return context.courseTitle;
    case CertificateElementType.CODE:
      return context.certificateCode;
    case CertificateElementType.DATE:
      return formatIssuedDate(context.issuedAt, element.dateFormat);
    case CertificateElementType.COURSE_PROGRESS:
      return context.overallGrade != null
        ? `${Math.round(context.overallGrade)}%`
        : element.value || '100%';
    case CertificateElementType.TEXT:
      return element.value || element.content || 'Text';
    default:
      return element.value || element.content || getDefaultPlaceholder(elementType);
  }
}

export function resolveIssuedCertificateQrValue(
  element: CertificateElement,
  context: IssuedCertificateContext,
) {
  if (element.value?.trim()) {
    return element.value.trim();
  }

  if (context.verifyUrl) {
    return context.verifyUrl;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/certificate/verify/${context.certificateCode}`;
  }

  return context.certificateCode;
}
