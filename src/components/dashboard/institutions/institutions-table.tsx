'use client';

import { useEffect, useState } from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { InstitutionLogo } from '@/components/dashboard/institutions/institution-logo';
import { EditInstitutionModal } from '@/components/dashboard/institutions/edit-institution-modal';
import { DeleteInstitutionDialog } from '@/components/dashboard/institutions/delete-institution-dialog';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { useDeleteInstitution, useInstitutionsList } from '@/hooks/use-admin-tables';
import { deleteInstitution as deleteInstitutionApi } from '@/api/institution.api';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type { InstitutionListItem } from '@/types/admin';
import { DataTableSortSelect } from '@/components/data-table/data-table-sort-select';
import {
  DEFAULT_INSTITUTION_SORT,
  INSTITUTION_SORT_OPTIONS,
} from '@/lib/institution-table-sort';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';
import { DashboardTableLoadingSkeleton } from '@/components/dashboard/shared/dashboard-skeletons';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

function InstitutionStatusBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE';
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        isActive
          ? 'border-primary/25 bg-primary/10 text-primary'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      {status}
    </Badge>
  );
}

export function InstitutionsTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [sort, setSort] = useState(DEFAULT_INSTITUTION_SORT);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstitutionListItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const deleteInstitution = useDeleteInstitution();

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const results = await Promise.allSettled(
      selectedIds.map((id) => deleteInstitutionApi(id)),
    );

    const hasError = results.some((result) => result.status === 'rejected');
    if (hasError) {
      const firstError = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      toast.error(
        getApiErrorMessage(
          firstError?.reason,
          'Unable to delete selected institutions.',
        ),
      );
    } else {
      toast.success(
        `Deleted ${selectedIds.length} selected institution${
          selectedIds.length === 1 ? '' : 's'
        } successfully.`,
      );
    }

    setSelectedIds([]);
    setBulkDeleteOpen(false);
    queryClient.invalidateQueries({ queryKey: ['institutions'] });
  };

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

  const institutionsData = data?.data;
  const institutions = institutionsData ?? [];
  const pagination = data?.pagination;
  const allSelected =
    institutions.length > 0 &&
    institutions.every((row: InstitutionListItem) => selectedIds.includes(row.id));

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? institutions.map((row: InstitutionListItem) => row.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search institutions..."
              className="h-10 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DataTableSortSelect
              value={sort}
              options={INSTITUTION_SORT_OPTIONS}
              onValueChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
            {selectedIds.length > 0 ? (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                Delete all selected
              </Button>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          {isPending || isFetching ? (
            <DashboardTableLoadingSkeleton columnCount={5} rowCount={4} showPagination={false} />
          ) : institutions.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No institutions yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-muted/25 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                        aria-label="Select all institutions"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((row: InstitutionListItem, index: number) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-border/60 transition-colors last:border-b-0',
                        index % 2 === 1 ? 'bg-primary/[0.03]' : 'bg-background',
                        selectedIds.includes(row.id) && 'bg-primary/[0.06]',
                      )}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedIds.includes(row.id)}
                          onCheckedChange={(checked) => toggleOne(row.id, Boolean(checked))}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex min-w-[12rem] items-center gap-3">
                          <InstitutionLogo
                            name={row.name}
                            abbreviation={row.abbreviation}
                            logo={row.logo}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{row.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {row.abbreviation ?? row.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{row.slug}</td>
                      <td className="px-4 py-4">
                        <InstitutionStatusBadge status={row.institutionStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <DashboardActionGroup className="justify-end">
                          <DashboardActionIconButton
                            label="Edit"
                            icon={Pencil}
                            variant="primary"
                            onClick={() => setEditId(row.id)}
                          />
                          <DashboardActionIconButton
                            label="Delete"
                            icon={Trash2}
                            variant="destructive"
                            onClick={() => setDeleteTarget(row)}
                          />
                        </DashboardActionGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <EditInstitutionModal
        institutionId={editId}
        open={Boolean(editId)}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
        }}
      />

      <DeleteInstitutionDialog
        institution={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />

      <DeleteDialog
        isOpen={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected institutions"
        description={`Are you sure you want to delete ${selectedIds.length} selected institutions? This action cannot be undone.`}
        confirmText={`Delete ${selectedIds.length}`}
        onConfirm={async () => {
          for (const id of selectedIds) {
            await deleteInstitution.mutateAsync(id);
          }
          setSelectedIds([]);
        }}
      />
    </>
  );
}
