'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAssignCoursesToDepartment, useCoursesList } from '@/hooks/use-courses';
import { getCourseLevelLabel } from '@/lib/course-utils';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/course';
import type { Department } from '@/types/department.types';

const COURSE_FETCH_LIMIT = 100;

export function AssignDepartmentCoursesModal({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}) {
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedCourseIds([]);
      setSearchInput('');
      setSearch('');
    }
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useCoursesList(
    {
      page: 1,
      limit: COURSE_FETCH_LIMIT,
      search: search || undefined,
    },
    open,
  );

  const departmentId = department?.id ?? ''; 
  const courses = useMemo<Course[]>(
    () =>
      data?.data
        .filter((course: Course) => course.departmentId !== departmentId)
        .sort((left: Course, right: Course) => left.title.localeCompare(right.title)) ?? [],
    [data, departmentId],
  );

  const assignCourses = useAssignCoursesToDepartment();

  const selectedCount = selectedCourseIds.length;
  const isSubmitting = assignCourses.isPending;

  const toggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((current) =>
      checked ? [...current, courseId] : current.filter((value) => value !== courseId),
    );
  };

  const handleAssign = async () => {
    if (!department || selectedCount === 0) return;

    await assignCourses.mutateAsync({
      departmentId: department.id,
      courseIds: selectedCourseIds,
    });

    onOpenChange(false);
  };

  const foundCoursesLabel = `${courses.length} course${courses.length === 1 ? '' : 's'} available`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign courses to {department?.name ?? 'department'}</DialogTitle>
          <DialogDescription>
            Assign existing courses into this department so learners can find them under the
            department and reporting counts stay in sync.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search courses..."
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {department?.coursesCount ?? 0} course{department?.coursesCount === 1 ? '' : 's'} already assigned
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{foundCoursesLabel}</span>
            {selectedCount > 0 ? (
              <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                {selectedCount} selected
              </Badge>
            ) : null}
          </div>

          <div
            className={cn(
              'max-h-96 space-y-2 overflow-y-auto rounded-md border p-2',
              isFetching && !isLoading && 'opacity-70',
            )}
          >
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : courses.length === 0 ? (
              <div className="px-3 py-10 text-center">
                <p className="text-sm font-medium text-foreground">No courses found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or open a course to assign it to this department.
                </p>
              </div>
            ) : (
              courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);

                return (
                  <label
                    key={course.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border border-transparent p-3 transition-colors hover:bg-muted/40',
                      isSelected && 'border-primary/20 bg-primary/5',
                    )}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleCourse(course.id, Boolean(checked))}
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-snug text-foreground">
                          {course.title}
                        </p>
                        {course.department ? (
                          <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px] font-normal">
                            {course.department.name}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 shrink-0" />
                          {course.level ? getCourseLevelLabel(course.level) : 'No level'}
                        </span>
                        {course.department ? (
                          <span className="text-muted-foreground">Already in {course.department.name}</span>
                        ) : (
                          <span className="text-muted-foreground">No department assigned</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedCount || isSubmitting}
            onClick={() => void handleAssign()}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Assign{selectedCount ? ` (${selectedCount})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
