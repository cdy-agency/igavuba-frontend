'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { InviteStudentModal } from '@/components/dashboard/students/invite-student-modal';
import { ImportStudentsModal } from '@/components/dashboard/students/import-students-modal';
import { AssignCoursesModal } from '@/components/dashboard/students/assign-courses-modal';
import { StudentRowActionsMenu } from '@/components/dashboard/students/student-row-actions-menu';
import {
  useResetStudentPassword,
  useStudentsList,
  useUpdateStudentStatus,
  useCancelStudentInvitation,
} from '@/hooks/use-students';
import { useDashboard } from '@/contexts/dashboard-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/auth';
import type { StudentListItem } from '@/types/student.types';
import { UserRole, UserStatus } from '@/types/enum';
import {
  getUserStatusClassName,
  getUserStatusLabel,
  isUserActiveStatus,
} from '@/lib/status-utils';
import { dashboardActionGroupClass, getDashboardLabeledActionButtonClass } from '@/lib/dashboard-action-button';

function canToggleStatus(row: StudentListItem) {
  return row.status !== UserStatus.PENDING;
}

export function StudentsTable() {
  const { role } = useDashboard();
  const { isAuthenticated } = useAuth();
  const canManage = role === UserRole.INSTITUTION_ADMIN;
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTargets, setAssignTargets] = useState<StudentListItem[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchq(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      searchq: searchq || undefined,
      status: statusFilter === 'all' ? undefined : (statusFilter as UserStatus),
    }),
    [searchq, statusFilter],
  );

  const {
    data: studentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentsList(queryParams, isAuthenticated);
  const students = studentsData ?? [];
  const updateStatus = useUpdateStudentStatus();
  const resetPassword = useResetStudentPassword();
  const cancelInvitation = useCancelStudentInvitation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, email, or student ID..."
            className="w-full max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Suspended</SelectItem>
              <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canManage ? (
          <div className={dashboardActionGroupClass}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={getDashboardLabeledActionButtonClass()}
              onClick={() => setImportOpen(true)}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Bulk Invite
            </Button>
            <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Invite Student
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {getApiErrorMessage(error, 'Unable to load students.')}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : students.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No students found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  {canManage ? <th className="px-4 py-3 font-medium">Active</th> : null}
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row: StudentListItem) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{row.studentId ?? '—'}</td>
                    <td className="px-4 py-3">{row.name ?? '—'}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.department?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={getUserStatusClassName(row.status)}>
                        {getUserStatusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{row.coursesCount}</td>
                    <td className="px-4 py-3">
                      {format(new Date(row.createdAt), 'MMM d, yyyy')}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3">
                        {canToggleStatus(row) ? (
                          <StatusSwitchCell
                            checked={isUserActiveStatus(row.status)}
                            disabled={pendingId === row.id}
                            isPending={pendingId === row.id}
                            size="sm"
                            onCheckedChange={async (checked) => {
                              setPendingId(row.id);
                              try {
                                await updateStatus.mutateAsync({
                                  studentId: row.id,
                                  status: checked ? UserStatus.ACTIVE : UserStatus.INACTIVE,
                                });
                              } finally {
                                setPendingId(null);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <StudentRowActionsMenu
                        student={row}
                        canManage={canManage}
                        resetPasswordPending={resetPassword.isPending}
                        onAssignCourses={(student) => {
                          setAssignTargets([student]);
                          setAssignOpen(true);
                        }}
                        onResetPassword={(studentId) => resetPassword.mutateAsync(studentId)}
                        onCancelInvitation={(email) => cancelInvitation.mutateAsync(email)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteStudentModal open={inviteOpen} onOpenChange={setInviteOpen} />
      <ImportStudentsModal open={importOpen} onOpenChange={setImportOpen} />
      <AssignCoursesModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        students={assignTargets}
      />
    </div>
  );
}
