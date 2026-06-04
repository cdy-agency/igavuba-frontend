'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { UsersTable } from '@/components/dashboard/users/users-table';

export function UsersPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-8">
        <PageHeader
          title="Users"
          description="View all platform users, their roles, and manage account access."
          badge="Super Admin"
        />
        <UsersTable />
      </div>
    </RoleGuard>
  );
}
