'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { AssignmentSubmissionsList } from '@/components/dashboard/assignments/assignment-submissions-list';

const ASSIGNMENT_MANAGER_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function AssignmentSubmissionsPage() {
  const params = useParams<{ assignmentId: string }>();

  return (
    <RoleGuard allowedRoles={ASSIGNMENT_MANAGER_ROLES}>
      <AssignmentSubmissionsList assignmentId={params.assignmentId} />
    </RoleGuard>
  );
}
