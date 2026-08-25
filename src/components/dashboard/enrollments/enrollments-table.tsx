'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Shield,
  Upload,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { InviteStudentModal } from '@/components/dashboard/students/invite-student-modal';
import { ImportStudentsModal } from '@/components/dashboard/students/import-students-modal';
import { AssignCoursesModal } from '@/components/dashboard/students/assign-courses-modal';
import { EditStudentModal } from '@/components/dashboard/students/edit-student-modal';
import { StudentRowActionsMenu } from '@/components/dashboard/students/student-row-actions-menu';
import {
  ModernFilterSelect,
  ModernPersonCell,
  ModernStatusBadge,
  ModernTable,
  ModernTableBody,
  ModernTableCell,
  ModernTableEmpty,
  ModernTableHead,
  ModernTableHeaderCell,
  ModernTableRow,
  ModernTableShell,
  ModernTableToolbar,
} from '@/components/dashboard/shared/modern-table';
import {
  formatDetailDate,
  PersonDetailModal,
} from '@/components/dashboard/shared/person-detail-modal';
import {
  useCancelStudentInvitation,
  useResetStudentPassword,
  useStudentsList,
  useUpdateStudentStatus,
} from '@/hooks/use-students';
import { useDepartmentsList } from '@/hooks/use-departments';
import { useDashboard } from '@/contexts/dashboard-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/auth';
import type { StudentListItem } from '@/types/student.types';
import type { Department } from '@/types/department.types';
import { UserRole, UserStatus } from '@/types/enum';
import { getUserStatusLabel, isUserActiveStatus } from '@/lib/status-utils';
import {
  dashboardActionGroupClass,
  getDashboardLabeledActionButtonClass,
} from '@/lib/dashboard-action-button';

function canToggleStatus(row: StudentListItem) {
  return row.status !== UserStatus.PENDING;
}

function getStudentStatusTone(status: UserStatus): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
  if (status === UserStatus.ACTIVE) return 'success';
  if (status === UserStatus.PENDING) return 'info';
  if (status === UserStatus.SUSPENDED) return 'warning';
  if (status === UserStatus.BANNED) return 'danger';
  return 'neutral';
}

function getStudentStatusIcon(status: UserStatus) {
  if (status === UserStatus.ACTIVE) return CheckCircle2;
  if (status === UserStatus.PENDING) return Eye;
  if (status === UserStatus.SUSPENDED) return Clock;
  if (status === UserStatus.BANNED) return Ban;
  return AlertTriangle;
}

export function EnrollmentsTable() {
  const { role } = useDashboard();
  const { isAuthenticated } = useAuth();
  const canManage = role === UserRole.INSTITUTION_ADMIN;

  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTargets, setAssignTargets] = useState<StudentListItem[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentListItem | null>(null);

  const { data: departmentData } = useDepartmentsList(undefined, isAuthenticated);
  const departments: Department[] = departmentData?.data ?? [];

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchq(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count += 1;
    if (departmentFilter !== 'all') count += 1;
    return count;
  }, [statusFilter, departmentFilter]);

  const queryParams = useMemo(
    () => ({
      searchq: searchq || undefined,
      status: statusFilter === 'all' ? undefined : (statusFilter as UserStatus),
      departmentId: departmentFilter === 'all' ? undefined : departmentFilter,
    }),
    [searchq, statusFilter, departmentFilter],
  );

  const {
    data: studentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentsList(queryParams, isAuthenticated);
  const students: StudentListItem[] = studentsData ?? [];
  const updateStatus = useUpdateStudentStatus();
  const resetPassword = useResetStudentPassword();
  const cancelInvitation = useCancelStudentInvitation();

  const departmentOptions = useMemo(
    () => [
      { value: 'all', label: 'All departments' },
      ...departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    ],
    [departments],
  );

  const clearFilters = () => {
    setStatusFilter('all');
    setDepartmentFilter('all');
  };

  return (
    <>
      <ModernTableShell>
        <ModernTableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search by name, email, or student ID..."
          filterCount={filterCount}
          onClearFilters={clearFilters}
          filters={
            <>
              <ModernFilterSelect
                icon={MapPin}
                label="Department"
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
                options={departmentOptions}
              />
              <ModernFilterSelect
                icon={Shield}
                label="Status"
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: UserStatus.ACTIVE, label: 'Active' },
                  { value: UserStatus.INACTIVE, label: 'Suspended' },
                  { value: UserStatus.PENDING, label: 'Pending' },
                ]}
              />
            </>
          }
          actions={
            canManage ? (
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
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setInviteOpen(true)}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Invite Student
                </Button>
              </div>
            ) : null
          }
        />

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {getApiErrorMessage(error, 'Unable to load internal students.')}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : students.length === 0 ? (
          <ModernTableEmpty
            message={
              canManage
                ? 'No internal students yet. Invite a student or upload a roster to get started.'
                : 'No internal students found.'
            }
          />
        ) : (
          <ModernTable>
            <ModernTableHead>
              <ModernTableHeaderCell>Student</ModernTableHeaderCell>
              <ModernTableHeaderCell>Department</ModernTableHeaderCell>
              <ModernTableHeaderCell>Status</ModernTableHeaderCell>
              <ModernTableHeaderCell>Courses</ModernTableHeaderCell>
              <ModernTableHeaderCell>Joined</ModernTableHeaderCell>
              {canManage ? <ModernTableHeaderCell>Active</ModernTableHeaderCell> : null}
              <ModernTableHeaderCell className="text-right">Actions</ModernTableHeaderCell>
            </ModernTableHead>
            <ModernTableBody>
              {students.map((row) => (
                <ModernTableRow key={row.id}>
                  <ModernTableCell>
                    <ModernPersonCell
                      name={row.name}
                      email={row.email}
                      profileImage={row.profileImage}
                      subtitle={
                        row.studentId
                          ? `ID ${row.studentId}${row.department?.name ? ` · ${row.department.name}` : ''}`
                          : row.department?.name ?? row.email
                      }
                      onClick={() => setSelectedStudent(row)}
                    />
                  </ModernTableCell>
                  <ModernTableCell className="text-muted-foreground">
                    {row.department?.name ?? '—'}
                  </ModernTableCell>
                  <ModernTableCell>
                    <ModernStatusBadge
                      label={getUserStatusLabel(row.status)}
                      tone={getStudentStatusTone(row.status)}
                      icon={getStudentStatusIcon(row.status)}
                    />
                  </ModernTableCell>
                  <ModernTableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{row.coursesCount}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.coursesCount === 1 ? 'course enrolled' : 'courses enrolled'}
                      </p>
                    </div>
                  </ModernTableCell>
                  <ModernTableCell className="whitespace-nowrap text-muted-foreground">
                    {format(new Date(row.createdAt), 'MMM d, yyyy')}
                  </ModernTableCell>
                  {canManage ? (
                    <ModernTableCell onClick={(event) => event.stopPropagation()}>
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
                    </ModernTableCell>
                  ) : null}
                  <ModernTableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <StudentRowActionsMenu
                      student={row}
                      canManage={canManage}
                      resetPasswordPending={resetPassword.isPending}
                      onViewDetails={setSelectedStudent}
                      onEdit={setEditingStudent}
                      onAssignCourses={(student) => {
                        setAssignTargets([student]);
                        setAssignOpen(true);
                      }}
                      onResetPassword={(studentId) => resetPassword.mutateAsync(studentId)}
                      onCancelInvitation={(email) => cancelInvitation.mutateAsync(email)}
                    />
                  </ModernTableCell>
                </ModernTableRow>
              ))}
            </ModernTableBody>
          </ModernTable>
        )}
      </ModernTableShell>

      <PersonDetailModal
        open={Boolean(selectedStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
        title="Student details"
        name={selectedStudent?.name ?? null}
        email={selectedStudent?.email ?? ''}
        phoneNumber={selectedStudent?.phoneNumber}
        profileImage={selectedStudent?.profileImage}
        subtitle={
          selectedStudent
            ? `${selectedStudent.studentId ? `ID ${selectedStudent.studentId}` : 'Internal student'}${
                selectedStudent.department?.name ? ` · ${selectedStudent.department.name}` : ''
              }`
            : undefined
        }
        statusBadge={
          selectedStudent ? (
            <ModernStatusBadge
              label={getUserStatusLabel(selectedStudent.status)}
              tone={getStudentStatusTone(selectedStudent.status)}
              icon={getStudentStatusIcon(selectedStudent.status)}
            />
          ) : null
        }
        sections={
          selectedStudent
            ? [
                {
                  title: 'Academic',
                  rows: [
                    { label: 'Student ID', value: selectedStudent.studentId ?? '—' },
                    { label: 'Department', value: selectedStudent.department?.name ?? '—' },
                    {
                      label: 'Courses enrolled',
                      value: String(selectedStudent.coursesCount),
                    },
                    { label: 'Joined', value: formatDetailDate(selectedStudent.createdAt) },
                  ],
                },
                ...(selectedStudent.institution
                  ? [
                      {
                        title: 'Institution',
                        rows: [{ label: 'Name', value: selectedStudent.institution.name }],
                      },
                    ]
                  : []),
              ]
            : []
        }
      />

      {canManage ? (
        <>
          <InviteStudentModal open={inviteOpen} onOpenChange={setInviteOpen} />
          <ImportStudentsModal open={importOpen} onOpenChange={setImportOpen} />
          <AssignCoursesModal
            open={assignOpen}
            onOpenChange={setAssignOpen}
            students={assignTargets}
          />
          <EditStudentModal
            student={editingStudent}
            open={Boolean(editingStudent)}
            onOpenChange={(open) => {
              if (!open) setEditingStudent(null);
            }}
          />
        </>
      ) : null}
    </>
  );
}
