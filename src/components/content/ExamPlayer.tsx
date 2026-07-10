'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  useExamAttemptResult,
  useMyExamAttempts,
  useStartExamAttempt,
  useSubmitExamAttempt,
} from '@/hooks/use-exam-attempt';
import { QuestionType } from '@/types/question';
import type {
  ExamAttemptStartPayload,
  ExamAttemptSummary,
  ExamLearnerQuestion,
  ExamPublishedResult,
  LearningExamContent,
} from '@/types/exam-attempt';
import { cn } from '@/lib/utils';

interface ExamPlayerProps {
  examId: string;
  courseId: string;
  courseSlug?: string;
  examMeta: LearningExamContent;
  title: string;
  description?: string | null;
  instructions?: string | null;
  isCompleted?: boolean;
  onContinue?: () => void;
  onProgressUpdated?: (progress: number) => void;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function OptionControl({
  question,
  optionId,
  checked,
  onToggle,
  disabled,
}: {
  question: ExamLearnerQuestion;
  optionId: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const option = question.options.find((entry) => entry.id === optionId);
  if (!option) return null;

  const isMultiple = question.type === QuestionType.MULTIPLE_CHOICE;

  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors',
        checked
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/30',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      {isMultiple ? (
        <Checkbox checked={checked} onCheckedChange={(value) => onToggle(value === true)} disabled={disabled} />
      ) : (
        <input
          type="radio"
          name={`question-${question.id}`}
          checked={checked}
          onChange={() => onToggle(true)}
          disabled={disabled}
          className="mt-1 h-4 w-4 accent-primary"
        />
      )}
      <span className="text-sm leading-relaxed text-foreground">{option.text}</span>
    </label>
  );
}

function ExamPublishedResultView({ result }: { result: ExamPublishedResult }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-lg border bg-muted/20 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Final score</p>
          <p className="mt-1 text-2xl font-semibold">
            {result.finalScore}/{result.maxScore}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Percentage</p>
          <p className="mt-1 text-2xl font-semibold">{result.percentage}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Result</p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold',
              result.passed ? 'text-emerald-600' : 'text-destructive',
            )}
          >
            {result.passed ? 'Passed' : 'Failed'}
          </p>
        </div>
      </div>

      {result.questions?.length ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review</h3>
          {result.questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Question {index + 1}
                  </p>
                  <p className="mt-1 font-medium">{question.title}</p>
                </div>
                <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                  {question.earnedPoints}/{question.points} pts
                </span>
              </div>

              {question.type === QuestionType.ESSAY ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Your answer</p>
                  <p className="whitespace-pre-wrap rounded-md border bg-muted/20 px-3 py-2 text-sm">
                    {question.textAnswer || '—'}
                  </p>
                  {question.feedback ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                      <p className="mt-1 text-sm">{question.feedback}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {question.options.map((option) => {
                    const selected = question.selectedOptionIds.includes(option.id);
                    const showCorrect = result.showCorrectAnswers && option.isCorrect;

                    return (
                      <li
                        key={option.id}
                        className={cn(
                          'rounded-md border px-3 py-2 text-sm',
                          selected
                            ? 'border-primary bg-primary/5'
                            : showCorrect
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-border',
                        )}
                      >
                        {option.text}
                        {selected ? (
                          <span className="ml-2 text-xs uppercase tracking-wide opacity-70">
                            Your answer
                          </span>
                        ) : null}
                        {showCorrect && !selected ? (
                          <span className="ml-2 text-xs uppercase tracking-wide text-emerald-700">
                            Correct
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {result.showCorrectAnswers && question.explanation ? (
                <p className="mt-3 text-sm text-muted-foreground">{question.explanation}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ExamPlayer({
  examId,
  courseId,
  courseSlug,
  examMeta,
  title,
  description,
  instructions,
  isCompleted,
  onContinue,
}: ExamPlayerProps) {
  const { data: attemptHistory, isPending: isHistoryPending } = useMyExamAttempts(examId, courseId);
  const startAttempt = useStartExamAttempt(examId, courseId, courseSlug);
  const submitAttempt = useSubmitExamAttempt(examId, courseId, courseSlug);

  const latestSubmittedAttempt = attemptHistory?.attempts.find(
    (attempt: ExamAttemptSummary) => attempt.status !== 'IN_PROGRESS',
  );
  const publishedAttempt = attemptHistory?.attempts.find(
    (attempt: ExamAttemptSummary) => attempt.status === 'PUBLISHED',
  );
  const awaitingReviewAttempt = attemptHistory?.attempts.find((attempt: ExamAttemptSummary) =>
    ['SUBMITTED', 'PENDING_MANUAL_REVIEW', 'GRADED'].includes(attempt.status),
  );

  const { data: publishedResult, isPending: isResultPending } = useExamAttemptResult(
    examId,
    publishedAttempt?.id ?? '',
    courseId,
    Boolean(publishedAttempt?.id),
  );

  const [phase, setPhase] = useState<'intro' | 'attempt' | 'submitted' | 'published'>('intro');
  const [attemptData, setAttemptData] = useState<ExamAttemptStartPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [optionAnswers, setOptionAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (isHistoryPending) return;

    if (publishedAttempt) {
      setPhase('published');
      return;
    }

    if (awaitingReviewAttempt) {
      setPhase('submitted');
      setSubmitMessage('Your exam is awaiting review.');
      return;
    }

    setPhase((current) => {
      if (current === 'published' || current === 'submitted' || current === 'attempt') {
        return current;
      }
      return 'intro';
    });
  }, [isHistoryPending, publishedAttempt, awaitingReviewAttempt]);

  const attemptsRemaining = attemptHistory?.attemptsRemaining ?? examMeta.maxAttempts;
  const canStart = attemptsRemaining > 0;
  const questions = attemptData?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? null;

  useEffect(() => {
    if (!attemptData?.timeLimitMinutes || phase !== 'attempt') {
      setRemainingSeconds(null);
      return;
    }

    const limitMs = attemptData.timeLimitMinutes * 60 * 1000;
    const startedAt = new Date(attemptData.startedAt).getTime();

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, Math.ceil((limitMs - elapsed) / 1000));
      setRemainingSeconds(remaining);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [attemptData, phase]);

  const isQuestionAnswered = (question: ExamLearnerQuestion) => {
    if (question.type === QuestionType.ESSAY) {
      return Boolean(textAnswers[question.id]?.trim());
    }
    return (optionAnswers[question.id]?.length ?? 0) > 0;
  };

  const allAnswered = useMemo(
    () => questions.every((question) => isQuestionAnswered(question)),
    [questions, optionAnswers, textAnswers],
  );

  const handleStart = async () => {
    try {
      const response = await startAttempt.mutateAsync();
      setAttemptData(response.data);
      setOptionAnswers({});
      setTextAnswers({});
      setCurrentIndex(0);
      setSubmitMessage(null);
      setPhase('attempt');
    } catch {
      // handled in hook
    }
  };

  const handleOptionToggle = (question: ExamLearnerQuestion, optionId: string, checked: boolean) => {
    setOptionAnswers((current) => {
      const existing = current[question.id] ?? [];

      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        const next = checked
          ? Array.from(new Set([...existing, optionId]))
          : existing.filter((id) => id !== optionId);
        return { ...current, [question.id]: next };
      }

      return { ...current, [question.id]: checked ? [optionId] : [] };
    });
  };

  const handleSubmit = async (autoFromTimer = false) => {
    if (!attemptData) return;
    if (!autoFromTimer && !allAnswered) return;

    const payload = {
      attemptId: attemptData.attemptId,
      answers: questions.map((question) => ({
        questionId: question.id,
        selectedOptionIds:
          question.type === QuestionType.ESSAY ? undefined : optionAnswers[question.id] ?? [],
        textAnswer:
          question.type === QuestionType.ESSAY ? textAnswers[question.id]?.trim() : undefined,
      })),
    };

    try {
      const response = await submitAttempt.mutateAsync(payload);
      setSubmitMessage(
        response.data.message ||
          'Your exam has been submitted successfully and is awaiting instructor review.',
      );
      setPhase('submitted');
    } catch {
      // handled in hook
    }
  };

  useEffect(() => {
    if (phase !== 'attempt' || remainingSeconds !== 0 || submitAttempt.isPending) {
      return;
    }
    void handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, phase]);

  if (isHistoryPending || (phase === 'published' && isResultPending)) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {submitMessage || 'Your exam is awaiting review.'}
          </p>
        </div>
        <Button type="button" onClick={onContinue}>
          Continue Learning
        </Button>
      </div>
    );
  }

  if (phase === 'published' && publishedResult && 'finalScore' in publishedResult) {
    return (
      <div className="space-y-6">
        <ExamPublishedResultView result={publishedResult as ExamPublishedResult} />
        <Button type="button" onClick={onContinue}>
          Continue Learning
        </Button>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
          <p className="text-sm">
            <span className="font-medium">Passing score:</span> {examMeta.passingScore}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Attempts remaining:</span> {attemptsRemaining} /{' '}
            {examMeta.maxAttempts}
          </p>
          <p className="text-sm">
            <span className="font-medium">Time limit:</span>{' '}
            {examMeta.timeLimitMinutes ? `${examMeta.timeLimitMinutes} minutes` : 'None'}
          </p>
          {isCompleted ? (
            <p className="text-sm font-medium text-emerald-600">You have passed this exam.</p>
          ) : null}
        </div>

        {instructions ? (
          <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">{instructions}</div>
        ) : null}

        {attemptHistory?.inProgressAttemptId ? (
          <p className="text-sm text-muted-foreground">
            You have an attempt in progress. Starting will resume it.
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleStart}
          disabled={!canStart || startAttempt.isPending}
          className="min-w-[160px]"
        >
          {startAttempt.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !canStart ? (
            'No Attempts Left'
          ) : attemptHistory?.inProgressAttemptId ? (
            'Resume Exam'
          ) : (
            'Start Exam'
          )}
        </Button>
      </div>
    );
  }

  const selectedForCurrent = currentQuestion ? optionAnswers[currentQuestion.id] ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <p className="text-sm font-medium">
          Question {currentIndex + 1} of {questions.length}
        </p>
        {remainingSeconds !== null ? (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            {formatDuration(remainingSeconds)}
          </div>
        ) : null}
      </div>

      {currentQuestion ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {currentQuestion.points} point{currentQuestion.points === 1 ? '' : 's'}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{currentQuestion.title}</h3>
            {currentQuestion.instructions ? (
              <p className="mt-2 text-sm text-muted-foreground">{currentQuestion.instructions}</p>
            ) : null}
          </div>

          {currentQuestion.type === QuestionType.ESSAY ? (
            <Textarea
              value={textAnswers[currentQuestion.id] ?? ''}
              onChange={(event) =>
                setTextAnswers((current) => ({
                  ...current,
                  [currentQuestion.id]: event.target.value,
                }))
              }
              placeholder="Write your answer here..."
              rows={8}
              disabled={submitAttempt.isPending}
            />
          ) : (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <OptionControl
                  key={option.id}
                  question={currentQuestion}
                  optionId={option.id}
                  checked={selectedForCurrent.includes(option.id)}
                  onToggle={(checked) => handleOptionToggle(currentQuestion, option.id, checked)}
                  disabled={submitAttempt.isPending}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0 || submitAttempt.isPending}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
            disabled={submitAttempt.isPending}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => void handleSubmit(false)}
            disabled={!allAnswered || submitAttempt.isPending}
          >
            {submitAttempt.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Submit Exam
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
