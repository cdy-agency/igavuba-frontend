'use client';

import { useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDepartmentsList } from '@/hooks/use-departments';
import { useStudent, useUpdateStudent } from '@/hooks/use-students';
import type { Department } from '@/types/department.types';
import type { StudentListItem } from '@/types/student.types';

const editStudentSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email'),
  studentId: z.string().trim().min(1, 'Student ID is required').max(100),
  departmentId: z.string().optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  program: z.string().trim().max(200).optional(),
  level: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(10).optional(),
  ),
});

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

function EditStudentFormSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading student information">
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

export function EditStudentModal({
  student,
  open,
  onOpenChange,
}: {
  student: StudentListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateStudent = useUpdateStudent(student?.id ?? '');
  const { data: studentDetail } = useStudent(student?.id ?? '', open);
  const { data } = useDepartmentsList(undefined, open);
  const departments: Department[] = data?.data ?? [];
  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
  });

  useEffect(() => {
    if (student && studentDetail && open) {
      const nameParts = (studentDetail.name ?? '').trim().split(/\s+/);
      form.reset({
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' '),
        email: studentDetail.email,
        studentId: studentDetail.studentId ?? '',
        departmentId: studentDetail.department?.id,
        phoneNumber: studentDetail.phoneNumber ?? '',
        program: studentDetail.program ?? '',
        level: studentDetail.level ?? undefined,
      });
    }
  }, [form, open, student, studentDetail]);

  const onSubmit = async (values: EditStudentFormValues) => {
    await updateStudent.mutateAsync({
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

  const isPending = updateStudent.isPending;
  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit student information</DialogTitle>
          <DialogDescription>
            Updating the email sends a new invitation. Other changes are reported to the student by email.
          </DialogDescription>
        </DialogHeader>
        {!studentDetail ? <EditStudentFormSkeleton /> : <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>First name</Label><Input disabled={isPending} {...form.register('firstName')} /><p className="text-xs text-destructive">{errors.firstName?.message}</p></div>
            <div className="space-y-1.5"><Label>Last name</Label><Input disabled={isPending} {...form.register('lastName')} /><p className="text-xs text-destructive">{errors.lastName?.message}</p></div>
          </div>
          <div className="space-y-1.5"><Label>Email address</Label><Input type="email" disabled={isPending} {...form.register('email')} /><p className="text-xs text-destructive">{errors.email?.message}</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Student ID</Label><Input disabled={isPending} {...form.register('studentId')} /><p className="text-xs text-destructive">{errors.studentId?.message}</p></div>
            <div className="space-y-1.5"><Label>Phone number</Label><Input type="tel" disabled={isPending} {...form.register('phoneNumber')} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={form.watch('departmentId') ?? 'none'} onValueChange={(value) => form.setValue('departmentId', value === 'none' ? undefined : value)} disabled={isPending}>
              <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
              <SelectContent><SelectItem value="none">No department</SelectItem>{departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Program</Label><Input disabled={isPending} {...form.register('program')} /></div>
            <div className="space-y-1.5"><Label>Level / year</Label><Input type="number" min={1} max={10} disabled={isPending} {...form.register('level')} /><p className="text-xs text-destructive">{errors.level?.message}</p></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save changes</Button>
          </DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>
  );
}
