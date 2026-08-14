'use client';

import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Shared outer spacing for every course-builder content panel. */
export const BUILDER_CONTENT_OUTER_CLASS =
  'mx-auto w-full max-w-none px-3 py-4 sm:px-4 md:px-5 md:py-5';

interface BuilderLessonShellProps {
  title: string;
  onTitleChange?: (value: string) => void;
  onTitleBlur?: () => void;
  titlePlaceholder?: string;
  titleError?: string | null;
  description: string;
  onDescriptionChange?: (value: string) => void;
  onDescriptionBlur?: () => void;
  onDelete?: () => void;
  statusBadge?: {
    label: string;
    tone?: 'success' | 'warning' | 'danger' | 'neutral';
  };
  onReset?: () => void;
  readOnly?: boolean;
  icon: ReactNode;
  settings?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BuilderLessonShell({
  title,
  onTitleChange,
  onTitleBlur,
  titlePlaceholder = 'Lesson title',
  titleError = null,
  description,
  onDescriptionChange,
  onDescriptionBlur,
  onDelete,
  statusBadge,
  onReset,
  readOnly = false,
  icon,
  settings,
  children,
  footer,
  className,
}: BuilderLessonShellProps) {
  return (
    <div className={cn(BUILDER_CONTENT_OUTER_CLASS, className)}>
      <article className="flex flex-col overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-sm">
        <div className="border-b border-border/50 px-5 pb-5 pt-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  value={title}
                  readOnly={readOnly}
                  onChange={readOnly ? undefined : (event) => onTitleChange?.(event.target.value)}
                  onBlur={onTitleBlur}
                  placeholder={titlePlaceholder}
                  aria-invalid={Boolean(titleError)}
                  className={cn(
                    'w-full border-0 border-b-2 bg-transparent pb-1 text-xl font-semibold tracking-tight text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0',
                    titleError
                      ? 'border-destructive focus:border-destructive'
                      : 'border-transparent focus:border-primary/70',
                    readOnly && 'cursor-default',
                  )}
                />
                {titleError ? (
                  <p className="text-[12px] font-medium text-destructive">{titleError}</p>
                ) : null}
                <input
                  value={description}
                  readOnly={readOnly}
                  onChange={
                    readOnly ? undefined : (event) => onDescriptionChange?.(event.target.value)
                  }
                  onBlur={onDescriptionBlur}
                  placeholder="Click to add description..."
                  className={cn(
                    'w-full border-none bg-transparent text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0',
                    readOnly && 'cursor-default',
                  )}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {statusBadge ? (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                      statusBadge.tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                      statusBadge.tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700',
                      statusBadge.tone === 'danger' && 'border-red-200 bg-red-50 text-red-700',
                      !statusBadge.tone && 'border-slate-200 bg-slate-100 text-slate-700',
                    )}
                  >
                    {statusBadge.label}
                  </span>
                  {onReset ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md border-slate-200 px-2 text-[10px] font-medium uppercase tracking-wide"
                      onClick={onReset}
                    >
                      reset
                    </Button>
                  ) : null}
                </div>
              ) : null}
                {onDelete && !readOnly && !statusBadge ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={onDelete}
                  aria-label="Delete lesson"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {settings ? (
          <div className="border-b border-border/50 px-5 py-5 sm:px-6">{settings}</div>
        ) : null}

        <div className="flex-1 px-5 py-5 sm:px-6">{children}</div>

        {footer}
      </article>
    </div>
  );
}
