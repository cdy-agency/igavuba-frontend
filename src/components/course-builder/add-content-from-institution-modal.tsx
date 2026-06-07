'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  LayoutGrid,
  Loader2,
  Search,
  Video,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAttachExistingContent, useContentLibrary } from '@/hooks/use-content-library';
import { ContentType, type ContentRecord } from '@/types/content';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type ContentFilter = 'all' | ContentType;

interface AddContentFromInstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string | null;
  onContentAttached?: (contentId: string) => void;
}

const FILTER_TABS: { id: ContentFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: ContentType.TEXT, label: 'Lessons', icon: FileText },
  { id: ContentType.VIDEO, label: 'Video', icon: Video },
  { id: ContentType.DOCUMENT, label: 'Resources', icon: Film },
];

function contentTypeIcon(type: ContentType) {
  switch (type) {
    case ContentType.VIDEO:
      return Video;
    case ContentType.DOCUMENT:
      return Film;
    default:
      return FileText;
  }
}

export function AddContentFromInstitutionModal({
  open,
  onOpenChange,
  moduleId,
  onContentAttached,
}: AddContentFromInstitutionModalProps) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<ContentFilter>('all');
  const [page, setPage] = useState(1);

  const attachMutation = useAttachExistingContent(moduleId ?? '');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!open) return;
    setSearchInput('');
    setDebouncedSearch('');
    setFilter('all');
    setPage(1);
  }, [open]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      type: filter === 'all' ? undefined : filter,
      page,
      limit: PAGE_SIZE,
      sort: 'newest' as const,
    }),
    [debouncedSearch, filter, page],
  );

  const { data, isPending, isFetching } = useContentLibrary(queryParams, open && Boolean(moduleId));

  const items: ContentRecord[] = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const handleAttach = async (contentId: string) => {
    if (!moduleId) return;
    const response = await attachMutation.mutateAsync(contentId);
    onContentAttached?.(response.data.contentId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="space-y-1 border-b px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Add Content from Institution
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Browse and add existing content to this module
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title or description..."
              className="h-10 w-full rounded-lg border border-border/80 bg-background pl-10 pr-3 text-[13px] outline-none placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors',
                    isActive
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-border/80 bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="custom-scrollbar custom-scrollbar-light min-h-[280px] flex-1 overflow-y-auto px-6">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/80 px-6 py-12 text-center">
              <p className="text-[13px] font-medium text-foreground">No content found</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Try a different search or filter.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {items.map((item) => {
                const Icon = contentTypeIcon(item.type);
                const isAttaching =
                  attachMutation.isPending && attachMutation.variables === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={attachMutation.isPending}
                    onClick={() => void handleAttach(item.id)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border/70 bg-background px-4 py-3.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/20 disabled:opacity-60"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {isAttaching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-bold uppercase tracking-wide text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {item.type}
                        </span>
                        {item.isPublished ? (
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                            Visible
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3.5">
          <p className="text-[12px] text-muted-foreground">
            {isFetching && !isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            ) : (
              <>
                Showing {startItem} to {endItem} of {total} results
              </>
            )}
          </p>

          <div className="flex items-center gap-1 text-[12px] font-medium text-foreground">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-1 text-muted-foreground">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
