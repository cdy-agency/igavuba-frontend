'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { ExamSubmissionReview } from '@/components/dashboard/exams/exam-submission-review';

const EXAM_MANAGER_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function ExamSubmissionReviewPage() {
  const params = useParams<{ examId: string; attemptId: string }>();

  return (
    <RoleGuard allowedRoles={EXAM_MANAGER_ROLES}>
      <ExamSubmissionReview examId={params.examId} attemptId={params.attemptId} />
    </RoleGuard>
  );
}
