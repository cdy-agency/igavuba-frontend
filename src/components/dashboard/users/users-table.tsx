'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  MoreHorizontal,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { DataTableSortSelect } from '@/components/data-table/data-table-sort-select';
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
  ModernTablePagination,
  ModernTableRow,
  ModernTableShell,
  ModernTableToolbar,
} from '@/components/dashboard/shared/modern-table';
import {
  formatDetailDate,
  PersonDetailModal,
  VerifiedBadge,
} from '@/components/dashboard/shared/person-detail-modal';
import { DashboardTableLoadingSkeleton } from '@/components/dashboard/shared/dashboard-skeletons';
import { useUsersList, useUpdateUserActive } from '@/hooks/use-admin-tables';
import type { UserListItem } from '@/types/admin';
import { UserRole, UserStatus } from '@/types/enum';
import { getUserStatusLabel, isUserActiveStatus } from '@/lib/status-utils';
import {
  DEFAULT_USER_SORT,
  INSTITUTION_ADMIN_SORT_OPTIONS,
  USER_SORT_OPTIONS,
} from '@/lib/user-table-sort';
import { useDashboard } from '@/contexts/dashboard-context';

const PAGE_SIZE = 10;

const ROLE_SHORT_LABEL: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.INSTITUTION_ADMIN]: 'Admin',
  [UserRole.LECTURER]: 'Lecturer',
  [UserRole.LEARNER]: 'Learner',
  [UserRole.DATA_MANAGER]: 'Data Manager',
  [UserRole.CONTENT_REVIEWER]: 'Reviewer',
  [UserRole.SUPPORT_AGENT]: 'Support',
};

const SUPER_ADMIN_ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
  { value: UserRole.INSTITUTION_ADMIN, label: 'Institution Admin' },
  { value: UserRole.LECTURER, label: 'Lecturer' },
  { value: UserRole.LEARNER, label: 'Learner' },
  { value: UserRole.DATA_MANAGER, label: 'Data Manager' },
  { value: UserRole.CONTENT_REVIEWER, label: 'Content Reviewer' },
  { value: UserRole.SUPPORT_AGENT, label: 'Support Agent' },
];

const INSTITUTION_ADMIN_ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: UserRole.INSTITUTION_ADMIN, label: 'Institution Admin' },
  { value: UserRole.LECTURER, label: 'Lecturer' },
  { value: UserRole.LEARNER, label: 'Learner' },
  { value: UserRole.DATA_MANAGER, label: 'Data Manager' },
  { value: UserRole.CONTENT_REVIEWER, label: 'Content Reviewer' },
  { value: UserRole.SUPPORT_AGENT, label: 'Support Agent' },
];

function canToggleUser(row: UserListItem, viewerRole: UserRole | null): boolean {
  if (row.role === UserRole.SUPER_ADMIN || row.status === UserStatus.PENDING) {
    return false;
  }
  if (viewerRole === UserRole.SUPER_ADMIN) return true;
  if (viewerRole === UserRole.INSTITUTION_ADMIN) return true;
  return false;
}

function getUserStatusTone(status: UserStatus): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
  if (status === UserStatus.ACTIVE) return 'success';
  if (status === UserStatus.PENDING) return 'info';
  if (status === UserStatus.SUSPENDED) return 'warning';
  if (status === UserStatus.BANNED) return 'danger';
  return 'neutral';
}

function getUserStatusIcon(status: UserStatus) {
  if (status === UserStatus.ACTIVE) return CheckCircle2;
  if (status === UserStatus.PENDING) return Eye;
  if (status === UserStatus.SUSPENDED) return Clock;
  if (status === UserStatus.BANNED) return Ban;
  return AlertTriangle;
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <ModernStatusBadge
      label={ROLE_SHORT_LABEL[role]}
      tone={role === UserRole.LEARNER ? 'info' : 'neutral'}
    />
  );
}

function LearnerTypeBadge({ learnerType }: { learnerType?: 'internal' | 'public' | null }) {
  if (!learnerType) return <span className="text-muted-foreground">—</span>;
  return (
    <ModernStatusBadge
      label={learnerType === 'internal' ? 'Internal' : 'Public'}
      tone={learnerType === 'internal' ? 'info' : 'warning'}
    />
  );
}

export function UsersTable() {
  const { role: viewerRole } = useDashboard();
  const isInstitutionScoped = viewerRole === UserRole.INSTITUTION_ADMIN;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [learnerTypeFilter, setLearnerTypeFilter] = useState('all');
  const [sort, setSort] = useState(DEFAULT_USER_SORT);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const roleFilterOptions = isInstitutionScoped
    ? INSTITUTION_ADMIN_ROLE_FILTERS
    : SUPER_ADMIN_ROLE_FILTERS;
  const sortOptions = isInstitutionScoped ? INSTITUTION_ADMIN_SORT_OPTIONS : USER_SORT_OPTIONS;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchq(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (roleFilter !== 'all') count += 1;
    if (statusFilter !== 'all') count += 1;
    if (learnerTypeFilter !== 'all') count += 1;
    return count;
  }, [roleFilter, statusFilter, learnerTypeFilter]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      searchq: searchq || undefined,
      role: roleFilter === 'all' ? undefined : (roleFilter as UserRole),
      status: statusFilter === 'all' ? undefined : (statusFilter as UserStatus),
      learnerType:
        learnerTypeFilter === 'all'
          ? undefined
          : (learnerTypeFilter as 'internal' | 'public'),
      sort,
    }),
    [page, searchq, roleFilter, statusFilter, learnerTypeFilter, sort],
  );

  const { data, isPending, isFetching } = useUsersList(queryParams);
  const updateActive = useUpdateUserActive();
  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const clearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setLearnerTypeFilter('all');
    setPage(1);
  };

  return (
    <>
      <ModernTableShell>
        <ModernTableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search by name or email..."
          filterCount={filterCount}
          onClearFilters={clearFilters}
          filters={
            <>
              <ModernFilterSelect
                icon={Users}
                label="Role"
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setPage(1);
                }}
                options={roleFilterOptions}
              />
              <ModernFilterSelect
                icon={UserCheck}
                label="Type"
                value={learnerTypeFilter}
                onValueChange={(value) => {
                  setLearnerTypeFilter(value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All types' },
                  { value: 'internal', label: 'Internal' },
                  { value: 'public', label: 'Public' },
                ]}
              />
              <ModernFilterSelect
                icon={Shield}
                label="Status"
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: UserStatus.ACTIVE, label: 'Active' },
                  { value: UserStatus.INACTIVE, label: 'Inactive' },
                  { value: UserStatus.PENDING, label: 'Pending' },
                  { value: UserStatus.SUSPENDED, label: 'Suspended' },
                  { value: UserStatus.BANNED, label: 'Banned' },
                ]}
              />
            </>
          }
          sort={
            <DataTableSortSelect
              value={sort}
              options={sortOptions}
              onValueChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
          }
        />

        {isPending || isFetching ? (
          <DashboardTableLoadingSkeleton
            columnCount={isInstitutionScoped ? 7 : 8}
            rowCount={4}
            showPagination={false}
          />
        ) : users.length === 0 ? (
          <ModernTableEmpty message="No users found." />
        ) : (
          <ModernTable>
            <ModernTableHead>
              <ModernTableHeaderCell>User</ModernTableHeaderCell>
              <ModernTableHeaderCell>Role</ModernTableHeaderCell>
              <ModernTableHeaderCell>Type</ModernTableHeaderCell>
              {!isInstitutionScoped ? (
                <ModernTableHeaderCell>Institution</ModernTableHeaderCell>
              ) : null}
              <ModernTableHeaderCell>Status</ModernTableHeaderCell>
              <ModernTableHeaderCell>Joined</ModernTableHeaderCell>
              <ModernTableHeaderCell>Active</ModernTableHeaderCell>
              <ModernTableHeaderCell className="text-right">Actions</ModernTableHeaderCell>
            </ModernTableHead>
            <ModernTableBody>
              {users.map((row) => (
                <ModernTableRow key={row.id}>
                  <ModernTableCell>
                    <ModernPersonCell
                      name={row.name}
                      email={row.email}
                      profileImage={row.profileImage}
                      subtitle={`${ROLE_SHORT_LABEL[row.role]}${row.institution?.name ? ` · ${row.institution.name}` : ''}`}
                      onClick={() => setSelectedUser(row)}
                    />
                  </ModernTableCell>
                  <ModernTableCell>
                    <RoleBadge role={row.role} />
                  </ModernTableCell>
                  <ModernTableCell>
                    <LearnerTypeBadge learnerType={row.learnerType} />
                  </ModernTableCell>
                  {!isInstitutionScoped ? (
                    <ModernTableCell className="text-muted-foreground">
                      {row.institution?.name ?? '—'}
                    </ModernTableCell>
                  ) : null}
                  <ModernTableCell>
                    <ModernStatusBadge
                      label={getUserStatusLabel(row.status)}
                      tone={getUserStatusTone(row.status)}
                      icon={getUserStatusIcon(row.status)}
                    />
                  </ModernTableCell>
                  <ModernTableCell className="whitespace-nowrap text-muted-foreground">
                    {format(new Date(row.createdAt), 'MMM d, yyyy')}
                  </ModernTableCell>
                  <ModernTableCell
                    onClick={(event) => event.stopPropagation()}
                  >
                    <StatusSwitchCell
                      checked={isUserActiveStatus(row.status)}
                      disabled={!canToggleUser(row, viewerRole)}
                      isPending={pendingId === row.id}
                      onCheckedChange={(active) => {
                        setPendingId(row.id);
                        updateActive.mutate(
                          { id: row.id, active },
                          { onSettled: () => setPendingId(null) },
                        );
                      }}
                    />
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
                        <DropdownMenuItem onClick={() => setSelectedUser(row)}>
                          View details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ModernTableCell>
                </ModernTableRow>
              ))}
            </ModernTableBody>
          </ModernTable>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <ModernTablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        ) : null}
      </ModernTableShell>

      <PersonDetailModal
        open={Boolean(selectedUser)}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        title="User details"
        name={selectedUser?.name ?? null}
        email={selectedUser?.email ?? ''}
        phoneNumber={selectedUser?.phoneNumber}
        profileImage={selectedUser?.profileImage}
        subtitle={
          selectedUser
            ? `${ROLE_SHORT_LABEL[selectedUser.role]}${selectedUser.institution?.name ? ` · ${selectedUser.institution.name}` : ''}`
            : undefined
        }
        statusBadge={
          selectedUser ? (
            <ModernStatusBadge
              label={getUserStatusLabel(selectedUser.status)}
              tone={getUserStatusTone(selectedUser.status)}
              icon={getUserStatusIcon(selectedUser.status)}
            />
          ) : null
        }
        sections={
          selectedUser
            ? [
                {
                  title: 'Account',
                  rows: [
                    { label: 'Role', value: ROLE_SHORT_LABEL[selectedUser.role] },
                    {
                      label: 'Email verified',
                      value: <VerifiedBadge verified={selectedUser.emailVerified} />,
                    },
                    { label: 'Joined', value: formatDetailDate(selectedUser.createdAt) },
                  ],
                },
                ...(selectedUser.role === UserRole.LEARNER
                  ? [
                      {
                        title: 'Learner',
                        rows: [
                          {
                            label: 'Type',
                            value: selectedUser.learnerType
                              ? selectedUser.learnerType === 'internal'
                                ? 'Internal'
                                : 'Public'
                              : '—',
                          },
                          { label: 'Student ID', value: selectedUser.studentId ?? '—' },
                        ],
                      },
                    ]
                  : []),
                ...(selectedUser.institution
                  ? [
                      {
                        title: 'Institution',
                        rows: [{ label: 'Name', value: selectedUser.institution.name }],
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
