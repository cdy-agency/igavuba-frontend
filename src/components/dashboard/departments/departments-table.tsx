'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MoveRight, Pencil, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DepartmentIcon } from '@/components/dashboard/departments/department-icon';
import { EditDepartmentModal } from '@/components/dashboard/departments/edit-department-modal';
import { DeleteDepartmentDialog } from '@/components/dashboard/departments/delete-department-dialog';
import { AssignDepartmentCoursesModal } from '@/components/dashboard/departments/assign-department-courses-modal';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { useDashboard } from '@/contexts/dashboard-context';
import { useDepartmentsList, useDeleteDepartment } from '@/hooks/use-departments';
import { deleteDepartment as deleteDepartmentApi } from '@/api/department.api';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type { Department } from '@/types/department.types';
import { UserRole } from '@/types/enum';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { DashboardTableLoadingSkeleton } from '@/components/dashboard/shared/dashboard-skeletons';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export function DepartmentsTable() {
  const { role } = useDashboard();
  const canManage = role === UserRole.INSTITUTION_ADMIN;
  const canAssignCourses = canManage || role === UserRole.LECTURER;
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [assignDepartment, setAssignDepartment] = useState<Department | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const deleteDepartment = useDeleteDepartment();

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const results = await Promise.allSettled(
      selectedIds.map((id) => deleteDepartmentApi(id)),
    );

    const hasError = results.some((result) => result.status === 'rejected');
    if (hasError) {
      const firstError = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      toast.error(
        getApiErrorMessage(
          firstError?.reason,
          'Unable to delete selected departments.',
        ),
      );
    } else {
      toast.success(
        `Deleted ${selectedIds.length} selected department${
          selectedIds.length === 1 ? '' : 's'
        } successfully.`,
      );
    }

    setSelectedIds([]);
    setBulkDeleteOpen(false);
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    queryClient.invalidateQueries({ queryKey: ['lecturers', 'departments'] });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchq(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      searchq: searchq || undefined,
    }),
    [page, searchq],
  );

  const { data, isPending, isFetching } = useDepartmentsList(queryParams);
  const departments = data?.data ?? [];
  const pagination = data?.pagination;

  const allSelected =
    departments.length > 0 &&
    departments.every((row: Department) => selectedIds.includes(row.id));

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? departments.map((row: Department) => row.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search departments..."
              className="h-10 pl-9"
            />
          </div>
          {canManage && selectedIds.length > 0 ? (
            <Button variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
              Delete all selected
            </Button>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          {isPending || isFetching ? (
            <DashboardTableLoadingSkeleton columnCount={6} rowCount={4} showPagination={false} />
          ) : departments.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              {canManage
                ? 'No departments yet. Create one to assign lecturers and courses.'
                : 'No departments found.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-muted/25 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {canManage ? (
                        <th className="w-12 px-4 py-3">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                            aria-label="Select all departments"
                          />
                        </th>
                      ) : null}
                    <th className="px-4 py-3 font-medium">Name</th>
                    {isSuperAdmin ? (
                      <th className="px-4 py-3 font-medium">Institution</th>
                    ) : null}
                    <th className="px-4 py-3 font-medium">Lecturers</th>
                    <th className="px-4 py-3 font-medium">Courses</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    {canManage ? (
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((row: Department, index: number) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-border/60 transition-colors last:border-b-0',
                        index % 2 === 1 ? 'bg-primary/[0.03]' : 'bg-background',
                        selectedIds.includes(row.id) && 'bg-primary/[0.06]',
                      )}
                    >
                      {canManage ? (
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedIds.includes(row.id)}
                            onCheckedChange={(checked) => toggleOne(row.id, Boolean(checked))}
                            aria-label={`Select ${row.name}`}
                          />
                        </td>
                      ) : null}
                      <td className="px-4 py-4">
                        <div className="flex min-w-[12rem] items-center gap-3">
                          <DepartmentIcon name={row.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{row.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{row.slug}</p>
                          </div>
                        </div>
                      </td>
                      {isSuperAdmin ? (
                        <td className="px-4 py-4 text-muted-foreground">
                          {row.institution?.name ?? '—'}
                        </td>
                      ) : null}
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className="gap-1 border-border/80 bg-muted/30 font-normal"
                        >
                          <Users className="h-3 w-3" />
                          {row.lecturersCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className="gap-1 border-border/80 bg-muted/30 font-normal"
                        >
                          {row.coursesCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(row.createdAt), 'MMM d, yyyy')}
                      </td>
                      {canAssignCourses ? (
                        <td className="px-4 py-4">
                          <DashboardActionGroup className="justify-end">
                            <DashboardActionIconButton
                              label={canManage ? 'Manage courses' : 'Assign courses'}
                              icon={MoveRight}
                              variant="default"
                              onClick={() => setAssignDepartment(row)}
                            />
                            {canManage ? (
                              <>
                                <DashboardActionIconButton
                                  label="Edit"
                                  icon={Pencil}
                                  variant="primary"
                                  onClick={() => setEditDepartment(row)}
                                />
                                <DashboardActionIconButton
                                  label="Delete"
                                  icon={Trash2}
                                  variant="destructive"
                                  onClick={() => setDeleteTarget(row)}
                                />
                              </>
                            ) : null}
                          </DashboardActionGroup>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
                <p>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
          )}
        </div>
      </div>

      {canAssignCourses ? (
        <>
          <AssignDepartmentCoursesModal
            open={Boolean(assignDepartment)}
            onOpenChange={(open) => {
              if (!open) setAssignDepartment(null);
            }}
            department={assignDepartment}
          />
          {canManage ? (
            <>
              <EditDepartmentModal
                department={editDepartment}
                open={Boolean(editDepartment)}
                onOpenChange={(open) => {
                  if (!open) setEditDepartment(null);
                }}
              />
              <DeleteDepartmentDialog
                department={deleteTarget}
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                  if (!open) setDeleteTarget(null);
                }}
              />
              <DeleteDialog
                isOpen={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected departments"
                description={`Are you sure you want to delete ${selectedIds.length} selected departments? This action cannot be undone.`}
                confirmText={`Delete ${selectedIds.length}`}
                onConfirm={handleBulkDelete}
              />
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}
