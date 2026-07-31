'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { StudentProfilePage } from '@/components/dashboard/students/student-profile-page';
import { UserRole } from '@/types/enum';

const STUDENT_VIEWER_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
  UserRole.DATA_MANAGER,
  UserRole.SUPER_ADMIN,
];

export default function DashboardStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const studentId = params.id ?? '';

  return (
    <RoleGuard allowedRoles={STUDENT_VIEWER_ROLES}>
      <StudentProfilePage studentId={studentId} />
    </RoleGuard>
  );
}
