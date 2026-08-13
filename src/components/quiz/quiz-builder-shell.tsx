'use client';

import type { ReactNode } from 'react';
import {
  Database,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { BUILDER_CONTENT_OUTER_CLASS } from '@/components/course-builder/builder-lesson-shell';
import { cn } from '@/lib/utils';

export type QuizBuilderView = 'builder' | 'settings';

/** Backend has no null maxAttempts — use a high value for "Unlimited". */
export const QUIZ_UNLIMITED_ATTEMPTS = 999;

interface QuizBuilderShellProps {
  view: QuizBuilderView;
  onViewChange: (view: QuizBuilderView) => void;
  title: string;
  onTitleChange?: (value: string) => void;
  titlePlaceholder?: string;
  titleError?: string | null;
  timeLimitMinutes: string;
  onTimeLimitChange?: (value: string) => void;
  unlimitedTime: boolean;
  onUnlimitedTimeChange?: (value: boolean) => void;
  totalMarks: number;
  passingScore: number;
  onPassingScoreChange?: (value: number) => void;
  maxAttempts: number;
  onMaxAttemptsChange?: (value: number) => void;
  unlimitedAttempts: boolean;
  onUnlimitedAttemptsChange?: (value: boolean) => void;
  isVisible?: boolean;
  onVisibilityToggle?: () => void;
  onAddQuestion?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onOpenQuestionBank?: () => void;
  isSaving?: boolean;
  readOnly?: boolean;
  builderContent: ReactNode;
  settingsContent: ReactNode;
  className?: string;
}

function MetaLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </p>
  );
}

const ghostMetaInputClassName =
  'h-8 w-16 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0';

export function QuizBuilderShell({
  view,
  onViewChange,
  title,
  onTitleChange,
  titlePlaceholder = 'Untitled Quiz',
  titleError = null,
  timeLimitMinutes,
  onTimeLimitChange,
  unlimitedTime,
  onUnlimitedTimeChange,
  totalMarks,
  passingScore,
  onPassingScoreChange,
  maxAttempts,
  onMaxAttemptsChange,
  unlimitedAttempts,
  onUnlimitedAttemptsChange,
  isVisible = true,
  onVisibilityToggle,
  onAddQuestion,
  onSave,
  onDelete,
  onOpenQuestionBank,
  isSaving = false,
  readOnly = false,
  builderContent,
  settingsContent,
  className,
}: QuizBuilderShellProps) {
  return (
    <div className={cn(BUILDER_CONTENT_OUTER_CLASS, className)}>
      <article className="flex min-h-[calc(100vh-12rem)] w-full flex-col overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-sm md:min-h-[calc(100vh-13rem)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3 sm:px-6">
          <div className="inline-flex rounded-full border border-border/70 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => onViewChange('builder')}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors',
                view === 'builder'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted/60',
              )}
            >
              Builder
            </button>
            <button
              type="button"
              onClick={() => onViewChange('settings')}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors',
                view === 'settings'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted/60',
              )}
            >
              Settings
            </button>
          </div>

          {!readOnly ? (
            <div className="flex items-center gap-0.5">
              {onAddQuestion ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={onAddQuestion}
                  aria-label="Add question"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
              {onOpenQuestionBank ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={onOpenQuestionBank}
                  aria-label="Question bank"
                >
                  <Database className="h-4 w-4" />
                </Button>
              ) : null}
              {onSave ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                  onClick={onSave}
                  disabled={isSaving}
                  aria-label="Save quiz"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              ) : null}
              {onVisibilityToggle ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 gap-1.5 px-2.5 text-[12px] font-semibold',
                    isVisible
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
                  )}
                  onClick={onVisibilityToggle}
                  aria-label={isVisible ? 'Hide quiz from learners' : 'Show quiz to learners'}
                  title={
                    isVisible
                      ? 'Visible to learners — click to hide'
                      : 'Hidden from learners — click to show'
                  }
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {isVisible ? 'Visible' : 'Hidden'}
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onDelete}
                  aria-label="Delete quiz"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 px-5 pb-4 pt-5 sm:px-6">
          <div className="space-y-1.5">
            <input
              value={title}
              readOnly={readOnly}
              onChange={readOnly ? undefined : (event) => onTitleChange?.(event.target.value)}
              placeholder={titlePlaceholder}
              aria-invalid={Boolean(titleError)}
              className={cn(
                'w-full border-0 border-b-2 bg-transparent pb-2 text-[22px] font-bold tracking-tight text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0',
                titleError
                  ? 'border-destructive focus:border-destructive'
                  : 'border-primary/70 focus:border-primary',
                readOnly && 'cursor-default',
              )}
            />
            {titleError ? (
              <p className="text-[12px] font-medium text-destructive">{titleError}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <MetaLabel>Time Limit</MetaLabel>
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  checked={unlimitedTime}
                  disabled={readOnly}
                  onCheckedChange={(checked) => {
                    onUnlimitedTimeChange?.(checked);
                    if (checked) onTimeLimitChange?.('');
                  }}
                  aria-label="Unlimited time"
                />
                {unlimitedTime || readOnly ? (
                  <span className="text-sm font-medium text-foreground">
                    {unlimitedTime ? 'Unlimited' : `${timeLimitMinutes || 'No limit'} min`}
                  </span>
                ) : (
                  <>
                    <Input
                      type="number"
                      min={1}
                      value={timeLimitMinutes}
                      onChange={(event) => onTimeLimitChange?.(event.target.value)}
                      placeholder="30"
                      className={ghostMetaInputClassName}
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <MetaLabel>Total Marks</MetaLabel>
              <p className="text-sm font-medium text-foreground">
                {totalMarks} {totalMarks === 1 ? 'mark' : 'marks'}
              </p>
            </div>

            <div className="space-y-1.5">
              <MetaLabel>Passing Score</MetaLabel>
              <div className="flex items-center gap-1.5">
                {readOnly ? (
                  <span className="text-sm font-medium text-foreground">{passingScore}</span>
                ) : (
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(event) =>
                      onPassingScoreChange?.(Number(event.target.value) || 0)
                    }
                    className={ghostMetaInputClassName}
                  />
                )}
                <span className="text-sm text-muted-foreground">% marks</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <MetaLabel>Max Attempts</MetaLabel>
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  checked={unlimitedAttempts}
                  disabled={readOnly}
                  onCheckedChange={(checked) => onUnlimitedAttemptsChange?.(checked)}
                  aria-label="Unlimited attempts"
                />
                {unlimitedAttempts || readOnly ? (
                  <span className="text-sm font-medium text-foreground">
                    {unlimitedAttempts
                      ? 'Unlimited'
                      : `${maxAttempts} ${maxAttempts === 1 ? 'time' : 'times'}`}
                  </span>
                ) : (
                  <>
                    <Input
                      type="number"
                      min={1}
                      value={maxAttempts}
                      onChange={(event) =>
                        onMaxAttemptsChange?.(Number(event.target.value) || 1)
                      }
                      className={ghostMetaInputClassName}
                    />
                    <span className="text-sm text-muted-foreground">times</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-5 py-5 sm:px-6">
          {view === 'builder' ? builderContent : settingsContent}
        </div>
      </article>
    </div>
  );
}
