import type { UserRole } from './enum';

export interface User {
  id: string;
  email: string;
  name: string;
  status: string;
  role?: UserRole | string;
}
