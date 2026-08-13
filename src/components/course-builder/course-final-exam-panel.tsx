'use client';

import { useRouter } from 'next/navigation';
import { Award, Loader2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseFinalExamAttachOptions } from '@/components/course-builder/course-final-exam-attach-options';
import { CourseFinalExamReviewBanner } from '@/components/course-builder/course-final-exam-review-banner';
import { BUILDER_CONTENT_OUTER_CLASS } from '@/components/course-builder/builder-lesson-shell';
import { useCourseFinalExam } from '@/hooks/use-course-final-exam';
import { buildExamBuilderPath } from '@/lib/course-builder-navigation';
import { CourseLifecycleStatus } from '@/types/course-status';
import { CourseRevisionStatus } from '@/types/course-revision';
import { cn } from '@/lib/utils';

interface CourseFinalExamPanelProps {
  courseId: string;
  courseSlug: string;
  courseStatus: string;
  hasUnpublishedChanges?: boolean;
  revisionStatus?: CourseRevisionStatus | null;
  requireCourseApproval?: boolean;
  readOnly?: boolean;
  canResubmit?: boolean;
  isSubmittingRevision?: boolean;
  onSubmitRevision?: () => void;
  onResubmitRevision?: () => void;
  onFinalExamChanged?: () => void;
}

export function CourseFinalExamPanel({
  courseId,
  courseSlug,
  courseStatus,
  hasUnpublishedChanges,
  revisionStatus,
  requireCourseApproval = true,
  readOnly = false,
  canResubmit = true,
  isSubmittingRevision = false,
  onSubmitRevision,
  onResubmitRevision,
  onFinalExamChanged,
}: CourseFinalExamPanelProps) {
  const router = useRouter();
  const { data: finalExam, isPending } = useCourseFinalExam(courseId);

  if (isPending) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!finalExam) {
    return (
      <div className="mx-auto flex min-h-[24rem] max-w-lg flex-col items-center justify-center gap-4 text-center">
        <Award className="h-10 w-10 text-amber-600" />
        <div>
          <h2 className="text-lg font-semibold">Course Final Exam</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Link or create a final exam that appears at the bottom of the course for learners,
            before they complete the course.
          </p>
        </div>
        {!readOnly ? (
          <div className="w-full space-y-4">
            <CourseFinalExamAttachOptions
              courseId={courseId}
              publishedCourse={courseStatus === CourseLifecycleStatus.PUBLISHED}
              onAttached={onFinalExamChanged}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(buildExamBuilderPath({ courseSlug, returnTo: 'builder' }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create new final exam
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(BUILDER_CONTENT_OUTER_CLASS, 'space-y-6')}>
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-amber-50 p-3">
          <Award className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Course final exam
          </p>
          <h2 className="mt-1 text-2xl font-bold">{finalExam.content.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This exam appears at the bottom of the learner curriculum, after all modules and before
            course completion.
          </p>
        </div>
      </div>

      <CourseFinalExamReviewBanner
        courseStatus={courseStatus}
        hasUnpublishedChanges={hasUnpublishedChanges}
        revisionStatus={revisionStatus}
        requireCourseApproval={requireCourseApproval}
        readOnly={readOnly}
        onSubmitRevision={onSubmitRevision}
        onResubmitRevision={onResubmitRevision}
        isSubmitting={isSubmittingRevision}
        canResubmit={canResubmit}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border px-4 py-3">
          <p className="text-xs text-muted-foreground">Questions</p>
          <p className="mt-1 text-lg font-semibold">{finalExam.content.questionsCount}</p>
        </div>
        <div className="rounded-lg border px-4 py-3">
          <p className="text-xs text-muted-foreground">Passing score</p>
          <p className="mt-1 text-lg font-semibold">{finalExam.content.passingScore}%</p>
        </div>
        <div className="rounded-lg border px-4 py-3">
          <p className="text-xs text-muted-foreground">Max attempts</p>
          <p className="mt-1 text-lg font-semibold">{finalExam.content.maxAttempts}</p>
        </div>
      </div>

      {!readOnly ? (
        <Button
          type="button"
          onClick={() =>
            router.push(
              buildExamBuilderPath({
                examId: finalExam.content.examId ?? undefined,
                courseSlug,
                contentId: finalExam.contentId,
                returnTo: 'builder',
              }),
            )
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          Open exam builder
        </Button>
      ) : null}
    </div>
  );
}
