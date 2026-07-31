'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlockedProgressDetails } from '@/types/academic.types';

interface BlockedProgressCardProps {
  details: BlockedProgressDetails;
  onRetry?: () => void;
  onGoToAssessment?: () => void;
}

export function BlockedProgressCard({
  details,
  onRetry,
  onGoToAssessment,
}: BlockedProgressCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-xl border border-amber-200 bg-amber-50/50 px-6 py-10 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Progress Blocked</h2>
      <p className="mt-2 text-sm text-muted-foreground">Reason: {details.reason}</p>

      <div className="mt-6 grid w-full gap-3 rounded-lg border bg-white/80 p-4 text-left text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Attempts Remaining</p>
          <p className="mt-1 font-semibold">
            {details.attemptsExhausted
              ? '0'
              : details.attemptsRemaining ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Current Score</p>
          <p className="mt-1 font-semibold">
            {details.currentScore !== null ? `${details.currentScore}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Passing Score</p>
          <p className="mt-1 font-semibold">
            {details.passingScore !== null ? `${details.passingScore}%` : '—'}
          </p>
        </div>
      </div>

      {details.attemptsExhausted ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Attempts Exhausted. Waiting for your instructor to grant an additional attempt.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {onGoToAssessment ? (
          <Button type="button" onClick={onGoToAssessment}>
            Go to {details.assessmentTitle}
          </Button>
        ) : null}
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
