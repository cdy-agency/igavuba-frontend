'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, GraduationCap, Loader2, Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCoursesList } from '@/hooks/use-courses';
import { useDepartmentsList } from '@/hooks/use-departments';
import { useBulkInternalEnrollment, useStudentCourses } from '@/hooks/use-internal-enrollment';
import { getCourseLevelLabel } from '@/lib/course-utils';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/course';
import { CourseLevel } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { Department } from '@/types/department.types';
import type { StudentCourseEnrollment, StudentListItem } from '@/types/student.types';

const COURSE_FETCH_LIMIT = 100;

export function AssignCoursesModal({
  open,
  onOpenChange,
  students,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentListItem[];
}) {
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const { data: departmentData } = useDepartmentsList(undefined, open);
  const departments = useMemo<Department[]>(() => departmentData?.data ?? [], [departmentData]);
  const studentId = students.length === 1 ? students[0].id : undefined;
  const { data: studentCoursesData } = useStudentCourses(studentId ?? '', Boolean(studentId) && open);
  const enrolledCourseIds = useMemo(() => new Set<string>(studentCoursesData?.map((entry: StudentCourseEnrollment) => entry.course.id) ?? []), [studentCoursesData]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!open) {
      setSelectedCourseIds([]);
      setSearchInput('');
      setSearch('');
      setDepartmentFilter('all');
      setLevelFilter('all');
      return;
    }

    if (students.length === 1 && students[0]?.department?.id) {
      setDepartmentFilter(students[0].department.id);
    }
  }, [open, students]);

  const level = levelFilter === 'all' ? undefined : (levelFilter as CourseLevel);
  const departmentId = departmentFilter === 'all' ? undefined : departmentFilter;

  const { data, isLoading, isFetching } = useCoursesList({
    page: 1,
    limit: COURSE_FETCH_LIMIT,
    status: CourseLifecycleStatus.PUBLISHED,
    search: search || undefined,
    departmentId,
    level,
  });

  const bulkEnroll = useBulkInternalEnrollment();
  const courses = useMemo<Course[]>(() => data?.data ?? [], [data]);

  const hasActiveFilters =
    Boolean(search) || departmentFilter !== 'all' || levelFilter !== 'all';

  const toggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((prev) =>
      checked ? [...prev, courseId] : prev.filter((id) => id !== courseId),
    );
  };

  const handleAssign = async () => {
    if (!students.length || !selectedCourseIds.length) return;

    await bulkEnroll.mutateAsync({
      learnerProfileIds: students.map((student) => student.id),
      courseIds: selectedCourseIds,
    });

    onOpenChange(false);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setDepartmentFilter('all');
    setLevelFilter('all');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Courses</DialogTitle>
          <DialogDescription>
            Enroll {students.length} student{students.length === 1 ? '' : 's'} in selected
            courses. Internal students get immediate access — no payment required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search courses..."
                className="pl-9"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[190px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value={CourseLevel.BEGINNER}>Beginner</SelectItem>
                <SelectItem value={CourseLevel.INTERMEDIATE}>Intermediate</SelectItem>
                <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {courses.length} course{courses.length === 1 ? '' : 's'} found
              {selectedCourseIds.length > 0
                ? ` · ${selectedCourseIds.length} selected`
                : ''}
            </span>
            {hasActiveFilters ? (
              <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>

          <div
            className={cn(
              'max-h-80 space-y-2 overflow-y-auto rounded-md border p-2',
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
                  Try a different search or filter.
                </p>
              </div>
            ) : (
              courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                const isAlreadyAssigned = enrolledCourseIds.has(course.id);

                return (
                  <label
                    key={course.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border border-transparent p-3 transition-colors',
                      isAlreadyAssigned && 'cursor-not-allowed opacity-60',
                      !isAlreadyAssigned && 'hover:bg-muted/40',
                      isSelected && 'border-primary/20 bg-primary/5',
                    )}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={isSelected}
                      disabled={isAlreadyAssigned}
                      onCheckedChange={(checked) => toggleCourse(course.id, Boolean(checked))}
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {course.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          {course.department?.name ?? 'No department'}
                        </span>
                        {course.level ? (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            {getCourseLevelLabel(course.level)}
                          </Badge>
                        ) : null}
                      </div>
                      {isAlreadyAssigned ? (
                        <p className="text-xs text-muted-foreground">Already assigned to this student</p>
                      ) : null}
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
            disabled={!selectedCourseIds.length || bulkEnroll.isPending}
            onClick={() => void handleAssign()}
          >
            {bulkEnroll.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enroll{selectedCourseIds.length > 0 ? ` (${selectedCourseIds.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
