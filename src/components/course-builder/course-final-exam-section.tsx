'use client';

import { useRouter } from 'next/navigation';
import { Award, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { CourseFinalExamAttachOptions } from '@/components/course-builder/course-final-exam-attach-options';
import { useCourseFinalExam, useRemoveCourseFinalExam } from '@/hooks/use-course-final-exam';
import { buildExamBuilderPath } from '@/lib/course-builder-navigation';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { CourseLifecycleStatus } from '@/types/course-status';

interface CourseFinalExamSectionProps {
  courseId: string;
  courseSlug: string;
  courseStatus: string;
  isSelected: boolean;
  onSelect: () => void;
  readOnly?: boolean;
  onFinalExamChanged?: () => void;
}

export function CourseFinalExamSection({
  courseId,
  courseSlug,
  courseStatus,
  isSelected,
  onSelect,
  readOnly = false,
  onFinalExamChanged,
}: CourseFinalExamSectionProps) {
  const router = useRouter();
  const { data: finalExam, isPending } = useCourseFinalExam(courseId);
  const removeMutation = useRemoveCourseFinalExam(courseId);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleCreateOrEdit = () => {
    if (finalExam?.content.examId) {
      router.push(
        buildExamBuilderPath({
          examId: finalExam.content.examId,
          courseSlug,
          contentId: finalExam.contentId,
          returnTo: 'builder',
        }),
      );
      return;
    }

    router.push(
      buildExamBuilderPath({
        courseSlug,
        returnTo: 'builder',
      }),
    );
  };

  const handleRemove = async () => {
    try {
      await removeMutation.mutateAsync();
      toast.success('Final exam removed from course');
      setConfirmRemove(false);
      onFinalExamChanged?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to remove final exam.'));
    }
  };

  return (
    <>
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Course Final Exam
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 px-3 py-4 text-[11px] text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading final exam...
          </div>
        ) : finalExam ? (
          <button
            type="button"
            onClick={onSelect}
            className={`flex w-full items-center gap-2 border-l-4 px-3 py-3 text-left transition-colors ${
              isSelected
                ? 'border-primary bg-blue-50'
                : 'border-transparent bg-white hover:bg-slate-50'
            }`}
          >
            <Award className="h-4 w-4 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {finalExam.content.title}
              </p>
              <p className="text-[11px] text-slate-500">
                {finalExam.content.questionsCount} questions · Final exam
                {!finalExam.isLive ? ' · Draft revision' : ''}
              </p>
            </div>
          </button>
        ) : (
          <>
            <p className="px-3 py-2 text-[11px] text-slate-500">
              No final exam linked yet. Create a new one or attach an existing exam below.
            </p>
            {!readOnly ? (
              <CourseFinalExamAttachOptions
                courseId={courseId}
                compact
                publishedCourse={courseStatus === CourseLifecycleStatus.PUBLISHED}
                onAttached={() => {
                  onSelect();
                  onFinalExamChanged?.();
                }}
              />
            ) : null}
          </>
        )}

        {!readOnly ? (
          <div className="flex flex-wrap gap-2 px-3 pb-3">
            <Button type="button" size="sm" variant="outline" onClick={handleCreateOrEdit}>
              {finalExam ? (
                <>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit exam
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create final exam
                </>
              )}
            </Button>
            {finalExam ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmRemove(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <DeleteDialog
        isOpen={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remove final exam"
        description="Remove the final exam from this course? The exam content will remain in your library."
        onConfirm={handleRemove}
      />
    </>
  );
}
