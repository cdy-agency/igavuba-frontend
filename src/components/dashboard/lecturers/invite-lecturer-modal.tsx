'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Clock, Loader2, Mail, UserRound } from 'lucide-react';
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
import { useInviteLecturer } from '@/hooks/use-lecturers';
import { useDepartmentsList } from '@/hooks/use-departments';
import type { Department } from '@/types/department.types';
import { cn } from '@/lib/utils';

const inviteLecturerSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  departmentId: z.string().optional(),
});

type InviteLecturerFormValues = z.infer<typeof inviteLecturerSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4',
        className,
      )}
    >
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function InviteLecturerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inviteLecturer = useInviteLecturer();
  const { data } = useDepartmentsList(undefined, open);
  const departments = data?.data ?? [];
  const isPending = inviteLecturer.isPending;

  const form = useForm<InviteLecturerFormValues>({
    resolver: zodResolver(inviteLecturerSchema),
    defaultValues: {
      email: '',
      departmentId: undefined,
    },
  });

  const { errors } = form.formState;

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: InviteLecturerFormValues) => {
    await inviteLecturer.mutateAsync({
      email: values.email,
      departmentId: values.departmentId || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-3 border-b border-border/60 bg-muted/30 px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0 space-y-1 pt-0.5">
              <DialogTitle className="text-lg">Invite Lecturer</DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed">
                Send an invitation by email. The lecturer will complete their profile
                and set a password when they activate their account.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Invitation links expire after 24 hours.</span>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
            <FormSection
              title="Invitation details"
              description="Only email and department are needed to send the invite."
            >
              <div className="space-y-1.5">
                <Label htmlFor="lecturer-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="lecturer-email"
                    type="email"
                    placeholder="lecturer@university.edu"
                    disabled={isPending}
                    autoComplete="email"
                    className="pl-9"
                    {...form.register('email')}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Department
                </Label>
                {departments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No departments yet.{' '}
                    <Link
                      href="/dashboard/departments"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Create a department
                    </Link>{' '}
                    to assign lecturers.
                  </p>
                ) : null}
                <Select
                  value={form.watch('departmentId') ?? 'none'}
                  onValueChange={(value) =>
                    form.setValue('departmentId', value === 'none' ? undefined : value)
                  }
                  disabled={isPending || departments.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
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
            </FormSection>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-background px-6 py-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px]">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
