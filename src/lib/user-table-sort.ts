import type { SortOption } from '@/lib/table-sort';

export const DEFAULT_USER_SORT = 'createdAt:desc';

export type UserSortValue =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'name:asc'
  | 'name:desc'
  | 'email:asc'
  | 'email:desc'
  | 'status:asc'
  | 'status:desc'
  | 'role:asc'
  | 'role:desc'
  | 'institutionName:asc'
  | 'institutionName:desc';

export type UserSortOption = SortOption & { value: UserSortValue };

export const USER_SORT_OPTIONS: UserSortOption[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'email:asc', label: 'Email (A–Z)' },
  { value: 'email:desc', label: 'Email (Z–A)' },
  { value: 'status:asc', label: 'Status (A–Z)' },
  { value: 'status:desc', label: 'Status (Z–A)' },
  { value: 'role:asc', label: 'Role (A–Z)' },
  { value: 'role:desc', label: 'Role (Z–A)' },
  { value: 'institutionName:asc', label: 'Institution (A–Z)' },
  { value: 'institutionName:desc', label: 'Institution (Z–A)' },
];

export const INSTITUTION_ADMIN_SORT_OPTIONS: UserSortOption[] =
  USER_SORT_OPTIONS.filter((option) => !option.value.startsWith('role:'));
