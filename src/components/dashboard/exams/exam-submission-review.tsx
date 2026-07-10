'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useExamSubmissionDetail,
  useGradeExamAnswer,
  usePublishExamResult,
} from '@/hooks/use-exam';
import { QuestionType } from '@/types/question';
import { buildAssessmentsPath } from '@/lib/course-builder-navigation';
import { toast } from '@/lib/toast';

export function ExamSubmissionReview({
  examId,
  attemptId,
}: {
  examId: string;
  attemptId: string;
}) {
  const { data, isPending } = useExamSubmissionDetail(attemptId, Boolean(attemptId));
  const gradeEssay = useGradeExamAnswer(examId, attemptId);
  const publishResult = usePublishExamResult(examId);

  const [essayGrades, setEssayGrades] = useState<
    Record<string, { score: string; feedback: string }>
  >({});

  useEffect(() => {
    if (!data?.answers) return;
    const next: Record<string, { score: string; feedback: string }> = {};
    for (const answer of data.answers) {
      if (answer.questionType === QuestionType.ESSAY) {
        next[answer.id] = {
          score: answer.manualScore?.toString() ?? '',
          feedback: answer.feedback ?? '',
        };
      }
    }
    setEssayGrades(next);
  }, [data]);

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border px-6 py-12 text-center text-sm text-muted-foreground">
        Submission not found.
      </div>
    );
  }

  const essayAnswers = data.answers.filter(
    (answer: { questionType: string }) => answer.questionType === QuestionType.ESSAY,
  );
  const isPublished = data.status === 'PUBLISHED';

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href={buildAssessmentsPath('exams')} className="hover:text-foreground">
            Assessments
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Exams</span>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/dashboard/exams/${examId}/submissions`} className="hover:text-foreground">
            Submissions
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Review</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Exam submission</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.student.name ?? data.student.email} · {data.status}
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-5 shadow-sm sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Auto score</p>
          <p className="text-lg font-semibold">{data.autoScore}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Manual score</p>
          <p className="text-lg font-semibold">{data.manualScore}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Final score</p>
          <p className="text-lg font-semibold">
            {data.finalScore}/{data.maxScore}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Percentage</p>
          <p className="text-lg font-semibold">{data.percentage}%</p>
        </div>
      </div>

      <div className="space-y-4">
        {essayAnswers.map(
          (answer: {
            id: string;
            questionTitle: string;
            maxPoints: number;
            textAnswer: string | null;
          }) => {
            const grade = essayGrades[answer.id] ?? { score: '', feedback: '' };

            return (
              <div key={answer.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">{answer.questionTitle}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Max points: {answer.maxPoints}</p>
                <div className="mt-4 rounded-md border bg-muted/20 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm">{answer.textAnswer || '—'}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
                  <div className="space-y-1.5">
                    <Label htmlFor={`score-${answer.id}`}>Score</Label>
                    <Input
                      id={`score-${answer.id}`}
                      type="number"
                      min={0}
                      max={answer.maxPoints}
                      value={grade.score}
                      disabled={isPublished}
                      onChange={(event) =>
                        setEssayGrades((current) => ({
                          ...current,
                          [answer.id]: { ...grade, score: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`feedback-${answer.id}`}>Feedback</Label>
                    <Textarea
                      id={`feedback-${answer.id}`}
                      value={grade.feedback}
                      disabled={isPublished}
                      onChange={(event) =>
                        setEssayGrades((current) => ({
                          ...current,
                          [answer.id]: { ...grade, feedback: event.target.value },
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      disabled={isPublished || gradeEssay.isPending}
                      onClick={async () => {
                        const score = Number(grade.score);
                        if (Number.isNaN(score) || score < 0 || score > answer.maxPoints) {
                          toast.error(`Enter a score between 0 and ${answer.maxPoints}`);
                          return;
                        }
                        await gradeEssay.mutateAsync({
                          answerId: answer.id,
                          score,
                          feedback: grade.feedback.trim() || undefined,
                        });
                      }}
                    >
                      Save grade
                    </Button>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      {!isPublished ? (
        <Button
          type="button"
          onClick={() => publishResult.mutate(attemptId)}
          disabled={publishResult.isPending}
        >
          Publish Result
        </Button>
      ) : (
        <p className="text-sm font-medium text-emerald-600">Results published</p>
      )}
    </div>
  );
}
