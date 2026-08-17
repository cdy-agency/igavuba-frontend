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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useStudentsList } from '@/hooks/use-students';
import { useDepartmentsList } from '@/hooks/use-departments';
import { useAuth } from '@/lib/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/auth';
import type { StudentListItem } from '@/types/student.types';
import type { Department } from '@/types/department.types';
import { UserStatus } from '@/types/enum';
import { getUserStatusLabel } from '@/lib/status-utils';

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

export function StudentsTable() {
  const { isAuthenticated } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);

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
        />

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
          <ModernTableEmpty message="No students found." />
        ) : (
          <ModernTable>
            <ModernTableHead>
              <ModernTableHeaderCell>Student</ModernTableHeaderCell>
              <ModernTableHeaderCell>Department</ModernTableHeaderCell>
              <ModernTableHeaderCell>Status</ModernTableHeaderCell>
              <ModernTableHeaderCell>Courses</ModernTableHeaderCell>
              <ModernTableHeaderCell>Joined</ModernTableHeaderCell>
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
                  <ModernTableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <StudentRowActionsMenu
                      student={row}
                      onViewDetails={setSelectedStudent}
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
    </>
  );
}
