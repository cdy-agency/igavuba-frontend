'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateDepartmentModal } from '@/components/dashboard/departments/create-department-modal';
import { EditDepartmentModal } from '@/components/dashboard/departments/edit-department-modal';
import { useDashboard } from '@/contexts/dashboard-context';
import { useDeleteDepartment, useDepartmentsList } from '@/hooks/use-departments';
import type { Department } from '@/types/department.types';
import { UserRole } from '@/types/enum';

export function DepartmentsTable() {
  const { role } = useDashboard();
  const canManage = role === UserRole.INSTITUTION_ADMIN;

  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchq(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({ searchq: searchq || undefined }),
    [searchq],
  );

  const { data: departments = [], isPending, isFetching } = useDepartmentsList(queryParams);
  const deleteDepartment = useDeleteDepartment();

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await deleteDepartment.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search departments..."
          className="w-full max-w-xs"
        />
        {canManage ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending || isFetching ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : departments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            {canManage
              ? 'No departments yet. Create one to assign lecturers and courses.'
              : 'No departments found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  {role === UserRole.SUPER_ADMIN ? (
                    <th className="px-4 py-3 font-medium">Institution</th>
                  ) : null}
                  <th className="px-4 py-3 font-medium">Lecturers</th>
                  <th className="px-4 py-3 font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {departments.map((row: Department) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.slug}</p>
                    </td>
                    {role === UserRole.SUPER_ADMIN ? (
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.institution?.name ?? '—'}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">{row.lecturersCount}</td>
                    <td className="px-4 py-3">{row.coursesCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(row.createdAt), 'MMM d, yyyy')}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditDepartment(row)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(row)}
                            disabled={
                              row.coursesCount > 0 || row.lecturersCount > 0
                            }
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage ? (
        <>
          <CreateDepartmentModal open={createOpen} onOpenChange={setCreateOpen} />
          <EditDepartmentModal
            department={editDepartment}
            open={Boolean(editDepartment)}
            onOpenChange={(open) => {
              if (!open) setEditDepartment(null);
            }}
          />
          <AlertDialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete department?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{' '}
                  <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteDepartment.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteDepartment.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteDepartment.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </div>
  );
}
