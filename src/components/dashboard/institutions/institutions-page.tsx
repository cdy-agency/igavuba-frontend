'use client';

import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { CreateInstitutionDialog } from '@/components/dashboard/institutions/create-institution-dialog';
import { InstitutionsTable } from '@/components/dashboard/institutions/institutions-table';

export function InstitutionsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-8">
        <PageHeader
          title="Institutions"
          description="Create institutions, invite administrators, and manage access."
          badge="Super Admin"
          actions={<CreateInstitutionDialog />}
        />
        <InstitutionsTable />
      </div>
    </RoleGuard>
  );
}
