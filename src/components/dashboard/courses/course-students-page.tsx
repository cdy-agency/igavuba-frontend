'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Loader2,
  MoreHorizontal,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CourseSubNav } from '@/components/dashboard/courses/course-sub-nav';
import { DashboardActionIconButton } from '@/components/dashboard/dashboard-action-icon-button';
import {
  ModernFilterSelect,
  ModernPersonCell,
  ModernProgressCell,
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
import { useCourseStudents } from '@/hooks/use-internal-enrollment';
import type { CourseStudentRow } from '@/types/student.types';
import { getUserStatusLabel } from '@/lib/status-utils';
import { UserStatus } from '@/types/enum';

function getEnrollmentStatusTone(status: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'ACTIVE') return 'info';
  if (status === 'PENDING_PAYMENT') return 'warning';
  return 'neutral';
}

function getEnrollmentStatusIcon(status: string) {
  if (status === 'COMPLETED') return CheckCircle2;
  if (status === 'ACTIVE') return Eye;
  if (status === 'PENDING_PAYMENT') return Clock;
  return AlertTriangle;
}

function getAccountStatusTone(status: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
  if (status === UserStatus.ACTIVE) return 'success';
  if (status === UserStatus.PENDING) return 'info';
  if (status === UserStatus.SUSPENDED) return 'warning';
  if (status === UserStatus.BANNED) return 'danger';
  return 'neutral';
}

export function CourseStudentsPage({
  courseSlug,
  courseTitle,
}: {
  courseSlug: string;
  courseTitle?: string;
}) {
  const { data: studentsData, isPending } = useCourseStudents(courseSlug);
  const students = studentsData ?? [];

  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<CourseStudentRow | null>(null);

  const filterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count += 1;
    if (statusFilter !== 'all') count += 1;
    return count;
  }, [typeFilter, statusFilter]);

  const filteredStudents = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    return students.filter((row) => {
      if (typeFilter === 'internal' && !row.isInternalStudent) return false;
      if (typeFilter === 'public' && row.isInternalStudent) return false;
      if (statusFilter !== 'all' && row.enrollmentStatus !== statusFilter) return false;
      if (!query) return true;
      return (
        row.name?.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.studentId?.toLowerCase().includes(query) ||
        row.department?.name.toLowerCase().includes(query)
      );
    });
  }, [students, searchInput, typeFilter, statusFilter]);

  const enrollmentStatusOptions = useMemo(() => {
    const values = Array.from(new Set(students.map((row) => row.enrollmentStatus)));
    return [
      { value: 'all', label: 'All statuses' },
      ...values.map((value) => ({
        value,
        label: value.replaceAll('_', ' '),
      })),
    ];
  }, [students]);

  return (
    <div className="space-y-6">
      <CourseSubNav slug={courseSlug} active="students" />
      <div className="flex items-center gap-3">
        <DashboardActionIconButton
          label="Back to course"
          icon={ArrowLeft}
          href={`/dashboard/courses/${courseSlug}`}
        />
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {courseTitle ? `${courseTitle} — ` : ''}
            all enrolled students (internal and public)
          </p>
        </div>
      </div>

      <ModernTableShell>
        <ModernTableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search by name, email, or student ID..."
          filterCount={filterCount}
          onClearFilters={() => {
            setTypeFilter('all');
            setStatusFilter('all');
          }}
          filters={
            <>
              <ModernFilterSelect
                icon={GraduationCap}
                label="Type"
                value={typeFilter}
                onValueChange={setTypeFilter}
                options={[
                  { value: 'all', label: 'All types' },
                  { value: 'internal', label: 'Internal' },
                  { value: 'public', label: 'Public' },
                ]}
              />
              <ModernFilterSelect
                icon={Shield}
                label="Enrollment"
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={enrollmentStatusOptions}
              />
            </>
          }
        />

        {isPending ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <ModernTableEmpty
            message={
              students.length === 0
                ? 'No students enrolled in this course yet.'
                : 'No students match your filters.'
            }
          />
        ) : (
          <ModernTable>
            <ModernTableHead>
              <ModernTableHeaderCell>Student</ModernTableHeaderCell>
              <ModernTableHeaderCell>Type</ModernTableHeaderCell>
              <ModernTableHeaderCell>Department</ModernTableHeaderCell>
              <ModernTableHeaderCell>Enrollment</ModernTableHeaderCell>
              <ModernTableHeaderCell>Progress</ModernTableHeaderCell>
              <ModernTableHeaderCell>Enrolled</ModernTableHeaderCell>
              <ModernTableHeaderCell className="text-right">Actions</ModernTableHeaderCell>
            </ModernTableHead>
            <ModernTableBody>
              {filteredStudents.map((row) => (
                <ModernTableRow key={row.enrollmentId}>
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
                  <ModernTableCell>
                    <ModernStatusBadge
                      label={row.isInternalStudent ? 'Internal' : 'Public'}
                      tone={row.isInternalStudent ? 'info' : 'warning'}
                    />
                  </ModernTableCell>
                  <ModernTableCell className="text-muted-foreground">
                    {row.department?.name ?? '—'}
                  </ModernTableCell>
                  <ModernTableCell>
                    <ModernStatusBadge
                      label={row.enrollmentStatus.replaceAll('_', ' ')}
                      tone={getEnrollmentStatusTone(row.enrollmentStatus)}
                      icon={getEnrollmentStatusIcon(row.enrollmentStatus)}
                    />
                  </ModernTableCell>
                  <ModernTableCell>
                    <ModernProgressCell
                      value={row.progress}
                      label={
                        row.completedAt
                          ? `Completed ${format(new Date(row.completedAt), 'MMM d, yyyy')}`
                          : `${Math.round(row.progress)}% complete`
                      }
                    />
                  </ModernTableCell>
                  <ModernTableCell className="whitespace-nowrap text-muted-foreground">
                    {format(new Date(row.enrolledAt), 'MMM d, yyyy')}
                  </ModernTableCell>
                  <ModernTableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedStudent(row)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/students/${row.learnerProfileId}`}>
                            Open profile
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            ? `${selectedStudent.isInternalStudent ? 'Internal' : 'Public'} learner${
                selectedStudent.department?.name ? ` · ${selectedStudent.department.name}` : ''
              }`
            : undefined
        }
        statusBadge={
          selectedStudent ? (
            <ModernStatusBadge
              label={selectedStudent.enrollmentStatus.replaceAll('_', ' ')}
              tone={getEnrollmentStatusTone(selectedStudent.enrollmentStatus)}
              icon={getEnrollmentStatusIcon(selectedStudent.enrollmentStatus)}
            />
          ) : null
        }
        sections={
          selectedStudent
            ? [
                {
                  title: 'Enrollment',
                  rows: [
                    {
                      label: 'Status',
                      value: selectedStudent.enrollmentStatus.replaceAll('_', ' '),
                    },
                    { label: 'Progress', value: `${Math.round(selectedStudent.progress)}%` },
                    { label: 'Enrolled', value: formatDetailDate(selectedStudent.enrolledAt) },
                    {
                      label: 'Completed',
                      value: formatDetailDate(selectedStudent.completedAt),
                    },
                    {
                      label: 'Source',
                      value: selectedStudent.enrollmentSource?.replaceAll('_', ' ') ?? '—',
                    },
                  ],
                },
                {
                  title: 'Profile',
                  rows: [
                    { label: 'Student ID', value: selectedStudent.studentId ?? '—' },
                    {
                      label: 'Type',
                      value: selectedStudent.isInternalStudent ? 'Internal' : 'Public',
                    },
                    {
                      label: 'Department',
                      value: selectedStudent.department?.name ?? '—',
                    },
                    {
                      label: 'Account status',
                      value: (
                        <ModernStatusBadge
                          label={getUserStatusLabel(selectedStudent.status as UserStatus)}
                          tone={getAccountStatusTone(selectedStudent.status)}
                        />
                      ),
                    },
                  ],
                },
              ]
            : []
        }
      />
    </div>
  );
}
