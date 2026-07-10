'use client';

import { useParams } from 'next/navigation';
import { DashboardStubPage } from '@/components/dashboard/dashboard-stub-page';
import { InstitutionAdminsPage } from '@/components/dashboard/institution-admins/institution-admins-page';
import { InstitutionsPage } from '@/components/dashboard/institutions/institutions-page';
import { UsersPage } from '@/components/dashboard/users/users-page';
import { CoursesPage } from '@/components/dashboard/courses/courses-page';
import { MyLearningPage } from '@/components/dashboard/my-learning/my-learning-page';
import { AchievementsPage } from '@/components/dashboard/achievements/achievements-page';
import { InstitutionSettingsPage } from '@/components/dashboard/settings/institution-settings-page';
import { InstitutionPaymentsPage } from '@/components/dashboard/payments/institution-payments-page';
import { StudentPaymentsPage } from '@/components/dashboard/payments/student-payments-page';
import { AssessmentsPage } from '@/components/dashboard/assessments/assessments-page';
import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';
import type { AssessmentTab } from '@/components/dashboard/assessments/assessments-page';

function resolveAssessmentTab(section: string): AssessmentTab | undefined {
  if (section === 'quizzes' || section === 'exams' || section === 'assignments') {
    return section;
  }
  return undefined;
}

function PaymentsSectionPage() {
  const { role } = useDashboard();

  if (role === UserRole.LEARNER) {
    return <StudentPaymentsPage />;
  }

  return <InstitutionPaymentsPage />;
}

export default function DashboardSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section ?? '';

  if (section === 'institutions') {
    return <InstitutionsPage />;
  }

  if (section === 'institution-admins') {
    return <InstitutionAdminsPage />;
  }

  if (section === 'users') {
    return <UsersPage />;
  }

  if (section === 'courses') {
    return <CoursesPage />;
  }

  if (section === 'my-learning' || section === 'my-courses') {
    return <MyLearningPage />;
  }

  if (section === 'achievements') {
    return <AchievementsPage />;
  }

  if (section === 'settings') {
    return <InstitutionSettingsPage />;
  }

  if (section === 'payments') {
    return <PaymentsSectionPage />;
  }

  if (
    section === 'assessments' ||
    section === 'quizzes' ||
    section === 'exams' ||
    section === 'assignments'
  ) {
    return <AssessmentsPage initialTab={resolveAssessmentTab(section)} />;
  }

  return <DashboardStubPage section={section} />;
}
