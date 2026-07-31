'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachExistingContent, getContentLibrary } from '@/api/content.api';
import type { PaginatedResponse } from '@/types/pagination';
import type { ContentLibraryQueryParams, ContentRecord } from '@/types/content';
import { moduleContentQueryKeys } from '@/hooks/use-module-contents';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

export const contentLibraryQueryKeys = {
  list: (params: ContentLibraryQueryParams) => ['content-library', params] as const,
};

export function useContentLibrary(params: ContentLibraryQueryParams, enabled = true) {
  return useQuery<PaginatedResponse<ContentRecord>>({
    queryKey: contentLibraryQueryKeys.list(params),
    queryFn: () => getContentLibrary(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useAttachExistingContent(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => attachExistingContent(moduleId, { contentId }),
    onSuccess: (response) => {
      toast.success(response.message || 'Content added to module.');
      queryClient.invalidateQueries({ queryKey: moduleContentQueryKeys.list(moduleId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add content to module.'));
    },
  });
}
