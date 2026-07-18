'use client';

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
import { Loader2 } from 'lucide-react';
import { useDeleteDepartment } from '@/hooks/use-departments';
import type { Department } from '@/types/department.types';

export function DeleteDepartmentDialog({
  department,
  open,
  onOpenChange,
}: {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteDepartment = useDeleteDepartment();

  const hasDependencies =
    (department?.coursesCount ?? 0) > 0 || (department?.lecturersCount ?? 0) > 0;

  const handleDelete = async () => {
    if (!department || hasDependencies) return;
    await deleteDepartment.mutateAsync(department.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete department</AlertDialogTitle>
          <AlertDialogDescription>
            {hasDependencies ? (
              <>
                <span className="font-medium text-foreground">{department?.name}</span>{' '}
                cannot be deleted because it has{' '}
                {department?.lecturersCount ? `${department.lecturersCount} lecturer(s)` : null}
                {department?.lecturersCount && department?.coursesCount ? ' and ' : null}
                {department?.coursesCount ? `${department.coursesCount} course(s)` : null}{' '}
                assigned. Reassign or remove them first.
              </>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">{department?.name}</span>? This
                action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDepartment.isPending}>
            {hasDependencies ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {!hasDependencies ? (
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteDepartment.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleteDepartment.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
