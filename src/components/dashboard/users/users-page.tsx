'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { UsersTable } from '@/components/dashboard/users/users-table';

export function UsersPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Super Admin
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View all platform users, their roles, and manage account access.
            </p>
          </div>
        </div>

        <UsersTable />
      </div>
    </RoleGuard>
  );
}
