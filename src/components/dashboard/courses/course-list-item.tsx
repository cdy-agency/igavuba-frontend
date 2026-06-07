'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Archive,
  Calendar,
  GraduationCap,
  Hammer,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
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
  getCourseLevelLabel,
  getCourseStatusClassName,
} from '@/lib/course-utils';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { cn } from '@/lib/utils';

interface CourseListItemProps {
  course: Course;
  onArchive: (course: Course) => void;
  onPermanentDelete: (course: Course) => void;
  className?: string;
}

function MetaItem({ icon: Icon, children }: { icon: typeof User; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
      {children}
    </span>
  );
}

export function CourseListItem({
  course,
  onArchive,
  onPermanentDelete,
  className,
}: CourseListItemProps) {
  const lecturerName = course.lecturer?.user.name ?? course.lecturer?.user.email ?? 'Unassigned';
  const categoryLabel = course.department?.name ?? getCourseLevelLabel(course.level);

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center sm:gap-4">
        <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="list" />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-[0.9375rem]">
              {course.title}
            </h3>
            {categoryLabel && categoryLabel !== '—' ? (
              <Badge
                variant="secondary"
                className="h-5 shrink-0 rounded px-2 text-[0.6875rem] font-medium"
              >
                {categoryLabel}
              </Badge>
            ) : null}
          </div>

          {course.shortDescription ? (
            <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground sm:text-[0.8125rem]">
              {course.shortDescription}
            </p>
          ) : (
            <p className="line-clamp-1 text-xs text-muted-foreground/70">{course.slug}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <MetaItem icon={User}>By {lecturerName}</MetaItem>
            <MetaItem icon={Calendar}>
              {format(new Date(course.updatedAt), 'yyyy-MM-dd')}
            </MetaItem>
            {course.level ? (
              <MetaItem icon={GraduationCap}>{getCourseLevelLabel(course.level)}</MetaItem>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0 lg:flex-row lg:items-center lg:gap-4">
        <Badge
          variant="outline"
          className={cn(
            'shrink-0 px-2.5 py-0.5 text-xs font-medium',
            getCourseStatusClassName(course.status),
          )}
        >
          {getCourseLifecycleLabel(course.status)}
        </Badge>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 border-primary/30 px-2.5 text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Link href={`/dashboard/courses/${course.slug}`}>
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-xs font-medium">
            <Link href={`/builder/course/${course.slug}`}>
              <Hammer className="mr-1 h-3 w-3" />
              Build
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
      </div>
    </article>
  );
}
