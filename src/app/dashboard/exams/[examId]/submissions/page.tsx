'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { ExamSubmissionsList } from '@/components/dashboard/exams/exam-submissions-list';

const EXAM_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function ExamSubmissionsPage() {
  const params = useParams<{ examId: string }>();

  return (
    <RoleGuard allowedRoles={EXAM_MANAGER_ROLES}>
      <ExamSubmissionsList examId={params.examId} />
    </RoleGuard>
  );
}
