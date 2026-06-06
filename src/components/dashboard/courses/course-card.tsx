'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Archive, BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Course } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import {
  getCourseAccessTypeLabel,
  getCourseLevelLabel,
  getCourseStatusClassName,
} from '@/lib/course-utils';
import { getCourseLifecycleLabel } from '@/lib/status-utils';

interface CourseCardProps {
  course: Course;
  onArchive: (course: Course) => void;
  onPermanentDelete: (course: Course) => void;
}

export function CourseCard({ course, onArchive, onPermanentDelete }: CourseCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative aspect-video bg-muted">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-40" />
          </div>
        )}
        <Badge
          variant="outline"
          className={`absolute left-3 top-3 ${getCourseStatusClassName(course.status)}`}
        >
          {getCourseLifecycleLabel(course.status)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 font-semibold text-foreground">{course.title}</h3>
          <p className="text-xs text-muted-foreground">{course.slug}</p>
        </div>

        {course.shortDescription ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.shortDescription}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{getCourseLevelLabel(course.level)}</span>
          <span>·</span>
          <span>{getCourseAccessTypeLabel(course.accessType)}</span>
          <span>·</span>
          <span>{format(new Date(course.updatedAt), 'MMM d, yyyy')}</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/courses/${course.slug}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {course.status !== CourseLifecycleStatus.ARCHIVED ? (
                <DropdownMenuItem onClick={() => onArchive(course)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Course
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onPermanentDelete(course)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
