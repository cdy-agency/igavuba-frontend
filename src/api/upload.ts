import apiClient from './api-client';

export type UploadedAsset = {
  id: string;
  url: string;
  type: string;
  userId?: string;
};

function extractUploadedUrl(payload: unknown): string | undefined {
  if (!payload) return undefined;

  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload)) {
    const first = payload[0] as UploadedAsset | undefined;
    return first?.url;
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (typeof record.url === 'string') {
      return record.url;
    }

    if (Array.isArray(record.data)) {
      const first = record.data[0] as UploadedAsset | undefined;
      return first?.url;
    }

    if (record.data && typeof record.data === 'object') {
      const nested = record.data as Record<string, unknown>;
      if (typeof nested.url === 'string') {
        return nested.url;
      }
    }
  }

  return undefined;
}

/**
 * Upload a single file to POST /assets/upload.
 * Backend expects multipart field name: "files".
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('files', file);

  const response = await apiClient.post<UploadedAsset[] | { data: UploadedAsset[] }>(
    '/assets/upload',
    formData,
  );

  const url = extractUploadedUrl(response.data);
  if (!url) {
    throw new Error('No URL returned from upload');
  }

  return url;
}

export async function uploadImage(file: File): Promise<string> {
  return uploadFile(file);
}

export async function uploadVideo(file: File): Promise<string> {
  return uploadFile(file);
}
