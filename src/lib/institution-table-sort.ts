import type { SortOption } from '@/lib/table-sort';

export const DEFAULT_INSTITUTION_SORT = 'createdAt:desc';

export const INSTITUTION_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'slug:asc', label: 'Slug (A–Z)' },
  { value: 'slug:desc', label: 'Slug (Z–A)' },
  { value: 'institutionStatus:asc', label: 'Status (A–Z)' },
  { value: 'institutionStatus:desc', label: 'Status (Z–A)' },
  { value: 'members:desc', label: 'Most members' },
  { value: 'members:asc', label: 'Fewest members' },
  { value: 'active:desc', label: 'Active first' },
  { value: 'active:asc', label: 'Inactive first' },
];
