'use client';

import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { CourseCard } from '@/components/dashboard/courses/course-card';
import { CourseCardsGridSkeleton } from '@/components/dashboard/courses/course-card-skeleton';
import { CourseListItem } from '@/components/dashboard/courses/course-list-item';
import { CourseListSkeleton } from '@/components/dashboard/courses/course-list-skeleton';
import { CourseManagementCoursesFilters } from '@/components/dashboard/courses/course-management-courses-filters';
import { CoursesPaginationFooter } from '@/components/dashboard/courses/courses-pagination-footer';
import { type CourseStatusTab } from '@/components/dashboard/courses/course-status-tabs';
import { useCourseStatusCounts } from '@/hooks/use-course-status-counts';
import {
  useArchiveCourse,
  useCoursesList,
  usePermanentlyDeleteCourse,
} from '@/hooks/use-courses';
import type { Course, CourseDepartment } from '@/types/course';
import { CourseLevel } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type ViewMode = 'list' | 'cards';

function toStatusFilter(tab: CourseStatusTab): CourseLifecycleStatus | undefined {
  return tab === 'ALL' ? undefined : tab;
}

function extractDepartments(courses: Course[]): CourseDepartment[] {
  const map = new Map<string, CourseDepartment>();
  for (const course of courses) {
    if (course.department) {
      map.set(course.department.id, course.department);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

interface CoursesTableContentProps {
  searchInput: string;
  viewMode: ViewMode;
}

export function CoursesTableContent({ searchInput, viewMode }: CoursesTableContentProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<CourseStatusTab>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [courseToArchive, setCourseToArchive] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const level =
    levelFilter === 'all' ? undefined : (levelFilter as CourseLevel);
  const departmentId = departmentFilter === 'all' ? undefined : departmentFilter;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: departmentSource } = useCoursesList({ limit: 100, page: 1 });

  const departments = useMemo(
    () => extractDepartments(departmentSource?.data ?? []),
    [departmentSource],
  );

  const { counts: statusCounts, isLoading: isLoadingCounts } = useCourseStatusCounts({
    search: search || undefined,
    level,
    departmentId,
  });

  const { data, isPending, isFetching, isError, error } = useCoursesList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: toStatusFilter(statusTab),
    level,
    departmentId,
  });

  const archiveCourseMutation = useArchiveCourse();
  const permanentlyDeleteCourseMutation = usePermanentlyDeleteCourse();

  useEffect(() => {
    if (isError) {
      toast.error(getApiErrorMessage(error, 'Unable to load courses.'));
    }
  }, [isError, error]);

  const courses: Course[] = data?.data ?? [];
  const pagination = data?.pagination;
  const showInitialSkeleton = isPending || (isFetching && courses.length === 0);

  const handleConfirmArchive = async () => {
    if (!courseToArchive) return;
    await archiveCourseMutation.mutateAsync(courseToArchive.id);
    setCourseToArchive(null);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!courseToDelete) return;
    await permanentlyDeleteCourseMutation.mutateAsync(courseToDelete.id);
    setCourseToDelete(null);
  };

  return (
    <>
      <CourseManagementCoursesFilters
        statusTab={statusTab}
        onStatusChange={(value) => {
          setStatusTab(value);
          setPage(1);
        }}
        departmentId={departmentFilter}
        onDepartmentChange={(value) => {
          setDepartmentFilter(value);
          setPage(1);
        }}
        level={levelFilter}
        onLevelChange={(value) => {
          setLevelFilter(value);
          setPage(1);
        }}
        departments={departments}
        statusCounts={statusCounts}
        isLoadingCounts={isLoadingCounts}
      />

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {showInitialSkeleton ? (
            <CourseListSkeleton count={PAGE_SIZE} />
          ) : courses.length === 0 ? (
            <EmptyCoursesState />
          ) : (
            <div
              className={cn(
                'space-y-3',
                isFetching && 'pointer-events-none opacity-60',
              )}
            >
              {courses.map((course) => (
                <CourseListItem
                  key={course.id}
                  course={course}
                  onArchive={setCourseToArchive}
                  onPermanentDelete={setCourseToDelete}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {showInitialSkeleton ? (
            <CourseCardsGridSkeleton count={PAGE_SIZE} />
          ) : courses.length === 0 ? (
            <EmptyCoursesState />
          ) : (
            <div
              className={cn(
                'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
                isFetching && 'pointer-events-none opacity-60',
              )}
            >
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onArchive={setCourseToArchive}
                  onPermanentDelete={setCourseToDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CoursesPaginationFooter
        total={pagination?.total ?? 0}
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 1}
        limit={pagination?.limit ?? PAGE_SIZE}
        onPageChange={setPage}
        isLoading={showInitialSkeleton}
      />

      <ConfirmDialog
        isOpen={Boolean(courseToArchive)}
        onOpenChange={(open) => {
          if (!open) setCourseToArchive(null);
        }}
        title="Archive course"
        description={
          courseToArchive
            ? `Archive "${courseToArchive.title}"? It will be hidden from active listings but can remain accessible under Archived.`
            : undefined
        }
        confirmText="Archive Course"
        onConfirm={handleConfirmArchive}
      />

      <DeleteDialog
        isOpen={Boolean(courseToDelete)}
        onOpenChange={(open) => {
          if (!open) setCourseToDelete(null);
        }}
        title="Delete permanently"
        description={
          courseToDelete
            ? `Permanently delete "${courseToDelete.title}"? This removes the course and all related modules, skills, and tools. This action cannot be undone.`
            : undefined
        }
        confirmText="Delete Permanently"
        onConfirm={handleConfirmPermanentDelete}
      />
    </>
  );
}

function EmptyCoursesState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center shadow-sm">
      <p className="text-sm font-medium text-foreground">No courses found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}
