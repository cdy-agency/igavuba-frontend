import { UserRole } from '@/types/enum';
import type { DashboardPermissions } from '@/types/dashboard';

export function getPermissionsForRole(role: UserRole | null): DashboardPermissions {
  if (!role) {
    return {
      canManageInstitutions: false,
      canManageUsers: false,
      canManageCourses: false,
      canReviewContent: false,
      canAccessReports: false,
      canManageSupport: false,
    };
  }

  return {
    canManageInstitutions: role === UserRole.SUPER_ADMIN,
    canManageUsers: [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT].includes(role),
    canManageCourses: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER].includes(role),
    canReviewContent: role === UserRole.CONTENT_REVIEWER,
    canAccessReports: [
      UserRole.SUPER_ADMIN,
      UserRole.INSTITUTION_ADMIN,
      UserRole.DATA_MANAGER,
      UserRole.CONTENT_REVIEWER,
      UserRole.SUPPORT_AGENT,
    ].includes(role),
    canManageSupport: role === UserRole.SUPPORT_AGENT,
  };
}
