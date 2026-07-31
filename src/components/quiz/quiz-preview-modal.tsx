'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { FormDialog } from '@/components/ui/form-dialog';
import { useQuizDetail } from '@/hooks/use-quiz';
import { questionTypeLabel } from '@/lib/quiz-utils';
import type { Question } from '@/types/question';

interface QuizPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
}

export function QuizPreviewModal({ open, onOpenChange, quizId }: QuizPreviewModalProps) {
  const { data: quiz, isPending } = useQuizDetail(quizId ?? '', open && Boolean(quizId));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={quiz?.assessment.title ?? 'Quiz preview'}
      description="Read-only preview of quiz content"
      contentClassName="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
    >
      {isPending ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : quiz ? (
        <div className="space-y-5 pb-2">
          {quiz.assessment.description ? (
            <p className="text-sm text-muted-foreground">{quiz.assessment.description}</p>
          ) : null}

          <div className="grid gap-3 rounded-md border bg-muted/20 p-4 text-sm sm:grid-cols-2">
            <p>
              <span className="font-medium">Passing score:</span> {quiz.passingScore}%
            </p>
            <p>
              <span className="font-medium">Max attempts:</span> {quiz.maxAttempts}
            </p>
            <p>
              <span className="font-medium">Time limit:</span>{' '}
              {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'None'}
            </p>
            <p>
              <span className="font-medium">Questions:</span> {quiz.questions.length}
            </p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question: Question, index: number) => (
              <div key={question.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Question {index + 1} · {questionTypeLabel(question.type)} · {question.points}{' '}
                      pts
                    </p>
                    <p className="mt-1 font-medium">{question.title}</p>
                  </div>
                </div>
                <ul className="space-y-2 pl-6">
                  {question.options.map((option) => (
                    <li
                      key={option.id}
                      className={
                        option.isCorrect
                          ? 'rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm'
                          : 'rounded-md border px-3 py-2 text-sm'
                      }
                    >
                      {option.text}
                    </li>
                  ))}
                </ul>
                {question.explanation ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Explanation:</span>{' '}
                    {question.explanation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Quiz not found.</p>
      )}
    </FormDialog>
  );
}
