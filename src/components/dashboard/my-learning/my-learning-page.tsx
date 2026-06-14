'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { RoleGuard } from '@/guards/role-guard';
import { useMyEnrollments } from '@/hooks/use-enrollment';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { MyEnrollmentItem } from '@/types/enrollment';
import { UserRole } from '@/types/enum';
import { formatCatalogDuration } from '@/lib/catalog-utils';

function MyLearningContent() {
  const authReady = useAuthReady();
  const { data: enrollments = [], isPending, isError } = useMyEnrollments(authReady);

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 bg-destructive/10 px-6 py-10 text-center">
        <p className="font-medium text-destructive">Unable to load your enrollments.</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">No enrolled courses yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the catalog and enroll in a course to start learning.
        </p>
        <Button asChild className="mt-6 rounded-none">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {enrollments.map((enrollment: MyEnrollmentItem) => (
        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: MyEnrollmentItem }) {
  const course = enrollment.course;
  const durationLabel = formatCatalogDuration(course.estimatedHours);
  const progress = Math.round(enrollment.progress ?? 0);

  return (
    <article className="flex h-full flex-col border border-border bg-background shadow-sm">
      <div className="relative aspect-[16/9] bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {course.institution.name}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold text-foreground">{course.title}</h3>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {durationLabel}
          </span>
          <span>{enrollment.status}</span>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-auto pt-5">
          <Button asChild className="w-full rounded-none">
            <Link href={`/learn/${course.slug}`}>Continue Learning</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function MyLearningPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <div className="space-y-6">
        <PageHeader
          title="My Learning"
          description="Continue your enrolled courses and track your progress."
        />
        <MyLearningContent />
      </div>
    </RoleGuard>
  );
}
