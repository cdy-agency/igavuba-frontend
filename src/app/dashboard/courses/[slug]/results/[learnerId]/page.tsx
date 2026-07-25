'use client';

import { useParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { CourseLearnerResultPage } from '@/components/dashboard/course-results/course-learner-result-page';

const COURSE_RESULTS_ROLES = [

  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function CourseLearnerResultRoutePage() {
  const params = useParams<{ slug: string; learnerId: string }>();

  return (
    <RoleGuard allowedRoles={COURSE_RESULTS_ROLES}>
      <CourseLearnerResultPage courseSlug={params.slug} learnerId={params.learnerId} />
    </RoleGuard>
  );
}
