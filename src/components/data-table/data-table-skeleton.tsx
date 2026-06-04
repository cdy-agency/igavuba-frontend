'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type DataTableSkeletonCell =
  | 'text'
  | 'double'
  | 'badge'
  | 'switch'
  | 'narrow';

export function DataTableSkeletonCellContent({
  variant = 'text',
}: {
  variant?: DataTableSkeletonCell;
}) {
  switch (variant) {
    case 'double':
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 max-w-full" />
          <Skeleton className="h-3 w-40 max-w-full" />
        </div>
      );
    case 'badge':
      return <Skeleton className="h-6 w-20 rounded-full" />;
    case 'switch':
      return (
        <div className="flex justify-end">
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      );
    case 'narrow':
      return <Skeleton className="h-4 w-10" />;
    case 'text':
    default:
      return <Skeleton className="h-4 w-28 max-w-full" />;
  }
}

interface DataTableToolbarSkeletonProps {
  showSort?: boolean;
  className?: string;
}

export function DataTableToolbarSkeleton({
  showSort = true,
  className,
}: DataTableToolbarSkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <Skeleton className="h-10 w-full max-w-sm" />
      {showSort ? <Skeleton className="h-10 w-[12.5rem] shrink-0" /> : null}
    </div>
  );
}

export function DataTablePaginationSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}

export interface DataTableSkeletonColumn {
  id: string;
  headerClassName?: string;
  className?: string;
  skeleton?: DataTableSkeletonCell;
}

interface DataTableBodySkeletonProps {
  columns: DataTableSkeletonColumn[];
  rowCount?: number;
}

export function DataTableBodySkeleton({
  columns,
  rowCount = 10,
}: DataTableBodySkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {columns.map((column) => (
            <TableCell key={column.id} className={column.className}>
              <DataTableSkeletonCellContent variant={column.skeleton} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface DataTableSkeletonProps {
  columns: DataTableSkeletonColumn[];
  headers: { id: string; label: string; headerClassName?: string }[];
  rowCount?: number;
  showSort?: boolean;
  className?: string;
}

/**
 * Full table card skeleton (toolbar + header + rows + pagination).
 */
export function DataTableSkeleton({
  columns,
  headers,
  rowCount = 10,
  showSort = true,
  className,
}: DataTableSkeletonProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      <DataTableToolbarSkeleton showSort={showSort} />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide text-transparent',
                  header.headerClassName,
                )}
              >
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <DataTableBodySkeleton columns={columns} rowCount={rowCount} />
        </TableBody>
      </Table>
      <DataTablePaginationSkeleton />
    </div>
  );
}
