import type { PaginatedResponse } from '@/types/pagination';
import type {
  CatalogCourseCard,
  CatalogCourseDetail,
  CatalogFilterParams,
  CatalogInstitution,
} from '@/types/catalog';
import { publicApiClient } from './public-api-client';

function toCatalogQuery(params: CatalogFilterParams = {}) {
  const record: Record<string, string | number> = {};
  if (params.page) record.page = params.page;
  if (params.limit) record.limit = params.limit;
  if (params.search) record.search = params.search;
  if (params.level) record.level = params.level;
  if (params.language) record.language = params.language;
  if (params.accessType) record.accessType = params.accessType;
  if (params.institutionId) record.institutionId = params.institutionId;
  if (params.category) record.category = params.category;
  if (params.sort) record.sort = params.sort;
  return record;
}

export async function getFeaturedCatalogCourses() {
  const response = await publicApiClient.get<{ data: CatalogCourseCard[] }>(
    '/catalog/featured',
  );
  return response.data.data;
}

export async function getCatalogCourses(params: CatalogFilterParams = {}) {
  const response = await publicApiClient.get<PaginatedResponse<CatalogCourseCard>>(
    '/catalog/courses',
    { params: toCatalogQuery(params) },
  );
  return response.data;
}

export async function getCatalogCourseBySlug(slug: string) {
  const response = await publicApiClient.get<{ data: CatalogCourseDetail }>(
    `/catalog/courses/${slug}`,
  );
  return response.data.data;
}

export async function getRelatedCatalogCourses(slug: string) {
  const response = await publicApiClient.get<{ data: CatalogCourseCard[] }>(
    `/catalog/courses/${slug}/related`,
  );
  return response.data.data;
}

export async function getCatalogInstitutions() {
  const response = await publicApiClient.get<{ data: CatalogInstitution[] }>(
    '/catalog/institutions',
  );
  return response.data.data;
}
