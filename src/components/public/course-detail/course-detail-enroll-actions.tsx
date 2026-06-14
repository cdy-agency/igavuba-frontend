'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAccessToken, getRefreshToken } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  useCourseEnrollmentStatus,
  useCreateEnrollment,
} from '@/hooks/use-enrollment';
import { UserRole } from '@/types/enum';

interface CourseDetailEnrollActionsProps {
  courseId: string;
  courseSlug: string;
}

export function CourseDetailEnrollActions({
  courseId,
  courseSlug,
}: CourseDetailEnrollActionsProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const createEnrollment = useCreateEnrollment();
  const hasStoredSession = Boolean(getAccessToken() || getRefreshToken());

  const shouldCheckEnrollment = !authLoading && isAuthenticated;
  const {
    data: enrollmentStatus,
    isPending: statusLoading,
    isError: statusError,
  } = useCourseEnrollmentStatus(courseSlug, shouldCheckEnrollment);

  const isLearner = user?.role === UserRole.LEARNER;
  const isEnrolled = enrollmentStatus?.isEnrolled ?? false;
  const registerHref = `/register?redirect=${encodeURIComponent(`/courses/${courseSlug}`)}`;
  const showAuthSpinner = authLoading && hasStoredSession;
  const showEnrollmentSpinner =
    shouldCheckEnrollment && statusLoading && !statusError && !enrollmentStatus;

  const learnHref = `/learn/${courseSlug}`;

  const handleEnroll = async () => {
    if (!isLearner) {
      router.push('/dashboard');
      return;
    }

    await createEnrollment.mutateAsync({ courseId });
    router.push(learnHref);
  };

  if (showAuthSpinner || showEnrollmentSpinner) {
    return (
      <div className="flex h-11 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button asChild className="h-11 w-full rounded-none text-base font-bold">
        <Link href={registerHref}>Sign up to enroll</Link>
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <div className="space-y-2">
        <Button asChild className="h-11 w-full rounded-none text-base font-bold">
          <Link href={learnHref}>Continue Learning</Link>
        </Button>
        {enrollmentStatus?.progress != null && enrollmentStatus.progress > 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            {Math.round(enrollmentStatus.progress)}% complete
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Button
      type="button"
      className="h-11 w-full rounded-none text-base font-bold"
      disabled={createEnrollment.isPending}
      onClick={handleEnroll}
    >
      {createEnrollment.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : !isLearner ? (
        'Available for learners'
      ) : (
        'Enroll now'
      )}
    </Button>
  );
}
