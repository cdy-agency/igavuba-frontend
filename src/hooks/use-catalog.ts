'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCatalogCourseBySlug,
  getCatalogCourses,
  getCatalogInstitutions,
  getFeaturedCatalogCourses,
  getRelatedCatalogCourses,
} from '@/api/catalog.api';
import type {
  CatalogCourseCard,
  CatalogCourseDetail,
  CatalogFilterParams,
  CatalogInstitution,
} from '@/types/catalog';
import type { PaginatedResponse } from '@/types/pagination';

export const catalogQueryKeys = {
  featured: ['catalog', 'featured'] as const,
  list: (params: CatalogFilterParams) => ['catalog', 'courses', params] as const,
  detail: (slug: string) => ['catalog', 'course', slug] as const,
  related: (slug: string) => ['catalog', 'related', slug] as const,
  institutions: ['catalog', 'institutions'] as const,
};

export function useFeaturedCatalogCourses(enabled = true) {
  return useQuery<CatalogCourseCard[]>({
    queryKey: catalogQueryKeys.featured,
    queryFn: getFeaturedCatalogCourses,
    enabled,
  });
}

export function useCatalogCourses(params: CatalogFilterParams, enabled = true) {
  return useQuery<PaginatedResponse<CatalogCourseCard>>({
    queryKey: catalogQueryKeys.list(params),
    queryFn: () => getCatalogCourses(params),
    enabled,
  });
}

export function useCatalogCourseDetail(slug: string, enabled = true) {
  return useQuery<CatalogCourseDetail>({
    queryKey: catalogQueryKeys.detail(slug),
    queryFn: () => getCatalogCourseBySlug(slug),
    enabled: Boolean(slug) && enabled,
  });
}

export function useRelatedCatalogCourses(slug: string, enabled = true) {
  return useQuery<CatalogCourseCard[]>({
    queryKey: catalogQueryKeys.related(slug),
    queryFn: () => getRelatedCatalogCourses(slug),
    enabled: Boolean(slug) && enabled,
  });
}

export function useCatalogInstitutions(enabled = true) {
  return useQuery<CatalogInstitution[]>({
    queryKey: catalogQueryKeys.institutions,
    queryFn: getCatalogInstitutions,
    enabled,
  });
}

export function useCategoryCatalogCourses(categorySlug: string, limit = 3, enabled = true) {
  return useQuery<CatalogCourseCard[]>({
    queryKey: catalogQueryKeys.list({ category: categorySlug, limit, page: 1 }),
    queryFn: async () => {
      const response = await getCatalogCourses({ category: categorySlug, limit, page: 1 });
      return response.data;
    },
    enabled: Boolean(categorySlug) && enabled,
  });
}
