'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  UserPlus,
} from 'lucide-react';
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
import { useInviteStudent } from '@/hooks/use-students';
import { useDepartmentsList } from '@/hooks/use-departments';
import type { Department } from '@/types/department.types';
import { cn } from '@/lib/utils';

const inviteStudentSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email'),
  studentId: z.string().trim().min(1, 'Student ID is required').max(100),
  departmentId: z.string().optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  program: z.string().trim().max(200).optional(),
  level: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(10).optional(),
  ),
});

type InviteStudentFormValues = z.infer<typeof inviteStudentSchema>;

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
    <section className={cn('space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4', className)}>
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

export function InviteStudentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inviteStudent = useInviteStudent();
  const { data: departments = [] } = useDepartmentsList(undefined, open);
  const isPending = inviteStudent.isPending;

  const form = useForm<InviteStudentFormValues>({
    resolver: zodResolver(inviteStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      departmentId: undefined,
      phoneNumber: '',
      program: '',
      level: undefined,
    },
  });

  const { errors } = form.formState;

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: InviteStudentFormValues) => {
    await inviteStudent.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      studentId: values.studentId,
      departmentId: values.departmentId || undefined,
      phoneNumber: values.phoneNumber?.trim() || undefined,
      program: values.program?.trim() || undefined,
      level: values.level === undefined ? undefined : Number(values.level),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-3 border-b border-border/60 bg-muted/30 px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0 space-y-1 pt-0.5">
              <DialogTitle className="text-lg">Invite Student</DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed">
                Add an internal student to your institution. They will receive an email to set
                their password and activate their account.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
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
              title="Student details"
              description="Required information used to create the student account."
            >
              <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="student-first-name">First name</Label>
                <Input
                  id="student-first-name"
                  placeholder="e.g. Jean"
                  disabled={isPending}
                  autoComplete="given-name"
                  {...form.register('firstName')}
                />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="student-last-name">Last name</Label>
                <Input
                  id="student-last-name"
                  placeholder="e.g. Mukamana"
                  disabled={isPending}
                  autoComplete="family-name"
                  {...form.register('lastName')}
                />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  id="student-email"
                  type="email"
                  placeholder="student@university.edu"
                  disabled={isPending}
                  autoComplete="email"
                  className="pl-9"
                  {...form.register('email')}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                placeholder="e.g. STU-2026-0042"
                disabled={isPending}
                {...form.register('studentId')}
              />
              <FieldError message={errors.studentId?.message} />
            </div>
          </FormSection>

          <FormSection
            title="Academic & contact"
            description="Optional details to help organize students within your institution."
          >
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
                  to assign students.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="student-program" className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                  Program
                </Label>
                <Input
                  id="student-program"
                  placeholder="e.g. BSc Computer Science"
                  disabled={isPending}
                  {...form.register('program')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="student-level">Level / year</Label>
                <Input
                  id="student-level"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="e.g. 2"
                  disabled={isPending}
                  {...form.register('level')}
                />
                <FieldError message={errors.level?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-phone" className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone number
              </Label>
              <Input
                id="student-phone"
                type="tel"
                placeholder="e.g. +250 788 000 000"
                disabled={isPending}
                autoComplete="tel"
                {...form.register('phoneNumber')}
              />
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
