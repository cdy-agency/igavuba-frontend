'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { PageHeader } from '@/components/dashboard/page-header';
import { DepartmentsTable } from '@/components/dashboard/departments/departments-table';
import { CreateDepartmentModal } from '@/components/dashboard/departments/create-department-modal';
import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';
import { Button } from '@/components/ui/button';

const DEPARTMENT_VIEWER_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

export function DepartmentsPage() {
  const { role } = useDashboard();
  const isReadOnly = role === UserRole.SUPER_ADMIN;
  const canManage = role === UserRole.INSTITUTION_ADMIN;
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={DEPARTMENT_VIEWER_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Departments"
          description={
            isReadOnly
              ? 'View academic departments across all institutions.'
              : 'Create and manage departments for lecturers and courses.'
          }
          actions={
            canManage ? (
              <Button className="h-10 gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create department
              </Button>
            ) : undefined
          }
        />
        <DepartmentsTable />
        {canManage ? (
          <CreateDepartmentModal open={createOpen} onOpenChange={setCreateOpen} />
        ) : null}
      </div>
    </RoleGuard>
  );
}
