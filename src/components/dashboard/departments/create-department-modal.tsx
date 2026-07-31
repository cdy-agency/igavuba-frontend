'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2 } from 'lucide-react';
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
  createDepartmentSchema,
  type CreateDepartmentFormValues,
} from '@/schema/department.schema';
import { useCreateDepartment } from '@/hooks/use-departments';

const defaultValues: CreateDepartmentFormValues = {
  name: '',
};

export function CreateDepartmentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createDepartment = useCreateDepartment();

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [form, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    await createDepartment.mutateAsync({ name: values.name });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md sm:rounded-xl">
        <DialogHeader className="space-y-3 border-b border-border/60 bg-muted/30 px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="space-y-1 pt-0.5">
              <DialogTitle className="text-lg">Create department</DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed">
                Add an academic department to organize lecturers and courses.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="space-y-5 px-6 py-5" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="department-name">Department name</Label>
            <Input
              id="department-name"
              placeholder="e.g. Computer Science"
              disabled={createDepartment.isPending}
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
              disabled={createDepartment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDepartment.isPending}>
              {createDepartment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create department'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
