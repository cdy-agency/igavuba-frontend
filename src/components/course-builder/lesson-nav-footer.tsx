'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';
import { useCourseBuilderNavigation } from '@/hooks/use-course-builder-navigation';
import { cn } from '@/lib/utils';
import { useAuthReady } from '@/hooks/use-auth-ready';

interface LessonNavFooterProps {
  courseId: string;
}

export function LessonNavFooter({ courseId }: LessonNavFooterProps) {
  const { selectedModuleId, selectedContentId, setSelectedModuleId, setSelectedContentId } =
    useCourseBuilder();

  const authReady = useAuthReady();
  const { previous, next, position, total, isLoading } = useCourseBuilderNavigation(
    courseId,
    selectedModuleId,
    selectedContentId,
    authReady,
  );

  if (isLoading || total === 0) {
    return null;
  }

  const goTo = (lesson: { moduleId: string; contentId: string }) => {
    setSelectedModuleId(lesson.moduleId);
    setSelectedContentId(lesson.contentId);
  };

  return (
    <footer className="shrink-0 border-t border-border/80 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <button
          type="button"
          disabled={!previous}
          onClick={() => previous && goTo(previous)}
          className={cn(
            'inline-flex items-center gap-1 text-[13px] font-medium transition-colors',
            previous
              ? 'text-foreground hover:text-primary'
              : 'cursor-not-allowed text-muted-foreground/40',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <span className="text-[12px] font-medium text-muted-foreground">
          {position} / {total}
        </span>

        <button
          type="button"
          disabled={!next}
          onClick={() => next && goTo(next)}
          className={cn(
            'inline-flex max-w-[45%] items-center gap-1 text-[13px] font-medium transition-colors',
            next
              ? 'text-foreground hover:text-primary'
              : 'cursor-not-allowed text-muted-foreground/40',
          )}
        >
          <span className="truncate">{next?.title ?? 'Next'}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </footer>
  );
}
