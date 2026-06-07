'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Button } from '@/components/ui/button';
import { CourseForm } from '@/components/dashboard/courses/course-form';
import { CourseFormShell } from '@/components/dashboard/courses/course-form-shell';
import { useCourseDetail } from '@/hooks/use-courses';
import { getApiErrorMessage } from '@/lib/auth';

const COURSE_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';

  const { data: course, isPending, isError, error } = useCourseDetail(slug);

  return (
    <RoleGuard allowedRoles={COURSE_MANAGER_ROLES}>
      <CourseFormShell mode="edit">
        {isPending ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || !course ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
            <p className="text-sm text-destructive">
              {getApiErrorMessage(error, 'Unable to load course.')}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 h-8 text-xs">
              <Link href="/dashboard/courses">Return to courses</Link>
            </Button>
          </div>
        ) : (
          <CourseForm
            mode="edit"
            course={course}
            onCancel={() => router.push('/dashboard/courses')}
            onSuccess={() => router.push('/dashboard/courses')}
          />
        )}
      </CourseFormShell>
    </RoleGuard>
  );
}
