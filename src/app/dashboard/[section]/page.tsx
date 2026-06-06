'use client';

import { useParams } from 'next/navigation';
import { DashboardStubPage } from '@/components/dashboard/dashboard-stub-page';
import { InstitutionAdminsPage } from '@/components/dashboard/institution-admins/institution-admins-page';
import { InstitutionsPage } from '@/components/dashboard/institutions/institutions-page';
import { UsersPage } from '@/components/dashboard/users/users-page';
import { CoursesPage } from '@/components/dashboard/courses/courses-page';

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

  return <DashboardStubPage section={section} />;
}
