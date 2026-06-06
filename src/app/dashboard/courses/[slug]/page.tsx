'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Button } from '@/components/ui/button';
import { CourseForm } from '@/components/dashboard/courses/course-form';
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
              Edit course
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Update course details and media. The course URL slug remains unchanged.
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || !course ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
            <p className="text-sm text-destructive">
              {getApiErrorMessage(error, 'Unable to load course.')}
            </p>
            <Button asChild variant="outline" className="mt-4">
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
      </div>
    </RoleGuard>
  );
}
