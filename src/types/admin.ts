import type { InstitutionStatus, UserRole, UserStatus } from '@/types/enum';

export interface InstitutionAdminSummary {
  id: string;
  name: string | null;
  email: string;
  status: UserStatus;
}

export interface InstitutionListItem {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  active: boolean;
  institutionStatus: InstitutionStatus;
  createdAt: string;
  users: InstitutionAdminSummary[];
  _count: {
    users: number;
  };
}

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  institutionId: string | null;
  createdAt: string;
  institution: {
    id: string;
    name: string;
  } | null;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  searchq?: string;
  role?: UserRole;
  status?: UserStatus;
  /** Server sort: `field:asc|desc` e.g. `createdAt:desc` */
  sort?: string;
}
