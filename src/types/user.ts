import type { AuthInstitution } from './auth';
import type { UserRole } from './enum';

export interface User {
  id: string;
  email: string;
  name: string;
  status: string;
  role?: UserRole | string;
  institutionId?: string | null;
  profileImage?: string | null;
  emailVerified?: boolean;
  institution?: AuthInstitution | null;
}
