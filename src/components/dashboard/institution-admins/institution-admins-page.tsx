'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { InstitutionAdminsTable } from '@/components/dashboard/institution-admins/institution-admins-table';

export function InstitutionAdminsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-8">
        <PageHeader
          title="Institution admins"
          description="Manage institution administrators and their account access."
          badge="Super Admin"
        />
        <InstitutionAdminsTable />
      </div>
    </RoleGuard>
  );
}
