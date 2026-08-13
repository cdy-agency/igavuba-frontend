'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { DataTableSortSelect } from '@/components/data-table/data-table-sort-select';
import { useUsersList, useUpdateUserActive } from '@/hooks/use-admin-tables';
import type { UserListItem } from '@/types/admin';
import { UserRole, UserStatus } from '@/types/enum';
import { getUserStatusLabel, isUserActiveStatus } from '@/lib/status-utils';
import {
  DEFAULT_USER_SORT,
  INSTITUTION_ADMIN_SORT_OPTIONS,
  USER_SORT_OPTIONS,
} from '@/lib/user-table-sort';
import { DashboardTableLoadingSkeleton } from '@/components/dashboard/shared/dashboard-skeletons';
import { useDashboard } from '@/contexts/dashboard-context';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const ROLE_CHIP_CLASS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'border-slate-200 bg-slate-50 text-slate-600',
  [UserRole.INSTITUTION_ADMIN]: 'border-violet-200 bg-violet-50 text-violet-700',
  [UserRole.LECTURER]: 'border-sky-200 bg-sky-50 text-sky-700',
  [UserRole.LEARNER]: 'border-border bg-muted/50 text-muted-foreground',
  [UserRole.DATA_MANAGER]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [UserRole.CONTENT_REVIEWER]: 'border-amber-200 bg-amber-50 text-amber-800',
  [UserRole.SUPPORT_AGENT]: 'border-orange-200 bg-orange-50 text-orange-700',
};

const ROLE_SHORT_LABEL: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.INSTITUTION_ADMIN]: 'Admin',
  [UserRole.LECTURER]: 'Lecturer',
  [UserRole.LEARNER]: 'Learner',
  [UserRole.DATA_MANAGER]: 'Data Manager',
  [UserRole.CONTENT_REVIEWER]: 'Reviewer',
  [UserRole.SUPPORT_AGENT]: 'Support',
};

const SUPER_ADMIN_ROLE_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All roles' },
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
  { value: UserRole.INSTITUTION_ADMIN, label: 'Institution Admin' },
  { value: UserRole.LECTURER, label: 'Lecturer' },
  { value: UserRole.LEARNER, label: 'Learner' },
  { value: UserRole.DATA_MANAGER, label: 'Data Manager' },
  { value: UserRole.CONTENT_REVIEWER, label: 'Content Reviewer' },
  { value: UserRole.SUPPORT_AGENT, label: 'Support Agent' },
];

const INSTITUTION_ADMIN_ROLE_FILTERS: Array<{ value: string; label: string }> = [
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
  if (viewerRole === UserRole.INSTITUTION_ADMIN) {
    return true;
  }
  return false;
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none',
        ROLE_CHIP_CLASS[role],
      )}
    >
      {ROLE_SHORT_LABEL[role]}
    </span>
  );
}

function LearnerTypeBadge({
  learnerType,
}: {
  learnerType?: 'internal' | 'public' | null;
}) {
  if (!learnerType) return <span className="text-muted-foreground">—</span>;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] uppercase',
        learnerType === 'internal'
          ? 'border-sky-200 bg-sky-50 text-sky-800'
          : 'border-amber-200 bg-amber-50 text-amber-800',
      )}
    >
      {learnerType === 'internal' ? 'Internal' : 'Public'}
    </Badge>
  );
}

export function UsersTable() {
  const { role: viewerRole } = useDashboard();
  const isInstitutionScoped = viewerRole === UserRole.INSTITUTION_ADMIN;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [learnerTypeFilter, setLearnerTypeFilter] = useState<string>('all');
  const [sort, setSort] = useState(DEFAULT_USER_SORT);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const roleFilterOptions = isInstitutionScoped
    ? INSTITUTION_ADMIN_ROLE_FILTERS
    : SUPER_ADMIN_ROLE_FILTERS;
  const sortOptions = isInstitutionScoped
    ? INSTITUTION_ADMIN_SORT_OPTIONS
    : USER_SORT_OPTIONS;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchq(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email..."
              className="h-10 pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={learnerTypeFilter}
            onValueChange={(value) => {
              setLearnerTypeFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Learner type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All learner types</SelectItem>
              <SelectItem value="internal">Internal learners</SelectItem>
              <SelectItem value="public">Public learners</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
              <SelectItem value={UserStatus.BANNED}>Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTableSortSelect
          value={sort}
          options={sortOptions}
          onValueChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        {isPending || isFetching ? (
          <DashboardTableLoadingSkeleton
            columnCount={isInstitutionScoped ? 6 : 7}
            rowCount={4}
            showPagination={false}
          />
        ) : users.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/25 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  {!isInstitutionScoped ? (
                    <th className="px-4 py-3 font-medium">Institution</th>
                  ) : null}
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row: UserListItem, index: number) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border/60 transition-colors last:border-b-0',
                      index % 2 === 1 ? 'bg-primary/[0.03]' : 'bg-background',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-[12rem]">
                        <p className="font-semibold text-foreground">{row.name ?? '—'}</p>
                        <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={row.role} />
                    </td>
                    <td className="px-4 py-3">
                      <LearnerTypeBadge learnerType={row.learnerType} />
                    </td>
                    {!isInstitutionScoped ? (
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.institution?.name ?? '—'}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          row.status === UserStatus.ACTIVE
                            ? 'text-success'
                            : 'text-muted-foreground',
                        )}
                      >
                        {getUserStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {format(new Date(row.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
