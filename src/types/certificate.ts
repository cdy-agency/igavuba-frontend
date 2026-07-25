import type { DocumentOrientation } from '@/types/enum';
import type { Course } from '@/types/course';
import type { PaginatedResponse } from '@/types/pagination';

export { DocumentOrientation, CertificateElementType } from '@/types/enum';
import type { CertificateElementType as CertificateElementTypeEnum } from '@/types/enum';

export type TextAlign = 'left' | 'center' | 'right';

export type TextStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: TextAlign;
};

export type CertificateBackground = {
  id?: string;
  type: 'color' | 'image';
  value: string;
};

export type CertificateElement = {
  id: string;
  type: CertificateElementTypeEnum | string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex?: number;
  locked?: boolean;
  value?: string;
  content?: string;
  textStyle?: TextStyle;
  opacity?: number;
  rotation?: number;
  fillColor?: string;
  borderRadius?: number;
  dateFormat?: string;
  borderColor?: string;
  borderWidth?: number;
  shapeType?: string;
};

export type LayoutData = {
  size: { width: number; height: number };
  type: 'color' | 'image';
  value: string;
  elements: CertificateElement[];
  background?: CertificateBackground;
};

export type CertificateTemplate = {
  id: string;
  title: string;
  orientation: DocumentOrientation;
  layoutData: LayoutData;
  elements?: CertificateElement[];
  institutionId?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Certificate = CertificateTemplate;

export type CreateCertificateTemplateFormData = {
  title: string;
  orientation: DocumentOrientation;
  layoutData: LayoutData;
};

export type CertificateBuilderContextValue = {
  certificates: Certificate[];
  selectedCertificateId: string | null;
  selectedCertificate: Certificate | null;
  selectedElementId: string | null;
  elements: CertificateElement[];
  activeTab: 'elements' | 'backgrounds';
  isAddingElement: boolean;
  canvasScale: number;
  selectCertificate: (id: string | null) => void | Promise<void>;
  addCertificate: (data: CreateCertificateTemplateFormData) => Promise<void>;
  updateCertificate: (id: string, updates: Partial<Certificate>) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  addElement: (
    type: CertificateElementTypeEnum,
    options?: {
      value?: string;
      locked?: boolean;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      textStyle?: TextStyle;
    },
  ) => Promise<void>;
  updateElement: (id: string, updates: Partial<CertificateElement>) => Promise<void>;
  updateElementLocal: (id: string, updates: Partial<CertificateElement>) => void;
  flushElementUpdates: (id?: string) => Promise<void>;
  deleteElement: (id: string) => Promise<void>;
  selectElement: (id: string | null) => void;
  reorderElements: (elementIds: string[]) => Promise<void>;
  setActiveTab: (tab: 'elements' | 'backgrounds') => void;
  updateBackground: (background: CertificateBackground) => Promise<void>;
  setCanvasScale: (scale: number) => void;
};

export type CertificateTab = 'default' | 'courses';

export type FilterType = 'all' | 'assigned' | 'default';

export type CourseListResponse = PaginatedResponse<Course & {
  certificateTemplateId?: string | null;
  template?: { id: string; title: string } | null;
  category?: { name: string } | null;
  thumbnailImage?: string | null;
}>;

export type MutationError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export type ResizeHandle =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | null;

export type CanvasDimensions = {
  width: number;
  height: number;
};

export type RulerProps = {
  size: CanvasDimensions;
  scale: number;
  orientation: 'horizontal' | 'vertical';
};

export type SelectionHandlesProps = {
  element: CertificateElement;
  onResizeStart: (
    event: React.MouseEvent,
    handle: ResizeHandle,
  ) => void;
};

export type GeneratedCertificate = {
  id: string;
  certificateCode: string;
  courseTitle?: string;
  issuedAt?: string;
  pdfUrl?: string | null;
  metadata?: {
    previewUrl?: string;
    courseTitle?: string;
    institutionName?: string;
    [key: string]: unknown;
  } | null;
  finalAsset?: {
    url: string;
    fileName?: string;
  } | null;
};

export type VerifyCertificateResponse = {
  valid: boolean;
  certificateCode: string;
  learnerName: string;
  courseTitle: string;
  overallGrade?: number | null;
  issuedAt: string;
  revokedAt?: string | null;
  institutionName?: string | null;
  pdfUrl?: string | null;
  template?: CertificateTemplate | null;
};

export type CertificateTemplatesListResponse = {
  success: boolean;
  message?: string;
  data: {
    templates: CertificateTemplate[];
    institution?: {
      defaultCertificateTemplateId?: string | null;
    };
  };
};
