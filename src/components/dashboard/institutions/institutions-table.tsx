'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { Badge } from '@/components/ui/badge';
import {
  useInstitutionsList,
  useUpdateInstitutionActive,
} from '@/hooks/use-admin-tables';
import type { InstitutionListItem } from '@/types/admin';
import { getInstitutionStatusClassName } from '@/lib/status-utils';
import { DataTableSortSelect } from '@/components/data-table/data-table-sort-select';
import {
  DEFAULT_INSTITUTION_SORT,
  INSTITUTION_SORT_OPTIONS,
} from '@/lib/institution-table-sort';

const PAGE_SIZE = 10;

export function InstitutionsTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [sort, setSort] = useState(DEFAULT_INSTITUTION_SORT);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchq(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isFetching } = useInstitutionsList({
    page,
    limit: PAGE_SIZE,
    searchq: searchq || undefined,
    sort,
  });

  const updateActive = useUpdateInstitutionActive();

  const columns = useMemo<DataTableColumn<InstitutionListItem>[]>(
    () => [
      {
        id: 'name',
        header: 'Institution',
        skeleton: 'double',
        cell: (row) => (
          <div className="min-w-[10rem]">
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.slug}</p>
          </div>
        ),
      },
      {
        id: 'admin',
        header: 'Admin',
        skeleton: 'double',
        cell: (row) => {
          const admin = row.users[0];
          if (!admin) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          return (
            <div>
              <p className="text-sm text-foreground">{admin.name ?? 'Pending onboarding'}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          );
        },
      },
      {
        id: 'members',
        header: 'Members',
        className: 'text-muted-foreground',
        skeleton: 'narrow',
        cell: (row) => row._count.users,
      },
      {
        id: 'status',
        header: 'Status',
        skeleton: 'badge',
        cell: (row) => (
          <Badge
            variant="outline"
            className={getInstitutionStatusClassName(row.institutionStatus)}
          >
            {row.institutionStatus}
          </Badge>
        ),
      },
      {
        id: 'created',
        header: 'Created',
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
            checked={row.active}
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

  const institutions = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <DataTable
      columns={columns}
      data={institutions}
      getRowKey={(row) => row.id}
      isLoading={isPending || isFetching}
      skeletonRowCount={PAGE_SIZE}
      emptyMessage="No institutions yet. Create one to get started."
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="Search institutions..."
      toolbar={
        <DataTableSortSelect
          value={sort}
          options={INSTITUTION_SORT_OPTIONS}
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
