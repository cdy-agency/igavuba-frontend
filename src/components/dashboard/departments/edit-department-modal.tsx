'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  updateDepartmentSchema,
  type UpdateDepartmentFormValues,
} from '@/schema/department.schema';
import { useUpdateDepartment } from '@/hooks/use-departments';
import type { Department } from '@/types/department.types';

export function EditDepartmentModal({
  department,
  open,
  onOpenChange,
}: {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateDepartment = useUpdateDepartment(department?.id ?? '');

  const form = useForm<UpdateDepartmentFormValues>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: { name: department?.name ?? '' },
  });

  useEffect(() => {
    if (open && department) {
      form.reset({ name: department.name });
    }
  }, [department, form, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!department) return;

    await updateDepartment.mutateAsync({ name: values.name });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md sm:rounded-xl">
        <DialogHeader className="space-y-3 border-b border-border/60 bg-muted/30 px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pencil className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="space-y-1 pt-0.5">
              <DialogTitle className="text-lg">Edit department</DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed">
                Update the department name used for lecturers and courses.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="space-y-5 px-6 py-5" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="edit-department-name">Department name</Label>
            <Input
              id="edit-department-name"
              placeholder="e.g. Computer Science"
              disabled={updateDepartment.isPending}
              {...form.register('name')}
            />
            {form.formState.errors.name ? (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 border-t border-border/60 px-0 pb-0 pt-1 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateDepartment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDepartment.isPending || !department}>
              {updateDepartment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
