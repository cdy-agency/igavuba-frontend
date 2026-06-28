'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>Update the department name.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="edit-department-name">Name</Label>
            <Input
              id="edit-department-name"
              disabled={updateDepartment.isPending}
              {...form.register('name')}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <DialogFooter>
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
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
