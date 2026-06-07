'use client';

import type { ReactNode } from 'react';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuilderLessonShellProps {
  title: string;
  onTitleChange: (value: string) => void;
  onTitleBlur?: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  onDescriptionBlur?: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  children: ReactNode;
  materials?: ReactNode;
  className?: string;
}

export function BuilderLessonShell({
  title,
  onTitleChange,
  onTitleBlur,
  description,
  onDescriptionChange,
  onDescriptionBlur,
  onDelete,
  onPreview,
  children,
  materials,
  className,
}: BuilderLessonShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-4xl', className)}>
      <article className="flex flex-col rounded-lg border border-border/60 bg-white shadow-sm">
        <div className="border-b border-border/50 px-8 pb-5 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  value={title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  onBlur={onTitleBlur}
                  placeholder="Lesson title"
                  className="w-full border-none bg-transparent text-xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
                />
                <input
                  value={description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  onBlur={onDescriptionBlur}
                  placeholder="Click to add description..."
                  className="w-full border-none bg-transparent text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onPreview ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={onPreview}
                  aria-label="Preview lesson"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                aria-label="Delete lesson"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 py-6">{children}</div>

        {/* <div className="border-t border-border/50 px-8 py-6">
          <div className="rounded-lg border-2 border-dashed border-border/80 bg-muted/10 px-6 py-5">
            <h3 className="text-[13px] font-semibold text-foreground">Lesson Material</h3>
            {materials ?? (
              <p className="mt-2 text-[12px] text-muted-foreground">No files exist</p>
            )}
          </div>
        </div> */}
      </article>
    </div>
  );
}
