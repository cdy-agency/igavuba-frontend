'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useCourseReviewComments,
  useResolveCourseReviewComment,
  useResubmitCourseForReview,
} from '@/hooks/use-course-review';
import {
  useCourseRevisionComments,
  useResubmitCourseRevision,
} from '@/hooks/use-course-revision';
import { CourseLifecycleStatus } from '@/types/course-status';
import type { CourseReviewComment } from '@/types/course-review';
import type { CourseReviewFeedbackMode } from '@/lib/course-review-feedback-context';
import { cn } from '@/lib/utils';

interface CourseReviewChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  status: CourseLifecycleStatus;
  mode: CourseReviewFeedbackMode;
  canReply: boolean;
  showResubmitFooter: boolean;
  sheetDescription: string;
  ownerName?: string;
  revisionMode?: boolean;
  onResubmitted?: () => void;
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function AdminMessage({
  comment,
  reviewerName,
  showPendingBadge,
}: {
  comment: CourseReviewComment;
  reviewerName: string;
  showPendingBadge?: boolean;
}) {
  return (
    <div className="flex items-end gap-2">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[11px] font-semibold text-orange-700"
        aria-hidden
      >
        {getInitials(reviewerName)}
      </div>
      <div className="max-w-[82%] space-y-1">
        <div className="rounded-2xl rounded-bl-md bg-muted px-3 py-2.5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-foreground">{comment.title}</p>
            {showPendingBadge ? (
              <Badge variant="outline" className="h-5 border-amber-500/40 px-1.5 text-[10px] text-amber-700">
                <Clock3 className="mr-0.5 h-3 w-3" />
                Awaiting lecturer
              </Badge>
            ) : null}
          </div>
          {comment.location ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground">{comment.location}</p>
          ) : null}
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{comment.comment}</p>
        </div>
        <p className="pl-1 text-[10px] text-muted-foreground">
          {reviewerName} · {formatMessageTime(comment.createdAt)}
        </p>
      </div>
    </div>
  );
}

function OwnerMessage({
  comment,
  senderLabel,
  highlightAsNew,
}: {
  comment: CourseReviewComment;
  senderLabel: string;
  highlightAsNew?: boolean;
}) {
  return (
    <div className="flex items-end justify-end gap-2">
      <div className="max-w-[82%] space-y-1">
        <div
          className={cn(
            'rounded-2xl rounded-br-md px-3 py-2.5 shadow-sm',
            highlightAsNew
              ? 'bg-emerald-600 text-white'
              : 'bg-primary text-primary-foreground',
          )}
        >
          {highlightAsNew ? (
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
              <Sparkles className="h-3 w-3" />
              New reply
            </p>
          ) : null}
          <p className="text-sm leading-relaxed">
            {comment.ownerResponse || 'Marked as resolved.'}
          </p>
        </div>
        <p className="pr-1 text-right text-[10px] text-muted-foreground">
          {senderLabel} · {comment.resolvedAt ? formatMessageTime(comment.resolvedAt) : ''}
        </p>
      </div>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
          highlightAsNew ? 'bg-emerald-500/15 text-emerald-700' : 'bg-primary/15 text-primary',
        )}
        aria-hidden
      >
        {getInitials(senderLabel)}
      </div>
    </div>
  );
}

export function CourseReviewChatSheet({
  open,
  onOpenChange,
  courseId,
  status,
  mode,
  canReply,
  showResubmitFooter,
  sheetDescription,
  ownerName = 'Lecturer',
  revisionMode = false,
  onResubmitted,
}: CourseReviewChatSheetProps) {
  const shouldFetchInitial =
    !revisionMode &&
    (status === CourseLifecycleStatus.CHANGES_REQUESTED ||
      status === CourseLifecycleStatus.UNDER_REVIEW);
  const shouldFetchRevision = revisionMode && open;

  const { data: initialData, isPending: initialPending } = useCourseReviewComments(
    courseId,
    shouldFetchInitial && open,
  );
  const { data: revisionData, isPending: revisionPending } = useCourseRevisionComments(
    courseId,
    shouldFetchRevision,
  );

  const data = revisionMode ? revisionData : initialData;
  const isPending = revisionMode ? revisionPending : initialPending;
  const resolveMutation = useResolveCourseReviewComment(courseId);
  const resubmitInitialMutation = useResubmitCourseForReview();
  const resubmitRevisionMutation = useResubmitCourseRevision();
  const isResubmitPending =
    resubmitInitialMutation.isPending || resubmitRevisionMutation.isPending;
  const [draft, setDraft] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const comments = data?.comments ?? [];
  const unresolvedComments = useMemo(
    () => comments.filter((comment: CourseReviewComment) => !comment.resolvedAt),
    [comments],
  );
  const unresolvedCount = unresolvedComments.length;
  const allResolved = comments.length > 0 && unresolvedCount === 0;
  const reviewerName = data?.reviewer?.name || data?.reviewer?.email || 'Institution admin';
  const ownerReplyLabel = ownerName || 'Lecturer';

  const activeComment =
    unresolvedComments.find((comment: CourseReviewComment) => comment.id === activeCommentId) ??
    unresolvedComments[0] ??
    null;

  useEffect(() => {
    if (activeComment && activeCommentId !== activeComment.id) {
      setActiveCommentId(activeComment.id);
    }
    if (!activeComment) {
      setActiveCommentId(null);
    }
  }, [activeComment, activeCommentId]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, comments, resolveMutation.isSuccess]);

  const handleReply = () => {
    if (!activeComment || !draft.trim()) return;

    resolveMutation.mutate(
      { commentId: activeComment.id, response: draft.trim() },
      {
        onSuccess: () => {
          setDraft('');
        },
      },
    );
  };

  const handleResubmit = () => {
    const onSuccess = () => {
      onOpenChange(false);
      onResubmitted?.();
    };

    if (revisionMode) {
      resubmitRevisionMutation.mutate(courseId, { onSuccess });
      return;
    }

    resubmitInitialMutation.mutate(courseId, { onSuccess });
  };

  if (mode === 'hidden') {
    return null;
  }

  const headerBadge =
    mode === 'lecturer-reply' && unresolvedCount > 0 ? (
      <Badge variant="outline" className="border-orange-500/40 text-orange-700">
        {unresolvedCount} need your reply
      </Badge>
    ) : mode === 'admin-awaiting' && unresolvedCount > 0 ? (
      <Badge variant="outline" className="border-blue-500/40 text-blue-700">
        {unresolvedCount} waiting on lecturer
      </Badge>
    ) : mode === 'admin-review-replies' ? (
      <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
        <Sparkles className="mr-1 h-3 w-3" />
        Lecturer responded
      </Badge>
    ) : mode === 'lecturer-reply' && allResolved ? (
      <Badge variant="outline" className="border-success/40 text-success">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Ready to resubmit
      </Badge>
    ) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="custom-scrollbar custom-scrollbar-light flex h-full w-full flex-col gap-0 border-l p-0 sm:max-w-[440px]"
      >
        <SheetHeader className="shrink-0 space-y-2 border-b px-5 py-4 pr-12 text-left">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                mode === 'admin-review-replies'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : mode === 'admin-awaiting'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-orange-500/10 text-orange-600',
              )}
            >
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base">
                {mode === 'lecturer-reply'
                  ? 'Admin feedback'
                  : mode === 'admin-awaiting'
                    ? 'Sent feedback'
                    : 'Lecturer replies'}
              </SheetTitle>
              <SheetDescription className="text-xs">{sheetDescription}</SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {headerBadge}
            {data?.requestedAt ? (
              <span className="text-[11px] text-muted-foreground">
                {mode === 'admin-review-replies' ? 'Updated' : 'Requested'}{' '}
                {formatReviewDate(data.requestedAt)}
              </span>
            ) : null}
          </div>
        </SheetHeader>

        <div className="custom-scrollbar custom-scrollbar-light min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-4 py-4">
          {isPending ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading feedback...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No review feedback found.</p>
          ) : (
            <div
              className={cn(
                'space-y-5',
                resolveMutation.isPending && 'pointer-events-none opacity-80',
              )}
            >
              {comments.map((comment: CourseReviewComment, index: number) => (
                <div key={comment.id} className="space-y-3">
                  {index > 0 ? (
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Item {index + 1}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  ) : null}
                  <AdminMessage
                    comment={comment}
                    reviewerName={reviewerName}
                    showPendingBadge={mode === 'admin-awaiting' && !comment.resolvedAt}
                  />
                  {comment.resolvedAt ? (
                    <OwnerMessage
                      comment={comment}
                      senderLabel={mode === 'lecturer-reply' ? 'You' : ownerReplyLabel}
                      highlightAsNew={mode === 'admin-review-replies'}
                    />
                  ) : null}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {canReply && activeComment ? (
          <div className="shrink-0 border-t bg-background px-4 py-3">
            {showResubmitFooter && allResolved ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  All feedback addressed. Resubmit when your course updates are ready.
                </p>
                <Button
                  type="button"
                  className="w-full gap-2"
                  disabled={isResubmitPending}
                  onClick={handleResubmit}
                >
                  {isResubmitPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Resubmit for review
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {unresolvedComments.length > 1 ? (
                  <div className="custom-scrollbar custom-scrollbar-light flex gap-1.5 overflow-x-auto pb-1">
                    {unresolvedComments.map((comment: CourseReviewComment) => (
                      <button
                        key={comment.id}
                        type="button"
                        onClick={() => setActiveCommentId(comment.id)}
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                          comment.id === activeComment.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {comment.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="truncate text-xs font-medium text-foreground">
                    Reply to: {activeComment.title}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Describe what you changed..."
                    rows={2}
                    className="min-h-[64px] max-h-32 resize-none bg-muted/30 text-sm"
                    disabled={resolveMutation.isPending}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    disabled={resolveMutation.isPending || !draft.trim()}
                    onClick={handleReply}
                    aria-label="Send reply"
                  >
                    {resolveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
