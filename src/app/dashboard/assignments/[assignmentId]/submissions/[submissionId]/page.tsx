'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { AssignmentSubmissionReview } from '@/components/dashboard/assignments/assignment-submission-review';

const ASSIGNMENT_MANAGER_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function AssignmentSubmissionReviewPage() {
  const params = useParams<{ assignmentId: string; submissionId: string }>();

  return (
    <RoleGuard allowedRoles={ASSIGNMENT_MANAGER_ROLES}>
      <AssignmentSubmissionReview
        assignmentId={params.assignmentId}
        submissionId={params.submissionId}
      />
    </RoleGuard>
  );
}
