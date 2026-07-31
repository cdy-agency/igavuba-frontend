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
  abbreviation: string | null;
  slug: string;
  logo: string | null;
  website: string | null;
  active: boolean;
  institutionStatus: InstitutionStatus;
  createdAt: string;
  users: InstitutionAdminSummary[];
  _count: {
    users: number;
  };
}

export interface InstitutionDetail extends InstitutionListItem {
  description: string | null;
  contactPhone: string | null;
  updatedAt: string;
  _count: {
    users: number;
    courses: number;
  };
}

export interface InviteInstitutionAdminPayload {
  name?: string;
  email: string;
}

export interface UpdateInstitutionPayload {
  name?: string;
  abbreviation?: string;
  logo?: string;
  website?: string;
  contactPhone?: string;
  description?: string;
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
