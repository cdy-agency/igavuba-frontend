'use client';

import { cn } from '@/lib/utils';

interface CoursesPaginationFooterProps {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

export function CoursesPaginationFooter({
  total,
  page,
  totalPages,
  limit,
  onPageChange,
  isLoading,
}: CoursesPaginationFooterProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const showPagination = total > 10;

  if (!showPagination && !isLoading) {
    return null;
  }

  if (isLoading && showPagination) {
    return (
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
          <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
          <div className="h-7 w-12 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  if (!showPagination) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {startItem} - {endItem} of {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            isFirstPage
              ? 'cursor-not-allowed text-muted-foreground/50'
              : 'border border-border bg-background text-foreground hover:bg-muted/50',
          )}
        >
          Previous
        </button>

        {pageNumbers.map((pageNumber, index) =>
          pageNumber === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={cn(
                'flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors',
                pageNumber === page
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-background text-foreground hover:bg-muted/50',
              )}
            >
              {pageNumber}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            isLastPage
              ? 'cursor-not-allowed text-muted-foreground/50'
              : 'border border-border bg-background text-foreground hover:bg-muted/50',
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
