'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { CoursesTable } from '@/components/dashboard/courses/courses-table';
import { Button } from '@/components/ui/button';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export function CoursesPage() {
  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Courses"
          description="Create and manage institution courses. New courses start as drafts."
        />
        <CoursesTable />
      </div>
    </RoleGuard>
  );
}
