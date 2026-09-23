'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStartCourseRevision } from '@/hooks/use-course-revision';
import { moduleQueryKeys } from '@/hooks/use-course-modules';
import { courseQueryKeys } from '@/hooks/use-courses';
import { CourseLifecycleStatus } from '@/types/course-status';

/** Prevents duplicate start-revision calls across remounts / Strict Mode. */
const revisionBootstrapStarted = new Set<string>();

interface CourseRevisionBootstrapProps {
  courseId: string;
  courseStatus: string;
  isOwner: boolean;
  readOnly: boolean;
  onReady?: () => void;
}

/**
 * Ensures a draft revision workspace exists before the builder loads modules.
 * Runs silently — no toast when a draft already exists.
 */
export function CourseRevisionBootstrap({
  courseId,
  courseStatus,
  isOwner,
  readOnly,
  onReady,
}: CourseRevisionBootstrapProps) {
  const queryClient = useQueryClient();
  const { mutate: startRevision } = useStartCourseRevision();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (
      !courseId ||
      readOnly ||
      !isOwner ||
      courseStatus !== CourseLifecycleStatus.PUBLISHED
    ) {
      onReadyRef.current?.();
      return;
    }

    if (revisionBootstrapStarted.has(courseId)) {
      onReadyRef.current?.();
      return;
    }

    revisionBootstrapStarted.add(courseId);

    startRevision(
      { courseId, silent: true },
      {
        onSettled: () => {
          void queryClient.invalidateQueries({ queryKey: moduleQueryKeys.list(courseId) });
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
          onReadyRef.current?.();
        },
      },
    );
  }, [courseId, courseStatus, isOwner, readOnly, queryClient, startRevision]);

  return null;
}
