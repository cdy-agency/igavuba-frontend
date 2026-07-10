'use client';

import { Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSetCourseFinalExam } from '@/hooks/use-course-final-exam';
import { useExamList } from '@/hooks/use-exam-list';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { examListQueryKeys } from '@/hooks/use-exam-list';
import { useQueryClient } from '@tanstack/react-query';
import { courseFinalExamQueryKeys } from '@/hooks/use-course-final-exam';
import type { ExamListItem } from '@/types/exam.types';

interface CourseFinalExamAttachOptionsProps {
  courseId: string;
  compact?: boolean;
  onAttached?: () => void;
  publishedCourse?: boolean;
}

export function CourseFinalExamAttachOptions({
  courseId,
  compact = false,
  onAttached,
  publishedCourse = false,
}: CourseFinalExamAttachOptionsProps) {
  const queryClient = useQueryClient();
  const { data: exams = [], isPending } = useExamList();
  const setFinalExamMutation = useSetCourseFinalExam(courseId);

  const unlinkedExams = exams.filter((exam: ExamListItem) => !exam.courseId);

  if (isPending) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${compact ? 'px-3 py-2 text-[11px]' : 'text-sm'}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading available exams...
      </div>
    );
  }

  if (unlinkedExams.length === 0) {
    return null;
  }

  const handleAttach = async (contentId: string, title: string) => {
    try {
      await setFinalExamMutation.mutateAsync(contentId);
      await queryClient.invalidateQueries({ queryKey: examListQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: courseFinalExamQueryKeys.detail(courseId) });
      toast.success(`"${title}" linked as the course final exam`);
      if (publishedCourse) {
        toast.info(
          'Submit the course revision for review so an admin can approve it for learners.',
        );
      }
      onAttached?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to link exam to this course.'));
    }
  };

  return (
    <div className={compact ? 'space-y-2 px-3 pb-2' : 'space-y-3'}>
      <p className={compact ? 'text-[11px] text-slate-500' : 'text-sm text-muted-foreground'}>
        Link an existing exam to this course:
      </p>
      <div className="space-y-1.5">
        {unlinkedExams.map((exam: ExamListItem) => (
          <Button
            key={exam.examId}
            type="button"
            variant="outline"
            size="sm"
            className={compact ? 'h-8 w-full justify-start text-[11px]' : 'w-full justify-start'}
            disabled={setFinalExamMutation.isPending}
            onClick={() => handleAttach(exam.contentId, exam.title)}
          >
            {setFinalExamMutation.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Link2 className="mr-2 h-3.5 w-3.5" />
            )}
            {exam.title}
            <span className="ml-auto text-muted-foreground">{exam.questionsCount} Q</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
