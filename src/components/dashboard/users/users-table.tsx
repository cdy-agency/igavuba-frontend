'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { Badge } from '@/components/ui/badge';
import { useUsersList, useUpdateUserActive } from '@/hooks/use-admin-tables';
import type { UserListItem } from '@/types/admin';
import { UserRole, UserStatus } from '@/types/enum';
import { getRoleLabel } from '@/lib/role-utils';
import { getUserStatusClassName, getUserStatusLabel, isUserActiveStatus } from '@/lib/status-utils';
import { DataTableSortSelect } from '@/components/data-table/data-table-sort-select';
import { DEFAULT_USER_SORT, USER_SORT_OPTIONS } from '@/lib/user-table-sort';

const PAGE_SIZE = 10;

function canToggleUser(row: UserListItem): boolean {
  return row.role !== UserRole.SUPER_ADMIN && row.status !== UserStatus.PENDING;
}

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [sort, setSort] = useState(DEFAULT_USER_SORT);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchq(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isFetching } = useUsersList({
    page,
    limit: PAGE_SIZE,
    searchq: searchq || undefined,
    sort,
  });

  const updateActive = useUpdateUserActive();

  const columns = useMemo<DataTableColumn<UserListItem>[]>(
    () => [
      {
        id: 'name',
        header: 'User',
        skeleton: 'double',
        cell: (row) => (
          <div>
            <p className="font-medium text-foreground">{row.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        skeleton: 'badge',
        cell: (row) => (
          <Badge variant="secondary" className="font-normal">
            {getRoleLabel(row.role)}
          </Badge>
        ),
      },
      {
        id: 'institution',
        header: 'Institution',
        skeleton: 'text',
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.institution?.name ?? '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        skeleton: 'badge',
        cell: (row) => (
          <Badge variant="outline" className={getUserStatusClassName(row.status)}>
            {getUserStatusLabel(row.status)}
          </Badge>
        ),
      },
      {
        id: 'created',
        header: 'Joined',
        className: 'text-muted-foreground whitespace-nowrap',
        skeleton: 'text',
        cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy'),
      },
      {
        id: 'active',
        header: 'Active',
        headerClassName: 'text-right',
        className: 'text-right',
        skeleton: 'switch',
        cell: (row) => (
          <StatusSwitchCell
            checked={isUserActiveStatus(row.status)}
            disabled={!canToggleUser(row)}
            isPending={pendingId === row.id}
            onCheckedChange={(active) => {
              setPendingId(row.id);
              updateActive.mutate(
                { id: row.id, active },
                { onSettled: () => setPendingId(null) },
              );
            }}
          />
        ),
      },
    ],
    [pendingId, updateActive],
  );

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowKey={(row) => row.id}
      isLoading={isPending || isFetching}
      skeletonRowCount={PAGE_SIZE}
      emptyMessage="No users found."
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="Search users..."
      toolbar={
        <DataTableSortSelect
          value={sort}
          options={USER_SORT_OPTIONS}
          onValueChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      }
      currentPage={pagination?.page ?? page}
      totalPages={pagination?.totalPages ?? 1}
      totalItems={pagination?.total ?? 0}
      itemsPerPage={pagination?.limit ?? PAGE_SIZE}
      onPageChange={setPage}
    />
  );
}
