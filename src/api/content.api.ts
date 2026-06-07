import { apiClient } from './api-client';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  AttachExistingContentPayload,
  ContentLibraryQueryParams,
  ContentMutationResponse,
  ContentRecord,
  CreateDocumentContentPayload,
  CreateTextContentPayload,
  CreateVideoContentPayload,
  DetachContentResponse,
  ModuleContentItem,
  ModuleContentMutationResponse,
  ModuleContentsReorderResponse,
  ReorderModuleContentsPayload,
  UpdateDocumentContentPayload,
  UpdateTextContentPayload,
  UpdateVideoContentPayload,
} from '@/types/content';

function toContentLibraryQuery(
  params: ContentLibraryQueryParams,
): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  if (params.type) record.type = params.type;
  if (params.search) record.search = params.search;
  if (params.page) record.page = params.page;
  if (params.limit) record.limit = params.limit;
  if (params.sort) record.sort = params.sort;
  return record;
}

export async function getContentLibrary(params: ContentLibraryQueryParams = {}) {
  const response = await apiClient.get<PaginatedResponse<ContentRecord>>('/contents', {
    params: toContentLibraryQuery(params),
  });
  return response.data;
}

export async function attachExistingContent(
  moduleId: string,
  payload: AttachExistingContentPayload,
) {
  const response = await apiClient.post<ModuleContentMutationResponse>(
    `/modules/${moduleId}/contents/attach`,
    payload,
  );
  return response.data;
}

export async function getModuleContents(moduleId: string) {
  const response = await apiClient.get<ModuleContentItem[]>(
    `/modules/${moduleId}/contents`,
  );
  return response.data;
}

export async function createTextContent(
  moduleId: string,
  payload: CreateTextContentPayload,
) {
  const response = await apiClient.post<ModuleContentMutationResponse>(
    `/modules/${moduleId}/contents/text`,
    payload,
  );
  return response.data;
}

export async function createVideoContent(
  moduleId: string,
  payload: CreateVideoContentPayload,
) {
  const response = await apiClient.post<ModuleContentMutationResponse>(
    `/modules/${moduleId}/contents/video`,
    payload,
  );
  return response.data;
}

export async function createDocumentContent(
  moduleId: string,
  payload: CreateDocumentContentPayload,
) {
  const response = await apiClient.post<ModuleContentMutationResponse>(
    `/modules/${moduleId}/contents/document`,
    payload,
  );
  return response.data;
}

export async function detachContent(moduleId: string, contentId: string) {
  const response = await apiClient.delete<DetachContentResponse>(
    `/modules/${moduleId}/contents/${contentId}`,
  );
  return response.data;
}

export async function reorderModuleContents(
  moduleId: string,
  payload: ReorderModuleContentsPayload,
) {
  const response = await apiClient.patch<ModuleContentsReorderResponse>(
    `/modules/${moduleId}/contents/reorder`,
    payload,
  );
  return response.data;
}

export async function updateTextContent(
  contentId: string,
  payload: UpdateTextContentPayload,
) {
  const response = await apiClient.patch<ContentMutationResponse>(
    `/contents/${contentId}/text`,
    payload,
  );
  return response.data;
}

export async function updateVideoContent(
  contentId: string,
  payload: UpdateVideoContentPayload,
) {
  const response = await apiClient.patch<ContentMutationResponse>(
    `/contents/${contentId}/video`,
    payload,
  );
  return response.data;
}

export async function updateDocumentContent(
  contentId: string,
  payload: UpdateDocumentContentPayload,
) {
  const response = await apiClient.patch<ContentMutationResponse>(
    `/contents/${contentId}/document`,
    payload,
  );
  return response.data;
}

export async function deleteContent(contentId: string, force = false) {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/contents/${contentId}`,
    { params: force ? { force: 'true' } : undefined },
  );
  return response.data;
}
