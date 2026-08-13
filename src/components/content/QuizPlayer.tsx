'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useMyQuizAttempts,
  useQuizAttemptResult,
  useStartQuizAttempt,
  useSubmitQuizAttempt,
} from '@/hooks/use-quiz-attempt';
import { QuestionType } from '@/types/question';
import type {
  LearnerQuizQuestion,
  LearningQuizContent,
  QuizAttemptStartPayload,
  QuizAttemptSummary,
  QuizSubmitResult,
} from '@/types/quiz-attempt';
import { cn } from '@/lib/utils';

interface QuizPlayerProps {
  quizId: string;
  courseId: string;
  courseSlug?: string;
  contentId: string;
  moduleId?: string;
  quizMeta: LearningQuizContent;
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

function getQuestionFeedback(question: LearnerQuizQuestion) {
  const earned = question.earnedPoints ?? 0;
  const total = question.points;

  if (earned >= total) {
    return {
      label: 'Correct',
      detail: `Earned ${earned}/${total} point${total === 1 ? '' : 's'}`,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    };
  }

  if (earned > 0) {
    const partialDetail =
      question.type === QuestionType.MULTIPLE_CHOICE &&
      question.correctSelections != null &&
      question.totalCorrectOptions
        ? `You selected ${question.correctSelections} of ${question.totalCorrectOptions} correct answer${question.totalCorrectOptions === 1 ? '' : 's'} · ${earned}/${total} point${total === 1 ? '' : 's'}`
        : `Earned ${earned}/${total} point${total === 1 ? '' : 's'}`;

    return {
      label: 'Partially correct',
      detail: partialDetail,
      className: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }

  return {
    label: 'Incorrect',
    detail: `Earned 0/${total} point${total === 1 ? '' : 's'}`,
    className: 'border-destructive/30 bg-destructive/5 text-destructive',
  };
}

function getOptionReviewClass(
  option: LearnerQuizQuestion['options'][number],
  showCorrectAnswers: boolean,
) {
  if (option.wasSelected) {
    return option.selectionCorrect
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-destructive/30 bg-destructive/5 text-destructive';
  }

  if (showCorrectAnswers && option.isCorrect) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }

  return 'border-border bg-background text-foreground';
}

function OptionControl({
  question,
  optionId,
  checked,
  onToggle,
  disabled,
}: {
  question: LearnerQuizQuestion;
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

function QuizResultView({
  result,
  showCorrectAnswers,
  hiddenMessage,
}: {
  result: QuizSubmitResult | null;
  showCorrectAnswers: boolean;
  hiddenMessage?: string;
}) {
  if (hiddenMessage) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">{hiddenMessage}</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-lg border bg-muted/20 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Score</p>
          <p className="mt-1 text-2xl font-semibold">
            {result.score}/{result.totalPoints}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Percentage</p>
          <p className="mt-1 text-2xl font-semibold">{result.percentage}%</p>
          {result.usedBestScore ? (
            <p className="mt-1 text-xs text-muted-foreground">Best score across all attempts</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Result</p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold',
              result.passed ? 'text-emerald-600' : 'text-destructive',
            )}
          >
            {result.timeLimitExceeded ? 'Failed (Time exceeded)' : result.passed ? 'Passed' : 'Failed'}
          </p>
        </div>
      </div>

      {result.result?.questions?.length ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review your answers</h3>
          {result.result.questions.map((question, index) => {
            const feedback = getQuestionFeedback(question);

            return (
              <div key={question.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Question {index + 1}
                    </p>
                    <p className="mt-1 font-medium">{question.title}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-semibold',
                      feedback.className,
                    )}
                  >
                    {feedback.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{feedback.detail}</p>
                <ul className="mt-3 space-y-2">
                  {question.options.map((option) => {
                    const optionClass = getOptionReviewClass(option, showCorrectAnswers);

                    return (
                      <li
                        key={option.id}
                        className={cn('rounded-md border px-3 py-2 text-sm', optionClass)}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{option.text}</span>
                          {option.wasSelected ? (
                            <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                              {option.selectionCorrect ? 'Your answer · Correct' : 'Your answer · Wrong'}
                            </span>
                          ) : showCorrectAnswers && option.isCorrect ? (
                            <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                              Correct answer
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {showCorrectAnswers && question.explanation ? (
                  <p className="mt-3 text-sm text-muted-foreground">{question.explanation}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function QuizPlayer({
  quizId,
  courseId,
  courseSlug,
  contentId,
  quizMeta,
  title,
  description,
  instructions,
  isCompleted,
  onContinue,
  onProgressUpdated,
}: QuizPlayerProps) {
  const { data: attemptHistory, isPending: isHistoryPending } = useMyQuizAttempts(
    quizId,
    courseId,
  );
  const startAttempt = useStartQuizAttempt(quizId, courseId, courseSlug);
  const submitAttempt = useSubmitQuizAttempt(quizId, courseId, courseSlug);

  const [phase, setPhase] = useState<'intro' | 'attempt' | 'result'>('intro');
  const [attemptData, setAttemptData] = useState<QuizAttemptStartPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const attemptsRemaining =
    submitResult?.attemptsRemaining ?? attemptHistory?.attemptsRemaining ?? quizMeta.maxAttempts;
  const hasPassed =
    submitResult?.passed === true ||
    attemptHistory?.bestPassed === true ||
    isCompleted === true;
  const canAttempt = attemptsRemaining > 0 && !hasPassed;
  const inProgressAttempt = attemptHistory?.attempts.find(
    (attempt: QuizAttemptSummary) => attempt.inProgress,
  );
  const canStart = Boolean(inProgressAttempt) || canAttempt;
  const submittedAttempts = useMemo(
    () =>
      (attemptHistory?.attempts ?? []).filter(
        (attempt: QuizAttemptSummary) => !attempt.inProgress && attempt.submittedAt,
      ),
    [attemptHistory?.attempts],
  );
  const bestAttemptId = useMemo(() => {
    if (!submittedAttempts.length) return null;
    return submittedAttempts.reduce((best, attempt) =>
      attempt.percentage > best.percentage ? attempt : best,
    ).id;
  }, [submittedAttempts]);
  const showAttemptHistory = submittedAttempts.length > 0;
  const { data: selectedAttemptResult, isPending: isSelectedAttemptPending } =
    useQuizAttemptResult(quizId, selectedAttemptId ?? '', courseId, Boolean(selectedAttemptId));

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

  useEffect(() => {
    if (phase !== 'attempt' || remainingSeconds !== 0 || submitAttempt.isPending) {
      return;
    }
    void handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, phase]);

  const selectedForCurrent = currentQuestion ? answers[currentQuestion.id] ?? [] : [];

  const allAnswered = useMemo(
    () => questions.every((question) => (answers[question.id]?.length ?? 0) > 0),
    [answers, questions],
  );

  const handleStart = async () => {
    try {
      const response = await startAttempt.mutateAsync();
      setAttemptData(response.data);
      setAnswers({});
      setCurrentIndex(0);
      setSubmitResult(null);
      setSelectedAttemptId(null);
      setPhase('attempt');
    } catch {
      // toast handled in hook
    }
  };

  const historicalResult = useMemo((): QuizSubmitResult | null => {
    if (!selectedAttemptResult) return null;
    const totalPoints =
      selectedAttemptResult.totalPoints ??
      selectedAttemptResult.result?.questions?.reduce(
        (sum, question) => sum + (question.points ?? 0),
        0,
      ) ??
      0;

    return {
      attemptId: selectedAttemptResult.attemptId,
      quizId: selectedAttemptResult.quizId ?? quizId,
      contentId: selectedAttemptResult.contentId ?? contentId,
      courseId: selectedAttemptResult.courseId ?? courseId,
      score: selectedAttemptResult.score ?? 0,
      totalPoints,
      percentage: selectedAttemptResult.percentage ?? 0,
      passed: Boolean(selectedAttemptResult.passed),
      timeLimitExceeded: Boolean(selectedAttemptResult.timeLimitExceeded),
      attemptsUsed: selectedAttemptResult.attemptsUsed ?? attemptHistory?.attemptsUsed ?? 0,
      attemptsRemaining:
        selectedAttemptResult.attemptsRemaining ??
        attemptHistory?.attemptsRemaining ??
        quizMeta.maxAttempts,
      markedComplete: Boolean(selectedAttemptResult.markedComplete),
      usedBestScore: selectedAttemptResult.attemptId === bestAttemptId,
      showResults: selectedAttemptResult.showResults ?? !selectedAttemptResult.message,
      showCorrectAnswers: Boolean(selectedAttemptResult.showCorrectAnswers),
      message: selectedAttemptResult.message,
      result: selectedAttemptResult.result,
    };
  }, [
    selectedAttemptResult,
    quizId,
    contentId,
    courseId,
    attemptHistory?.attemptsUsed,
    attemptHistory?.attemptsRemaining,
    quizMeta.maxAttempts,
    bestAttemptId,
  ]);

  const displayResult = selectedAttemptId ? historicalResult : submitResult;

  const handleOptionToggle = (question: LearnerQuizQuestion, optionId: string, checked: boolean) => {
    setAnswers((current) => {
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

    const payload = {
      attemptId: attemptData.attemptId,
      answers: questions.map((question) => ({
        questionId: question.id,
        selectedOptionIds: answers[question.id] ?? [],
      })),
    };

    if (!autoFromTimer && !allAnswered) {
      return;
    }

    try {
      const response = await submitAttempt.mutateAsync(payload);
      setSelectedAttemptId(null);
      setSubmitResult(response.data);
      setPhase('result');
      if (response.data.markedComplete && response.data.courseProgress !== undefined) {
        onProgressUpdated?.(response.data.courseProgress);
      }
    } catch {
      // toast handled in hook
    }
  };

  if (isHistoryPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-4 dark:border-orange-900/40 dark:bg-orange-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-orange-600" />
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
            <span className="font-medium">Passing score:</span> {quizMeta.passingScore}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Attempts remaining:</span> {attemptsRemaining} /{' '}
            {quizMeta.maxAttempts}
          </p>
          <p className="text-sm">
            <span className="font-medium">Time limit:</span>{' '}
            {quizMeta.timeLimitMinutes ? `${quizMeta.timeLimitMinutes} minutes` : 'None'}
          </p>
          {attemptHistory?.bestPercentage != null ? (
            <p className="text-sm font-medium text-foreground">
              Best mark: {attemptHistory.bestScore ?? '—'} ({attemptHistory.bestPercentage}%)
              {hasPassed ? ' · Passed' : ''}
            </p>
          ) : hasPassed || isCompleted ? (
            <p className="text-sm font-medium text-emerald-600">You have passed this quiz.</p>
          ) : null}
        </div>

        {showAttemptHistory ? (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Your marks</h3>
              {attemptHistory?.bestPercentage != null ? (
                <p className="text-xs text-muted-foreground">
                  Highest mark used for progress: {attemptHistory.bestPercentage}%
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              {submittedAttempts.map((attempt, index) => {
                const isBest = attempt.id === bestAttemptId;
                return (
                  <button
                    key={attempt.id}
                    type="button"
                    onClick={() => {
                      setSelectedAttemptId(attempt.id);
                      setPhase('result');
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-muted/40',
                      isBest ? 'border-emerald-300 bg-emerald-50/60' : 'border-border',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Attempt {submittedAttempts.length - index}
                        {isBest ? ' · Best' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : 'Submitted'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          attempt.passed ? 'text-emerald-600' : 'text-destructive',
                        )}
                      >
                        {attempt.score} pts · {attempt.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {!canAttempt ? (
              <p className="text-xs text-muted-foreground">
                No attempts left. Tap an attempt above to review its marks in detail.
              </p>
            ) : null}
          </div>
        ) : null}

        {instructions || attemptData?.instructions ? (
          <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
            {instructions || attemptData?.instructions}
          </div>
        ) : null}

        {hasPassed ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
            You have already passed this quiz. No further attempts are needed.
          </div>
        ) : null}

        {inProgressAttempt && !hasPassed ? (
          <p className="text-sm text-muted-foreground">
            You have an attempt in progress. Starting again will resume it.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {canStart ? (
            <Button
              type="button"
              onClick={handleStart}
              disabled={startAttempt.isPending}
              className="min-w-[160px]"
            >
              {startAttempt.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : inProgressAttempt ? (
                'Resume Quiz'
              ) : attemptHistory?.attemptsUsed ? (
                `Try Again (${attemptsRemaining} left)`
              ) : (
                'Start Quiz'
              )}
            </Button>
          ) : !hasPassed ? (
            <Button type="button" disabled className="min-w-[160px]">
              No Attempts Left
            </Button>
          ) : null}
          {hasPassed || attemptHistory?.attemptsUsed ? (
            <Button type="button" variant={hasPassed ? 'default' : 'outline'} onClick={onContinue}>
              Continue Learning
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    if (selectedAttemptId && isSelectedAttemptPending) {
      return (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {selectedAttemptId ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Viewing attempt marks
              {displayResult?.usedBestScore ? ' · Best score' : ''}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAttemptId(null);
                setPhase('intro');
              }}
            >
              Back to overview
            </Button>
          </div>
        ) : null}
        <QuizResultView
          result={displayResult}
          showCorrectAnswers={Boolean(displayResult?.showCorrectAnswers)}
          hiddenMessage={
            displayResult && !displayResult.showResults
              ? displayResult.message || 'Results are hidden by instructor.'
              : undefined
          }
        />
        <div className="flex flex-wrap gap-3">
          {canAttempt && !hasPassed ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedAttemptId(null);
                setPhase('intro');
              }}
            >
              Try Again ({attemptsRemaining} left)
            </Button>
          ) : null}
          <Button type="button" onClick={onContinue}>
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

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
          </div>

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
            disabled={selectedForCurrent.length === 0 || submitAttempt.isPending}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!allAnswered || submitAttempt.isPending}
          >
            {submitAttempt.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Submit Quiz'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
