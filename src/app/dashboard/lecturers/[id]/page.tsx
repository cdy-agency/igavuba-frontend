'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { LecturerProfilePage } from '@/components/dashboard/lecturers/lecturer-profile-page';
import { UserRole } from '@/types/enum';

const LECTURER_VIEWER_ROLES = [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN];

export default function DashboardLecturerDetailPage() {
  const params = useParams<{ id: string }>();
  const lecturerId = params.id ?? '';

  return (
    <RoleGuard allowedRoles={LECTURER_VIEWER_ROLES}>
      <LecturerProfilePage lecturerId={lecturerId} />
    </RoleGuard>
  );
}
