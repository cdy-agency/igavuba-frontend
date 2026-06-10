'use client';

import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuilderLessonShellProps {
  title: string;
  onTitleChange: (value: string) => void;
  onTitleBlur?: () => void;
  titlePlaceholder?: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  onDescriptionBlur?: () => void;
  onDelete: () => void;
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
  description,
  onDescriptionChange,
  onDescriptionBlur,
  onDelete,
  icon,
  settings,
  children,
  footer,
  className,
}: BuilderLessonShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-4xl px-6 py-6', className)}>
      <article className="flex flex-col overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-sm">
        <div className="border-b border-border/50 px-8 pb-5 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  value={title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  onBlur={onTitleBlur}
                  placeholder={titlePlaceholder}
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
          </div>
        </div>

        {settings ? <div className="border-b border-border/50 px-8 py-5">{settings}</div> : null}

        <div className="flex-1 px-8 py-6">{children}</div>

        {footer}
      </article>
    </div>
  );
}
