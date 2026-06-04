'use client';

import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { DataTableToolbar } from './data-table-toolbar';
import {
  DataTableBodySkeleton,
  DataTablePaginationSkeleton,
  DataTableToolbarSkeleton,
  type DataTableSkeletonCell,
} from './data-table-skeleton';

export type { DataTableSkeletonCell };

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  cell: (row: T) => ReactNode;
  /** Skeleton shape shown while `isLoading` */
  skeleton?: DataTableSkeletonCell;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows to render in the loading skeleton (defaults to itemsPerPage or 10) */
  skeletonRowCount?: number;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading,
  emptyMessage = 'No results found.',
  className,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbar,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
  skeletonRowCount,
}: DataTableProps<T>) {
  const showToolbar = onSearchChange !== undefined && searchValue !== undefined;
  const showPagination = onPageChange !== undefined;
  const rowCount = skeletonRowCount ?? itemsPerPage ?? 10;
  const showInitialSkeleton = isLoading && data.length === 0;

  if (showInitialSkeleton) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
          className,
        )}
      >
        <DataTableToolbarSkeleton showSort={!!toolbar} />
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <DataTableBodySkeleton columns={columns} rowCount={rowCount} />
          </TableBody>
        </Table>
        {showPagination ? <DataTablePaginationSkeleton /> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      {showToolbar ? (
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        >
          {toolbar}
        </DataTableToolbar>
      ) : toolbar ? (
        <div className="border-b border-border px-4 py-4">{toolbar}</div>
      ) : null}

      <div className={cn(isLoading && data.length > 0 && 'pointer-events-none opacity-60')}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableBodySkeleton columns={columns} rowCount={rowCount} />
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && !isLoading ? (
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
          {totalItems > 0 ? (
            <p className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'result' : 'results'}
            </p>
          ) : (
            <span />
          )}
          {totalPages > 1 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          ) : null}
        </div>
      ) : showPagination && isLoading ? (
        <DataTablePaginationSkeleton />
      ) : null}
    </div>
  );
}
