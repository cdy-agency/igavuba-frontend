'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getCourseStatusClassName } from '@/lib/course-utils';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { Course } from '@/types/course';
import { cn } from '@/lib/utils';

interface BuilderHeaderProps {
  course: Course;
  isSaving?: boolean;
  isPublishing?: boolean;
  onPublish?: () => void;
}

export function BuilderHeader({
  course,
  isSaving,
  isPublishing,
  onPublish,
}: BuilderHeaderProps) {
  const isPublished = course.status === CourseLifecycleStatus.PUBLISHED;
  const statusLabel = getCourseLifecycleLabel(course.status).toUpperCase();

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
        >
          <Link href="/dashboard/courses" aria-label="Back to courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground md:text-base">
              {course.title}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                'h-5 shrink-0 px-2 text-[10px] font-bold uppercase tracking-wide',
                getCourseStatusClassName(course.status),
              )}
            >
              {statusLabel}
            </Badge>
            {isSaving ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 bg-success px-3 text-[12px] font-semibold text-white hover:bg-success/90"
          disabled={isPublishing || isPublished}
          onClick={onPublish}
        >
          {isPublishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Publish
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 border-border/80 px-2.5 text-[12px] font-medium"
            >
              More
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/courses/${course.slug}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit course details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/courses">Back to courses</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
