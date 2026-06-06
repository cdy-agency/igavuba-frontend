'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Button } from '@/components/ui/button';
import { CourseForm } from '@/components/dashboard/courses/course-form';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function CreateCoursePage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm" className="w-fit px-0 hover:bg-transparent">
            <Link href="/dashboard/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to courses
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Create course
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Add a new course. It will be saved as a draft until published.
            </p>
          </div>
        </div>

        <CourseForm
          mode="create"
          onCancel={() => router.push('/dashboard/courses')}
          onSuccess={() => router.push('/dashboard/courses')}
        />
      </div>
    </RoleGuard>
  );
}
