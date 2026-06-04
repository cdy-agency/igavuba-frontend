import { UserRole } from '@/types/enum';

const VALID_ROLES = new Set<string>(Object.values(UserRole));

export function parseUserRole(role?: string | null): UserRole | null {
  if (!role || !VALID_ROLES.has(role)) {
    return null;
  }

  return role as UserRole;
}

export function hasAnyRole(userRole: UserRole | null, allowedRoles: UserRole[]): boolean {
  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
}

export function getRoleLabel(role: UserRole): string {
  return role
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
