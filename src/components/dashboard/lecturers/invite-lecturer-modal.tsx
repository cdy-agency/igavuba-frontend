'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useInviteLecturer,
} from '@/hooks/use-lecturers';
import { useDepartmentsList } from '@/hooks/use-departments';
import type { Department } from '@/types/department.types';

const inviteLecturerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email'),
  departmentId: z.string().optional(),
  phoneNumber: z.string().trim().max(30).optional(),
});

type InviteLecturerFormValues = z.infer<typeof inviteLecturerSchema>;

export function InviteLecturerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inviteLecturer = useInviteLecturer();
  const { data: departments = [] } = useDepartmentsList(undefined, open);

  const form = useForm<InviteLecturerFormValues>({
    resolver: zodResolver(inviteLecturerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      departmentId: undefined,
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: InviteLecturerFormValues) => {
    await inviteLecturer.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      departmentId: values.departmentId || undefined,
      phoneNumber: values.phoneNumber?.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Lecturer</DialogTitle>
          <DialogDescription>
            Send an invitation email. The lecturer will have 24 hours to activate their
            account.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lecturer-first-name">First name</Label>
              <Input id="lecturer-first-name" {...form.register('firstName')} />
              {form.formState.errors.firstName ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lecturer-last-name">Last name</Label>
              <Input id="lecturer-last-name" {...form.register('lastName')} />
              {form.formState.errors.lastName ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lecturer-email">Email</Label>
            <Input id="lecturer-email" type="email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Department (optional)</Label>
            {departments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No departments yet.{' '}
                <Link href="/dashboard/departments" className="text-primary underline-offset-4 hover:underline">
                  Create a department
                </Link>{' '}
                before inviting lecturers.
              </p>
            ) : null}
            <Select
              value={form.watch('departmentId') ?? 'none'}
              onValueChange={(value) =>
                form.setValue('departmentId', value === 'none' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No department</SelectItem>
                {departments.map((department: Department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lecturer-phone">Phone number (optional)</Label>
            <Input id="lecturer-phone" {...form.register('phoneNumber')} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={inviteLecturer.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteLecturer.isPending}>
              {inviteLecturer.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
