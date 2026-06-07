'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Archive, Calendar, Hammer, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CourseThumbnail } from '@/components/dashboard/courses/course-thumbnail';
import type { Course } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import {
  getCourseAccessTypeLabel,
  getCourseLevelLabel,
  getCourseStatusClassName,
} from '@/lib/course-utils';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  onArchive: (course: Course) => void;
  onPermanentDelete: (course: Course) => void;
}

export function CourseCard({ course, onArchive, onPermanentDelete }: CourseCardProps) {
  const categoryLabel = course.department?.name ?? getCourseLevelLabel(course.level);

  return (
    <article className="flex flex-col gap-3 rounded border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="card" />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {course.title}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 px-2 py-0 text-[0.625rem] font-medium',
                getCourseStatusClassName(course.status),
              )}
            >
              {getCourseLifecycleLabel(course.status)}
            </Badge>
          </div>

          {categoryLabel && categoryLabel !== '—' ? (
            <p className="text-[0.6875rem] font-medium text-muted-foreground">{categoryLabel}</p>
          ) : (
            <p className="text-[0.6875rem] text-muted-foreground/70">{course.slug}</p>
          )}
        </div>
      </div>

      {course.shortDescription ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {course.shortDescription}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3 text-primary/70" />
          {format(new Date(course.updatedAt), 'yyyy-MM-dd')}
        </span>
        <span>{getCourseAccessTypeLabel(course.accessType)}</span>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 pt-2.5">
        <Button asChild variant="outline" size="sm" className="h-7 flex-1 text-xs">
          <Link href={`/builder/course/${course.slug}`}>
            <Hammer className="mr-1 h-3 w-3" />
            Build
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <Link href={`/dashboard/courses/${course.slug}`}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {course.status !== CourseLifecycleStatus.ARCHIVED ? (
              <DropdownMenuItem onClick={() => onArchive(course)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive course
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onPermanentDelete(course)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
