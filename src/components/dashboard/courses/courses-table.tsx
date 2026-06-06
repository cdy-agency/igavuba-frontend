'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Archive,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { CourseCard } from '@/components/dashboard/courses/course-card';
import { CourseCardsGridSkeleton } from '@/components/dashboard/courses/course-card-skeleton';
import {
  CourseStatusTabs,
  type CourseStatusTab,
} from '@/components/dashboard/courses/course-status-tabs';
import {
  useArchiveCourse,
  useCoursesList,
  usePermanentlyDeleteCourse,
} from '@/hooks/use-courses';
import type { Course } from '@/types/course';
import { CourseLifecycleStatus } from '@/types/course-status';
import {
  getCourseAccessTypeLabel,
  getCourseLevelLabel,
  getCourseStatusClassName,
} from '@/lib/course-utils';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

const PAGE_SIZE = 10;

type ViewMode = 'table' | 'cards';

function toStatusFilter(tab: CourseStatusTab): CourseLifecycleStatus | undefined {
  return tab === 'ALL' ? undefined : tab;
}

export function CoursesTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<CourseStatusTab>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [courseToArchive, setCourseToArchive] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isFetching, isError, error } = useCoursesList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: toStatusFilter(statusTab),
  });

  const archiveCourseMutation = useArchiveCourse();
  const permanentlyDeleteCourseMutation = usePermanentlyDeleteCourse();

  useEffect(() => {
    if (isError) {
      toast.error(getApiErrorMessage(error, 'Unable to load courses.'));
    }
  }, [isError, error]);

  const columns = useMemo<DataTableColumn<Course>[]>(
    () => [
      {
        id: 'title',
        header: 'Course',
        skeleton: 'double',
        cell: (row) => (
          <div className="min-w-[12rem]">
            <p className="font-medium text-foreground">{row.title}</p>
            <p className="text-xs text-muted-foreground">{row.slug}</p>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        skeleton: 'badge',
        cell: (row) => (
          <Badge variant="outline" className={getCourseStatusClassName(row.status)}>
            {getCourseLifecycleLabel(row.status)}
          </Badge>
        ),
      },
      {
        id: 'level',
        header: 'Level',
        className: 'text-muted-foreground',
        skeleton: 'text',
        cell: (row) => getCourseLevelLabel(row.level),
      },
      {
        id: 'access',
        header: 'Access',
        className: 'text-muted-foreground',
        skeleton: 'text',
        cell: (row) => getCourseAccessTypeLabel(row.accessType),
      },
      {
        id: 'updated',
        header: 'Updated',
        className: 'text-muted-foreground whitespace-nowrap',
        skeleton: 'text',
        cell: (row) => format(new Date(row.updatedAt), 'MMM d, yyyy'),
      },
      {
        id: 'actions',
        header: '',
        headerClassName: 'text-right w-[4rem]',
        className: 'text-right',
        skeleton: 'narrow',
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/courses/${row.slug}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {row.status !== CourseLifecycleStatus.ARCHIVED ? (
                <DropdownMenuItem onClick={() => setCourseToArchive(row)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Course
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setCourseToDelete(row)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const courses: Course[] = data?.data ?? [];
  const pagination = data?.pagination;
  const isLoading = isPending || isFetching;
  const showCardsSkeleton = isPending || (isFetching && courses.length === 0);

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
    <div className="space-y-4">
      <CourseStatusTabs
        value={statusTab}
        onChange={(value) => {
          setStatusTab(value);
          setPage(1);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          <Button
            type="button"
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="mr-2 h-4 w-4" />
            Table
          </Button>
          <Button
            type="button"
            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Cards
          </Button>
        </div>

        <Button asChild>
          <Link href="/dashboard/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New course
          </Link>
        </Button>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={courses}
          getRowKey={(row) => row.id}
          isLoading={isLoading}
          skeletonRowCount={PAGE_SIZE}
          emptyMessage="No courses found for the selected filters."
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search courses..."
          currentPage={pagination?.page ?? page}
          totalPages={pagination?.totalPages ?? 1}
          totalItems={pagination?.total ?? 0}
          itemsPerPage={pagination?.limit ?? PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <DataTableToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search courses..."
          />
          <div className="p-4">
            {showCardsSkeleton ? (
              <CourseCardsGridSkeleton count={PAGE_SIZE} />
            ) : courses.length === 0 ? (
              <div className="px-2 py-12 text-center text-sm text-muted-foreground">
                No courses found for the selected filters.
              </div>
            ) : (
              <div
                className={
                  isFetching ? 'pointer-events-none grid gap-4 opacity-60 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                }
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
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
            {(pagination?.total ?? 0) > 0 ? (
              <p className="text-sm text-muted-foreground">
                {pagination?.total ?? 0}{' '}
                {(pagination?.total ?? 0) === 1 ? 'result' : 'results'}
              </p>
            ) : (
              <span />
            )}
            {isFetching && courses.length === 0 ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
              </div>
            ) : (pagination?.totalPages ?? 1) > 1 ? (
              <Pagination
                currentPage={pagination?.page ?? page}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={setPage}
                itemsPerPage={pagination?.limit ?? PAGE_SIZE}
                totalItems={pagination?.total ?? 0}
              />
            ) : null}
          </div>
        </div>
      )}

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
    </div>
  );
}
