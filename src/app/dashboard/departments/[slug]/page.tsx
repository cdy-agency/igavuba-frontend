'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, MoveRight, Trash2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { AssignDepartmentCoursesModal } from '@/components/dashboard/departments/assign-department-courses-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboard } from '@/contexts/dashboard-context';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useCoursesList, useUpdateCourseDepartment } from '@/hooks/use-courses';
import { useDepartmentDetailBySlug, useDepartmentsList } from '@/hooks/use-departments';
import type { Course } from '@/types/course';
import type { Department } from '@/types/department.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const DEPARTMENT_DETAIL_ROLES = [
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
  UserRole.SUPER_ADMIN,
];

function canManageDepartmentCourse(course: Course, role: UserRole | null, userId?: string) {
  if (role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN) {
    return true;
  }

  if (role === UserRole.LECTURER && userId) {
    return course.ownerId === userId || course.createdById === userId;
  }

  return false;
}

export default function DepartmentDetailPage() {
  const params = useParams() as { slug?: string };
  const slug = params.slug ?? '';
  const { role, user } = useDashboard();
  const authReady = useAuthReady();

  const { data: department, isPending: isDepartmentLoading, isError: isDepartmentError, error: departmentError } =
    useDepartmentDetailBySlug(slug, authReady);

  const departmentId = department?.id ?? '';
  const { data: coursesResponse, isPending: isCoursesLoading, isError: isCoursesError, error: coursesError } =
    useCoursesList(
      { page: 1, limit: 100, departmentId: departmentId || undefined },
      Boolean(departmentId),
    );

  const { data: departmentsResponse } = useDepartmentsList(
    { page: 1, limit: 100 },
    authReady,
  );

  const updateCourseDepartment = useUpdateCourseDepartment();

  const [assignOpen, setAssignOpen] = useState(false);
  const [reassignCourse, setReassignCourse] = useState<Course | null>(null);
  const [reassignDepartmentId, setReassignDepartmentId] = useState('');

  const canAssignCourses = role === UserRole.INSTITUTION_ADMIN || role === UserRole.LECTURER;
  const departmentCourses: Course[] = coursesResponse?.data ?? [];
  const reassignableDepartments = useMemo(
    () =>
      (departmentsResponse?.data ?? []).filter(
        (item: Department) => item.id !== departmentId,
      ),
    [departmentsResponse?.data, departmentId],
  );

  const handleRemoveCourse = async (course: Course) => {
    try {
      await updateCourseDepartment.mutateAsync({
        courseId: course.slug,
        departmentId: null,
      });
      toast.success('Course removed from department.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to remove course from department.'));
    }
  };

  const handleConfirmReassign = async () => {
    if (!reassignCourse || !reassignDepartmentId) return;

    try {
      await updateCourseDepartment.mutateAsync({
        courseId: reassignCourse.slug,
        departmentId: reassignDepartmentId,
      });
      setReassignCourse(null);
      setReassignDepartmentId('');
      toast.success('Course reassigned successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to reassign course.'));
    }
  };

  const courseTableRows = useMemo(
    () =>
      departmentCourses.map((course) => {
        const canManage = canManageDepartmentCourse(course, role, user?.id);
        return {
          course,
          canManage,
        };
      }),
    [departmentCourses, role, user?.id],
  );

  return (
    <RoleGuard allowedRoles={DEPARTMENT_DETAIL_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title={department?.name ?? 'Department'}
          description={
            department
              ? 'Review department courses, remove assignments, and reassign department courses based on your role.'
              : 'Loading department details.'
          }
          actions={
            canAssignCourses && department ? (
              <Button className="h-10 gap-2" onClick={() => setAssignOpen(true)}>
                <MoveRight className="h-4 w-4" />
                Assign courses
              </Button>
            ) : undefined
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {isDepartmentLoading ? (
              <div className="flex min-h-[28vh] items-center justify-center rounded-2xl border border-border/80 bg-card p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isDepartmentError || !department ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
                {getApiErrorMessage(departmentError, 'Unable to load the department.')}
                <div className="mt-4">
                  <Link href="/dashboard/departments" className="text-primary underline">
                    Return to departments
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Department details</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{department.name}</p>
                      </div>
                      <Badge className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground bg-primary/10 border border-primary/20">
                        {department.lecturersCount} lecturers
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 rounded-xl border border-border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Slug</p>
                      <p className="font-medium text-foreground">{department.slug}</p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Courses assigned</p>
                      <p className="font-medium text-foreground">{department.coursesCount}</p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Institution</p>
                      <p className="font-medium text-foreground">{department.institution?.name ?? '—'}</p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</p>
                      <p className="font-medium text-foreground">
                        {new Date(department.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-border/80 bg-card shadow-sm">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle>Department courses</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {role === UserRole.INSTITUTION_ADMIN
                            ? 'You can remove or reassign any course in this department.'
                            : 'You can remove or reassign only the courses you created or own.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{department.coursesCount} course{department.coursesCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    {isCoursesLoading ? (
                      <div className="min-h-[18rem] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isCoursesError ? (
                      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">
                        {getApiErrorMessage(coursesError, 'Unable to load department courses.')}
                      </div>
                    ) : departmentCourses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-background px-6 py-10 text-center text-sm text-muted-foreground">
                        No courses are currently assigned to this department.
                      </div>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-border/70 bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Updated</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseTableRows.map(({ course, canManage }) => (
                            <tr
                              key={course.id}
                              className={cn(
                                'border-b border-border/70',
                                !canManage && 'bg-muted/10',
                              )}
                            >
                              <td className="max-w-[22rem] px-4 py-4">
                                <div className="min-w-0">
                                  <Link href={`/dashboard/courses/${course.slug}`} className="font-medium text-foreground hover:text-primary">
                                    {course.title}
                                  </Link>
                                  <p className="truncate text-xs text-muted-foreground">{course.slug}</p>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-muted-foreground">
                                {course.owner?.name || course.owner?.email || 'Unassigned'}
                              </td>
                              <td className="px-4 py-4">
                                <Badge variant="secondary" className="rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.16em]">
                                  {course.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 text-muted-foreground">
                                {new Date(course.updatedAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!canManage}
                                    onClick={() => handleRemoveCourse(course)}
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Remove
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={!canManage}
                                    onClick={() => {
                                      setReassignCourse(course);
                                      setReassignDepartmentId('');
                                    }}
                                  >
                                    <MoveRight className="mr-2 h-3.5 w-3.5" />
                                    Reassign
                                  </Button>
                                </div>
                                {!canManage ? (
                                  <p className="mt-2 text-xs text-amber-700">
                                    Only your own courses are editable.
                                  </p>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
              <CardHeader className="space-y-3 p-0">
                <CardTitle>Department actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use this page to manage course assignments, keep course counts accurate, and review department ownership.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-4">
                <div className="rounded-2xl border border-border/80 bg-background p-4">
                  <p className="text-sm font-medium text-foreground">Who can manage</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {role === UserRole.INSTITUTION_ADMIN
                      ? 'Institution admins can remove or reassign every course in the department.'
                      : 'Lecturers can remove or reassign only the courses they own or created.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background p-4">
                  <p className="text-sm font-medium text-foreground">Reassign department</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select another department using the Reassign button next to each course.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background p-4">
                  <p className="text-sm font-medium text-foreground">Add more courses</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use the Assign courses button to add unassigned or other eligible courses to this department.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AssignDepartmentCoursesModal
          open={assignOpen}
          onOpenChange={setAssignOpen}
          department={department}
        />

        <Dialog
          open={Boolean(reassignCourse)}
          onOpenChange={(open) => {
            if (!open) {
              setReassignCourse(null);
              setReassignDepartmentId('');
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reassign course</DialogTitle>
              <DialogDescription>
                Choose another department for the selected course. Only eligible departments are shown.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{reassignCourse?.title}</p>
                <p className="text-xs text-muted-foreground">{reassignCourse?.slug}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reassign-department">New department</Label>
                <Select
                  value={reassignDepartmentId}
                  onValueChange={(value) => setReassignDepartmentId(value)}
                >
                  <SelectTrigger id="reassign-department">
                    <SelectValue placeholder="Select another department" />
                  </SelectTrigger>
                  <SelectContent>
                    {reassignableDepartments.map((option: Department) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReassignCourse(null)}>
                Cancel
              </Button>
              <Button
                disabled={!reassignDepartmentId || updateCourseDepartment.isPending}
                onClick={handleConfirmReassign}
              >
                Reassign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
