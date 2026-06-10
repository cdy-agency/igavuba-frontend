export enum ContentType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export interface TextContentDetail {
  id: string;
  contentId: string;
  body: string;
}

export interface VideoContentDetail {
  id: string;
  contentId: string;
  videoUrl: string;
  durationSeconds: number | null;
  allowDownload: boolean;
}

export interface DocumentContentDetail {
  id: string;
  contentId: string;
  fileUrl: string;
  allowDownload: boolean;
}

export interface ContentRecord {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  institutionId: string | null;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  textContent: TextContentDetail | null;
  videoContent: VideoContentDetail | null;
  documentContent: DocumentContentDetail | null;
}

export interface ModuleContentItem {
  id: string;
  moduleId: string;
  contentId: string;
  order: number;
  isOptional: boolean;
  requiredForCompletion: boolean;
  unlockDate: string | null;
  createdAt: string;
  content: ContentRecord;
}

export interface CreateTextContentPayload {
  title: string;
  description?: string;
  body: string;
  isPublished?: boolean;
}

export interface CreateVideoContentPayload {
  title: string;
  description?: string;
  videoUrl: string;
  durationSeconds?: number;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface CreateDocumentContentPayload {
  title: string;
  description?: string;
  fileUrl: string;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface UpdateTextContentPayload {
  title?: string;
  description?: string;
  body?: string;
  isPublished?: boolean;
}

export interface UpdateVideoContentPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  durationSeconds?: number;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface UpdateDocumentContentPayload {
  title?: string;
  description?: string;
  fileUrl?: string;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface ReorderModuleContentsPayload {
  contentIds: string[];
}

export interface ModuleContentMutationResponse {
  success: boolean;
  message: string;
  data: ModuleContentItem;
}

export interface ModuleContentsReorderResponse {
  success: boolean;
  message: string;
  data: ModuleContentItem[];
}

export interface ContentMutationResponse {
  success: boolean;
  message: string;
  data: ContentRecord;
}

export interface DetachContentResponse {
  success: boolean;
  message: string;
  data: { moduleId: string; contentId: string };
}

export interface ContentLibraryQueryParams {
  type?: ContentType;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

export interface AttachExistingContentPayload {
  contentId: string;
}
