'use client';

import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useExamSubmissions,
  usePublishAllExamResults,
  useExamDetail,
} from '@/hooks/use-exam';
import { buildAssessmentsPath } from '@/lib/course-builder-navigation';
import type { ExamSubmissionListItem } from '@/types/exam.types';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ExamSubmissionsList({ examId }: { examId: string }) {
  const { data: exam } = useExamDetail(examId);
  const { data: submissions = [], isPending } = useExamSubmissions(examId);
  const publishAll = usePublishAllExamResults(examId);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href={buildAssessmentsPath('exams')} className="hover:text-foreground">
            Assessments
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Exams</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Submissions</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {exam?.assessment.title ?? 'Exam submissions'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review essay answers, grade submissions, and publish results.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => publishAll.mutate()}
            disabled={publishAll.isPending || submissions.length === 0}
          >
            Publish All Results
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Auto Score</th>
                  <th className="px-4 py-3 font-medium">Essays</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission: ExamSubmissionListItem) => (
                  <tr key={submission.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{submission.student.name ?? submission.student.email}</p>
                      <p className="text-xs text-muted-foreground">{submission.student.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td className="px-4 py-3">{submission.autoScore}</td>
                    <td className="px-4 py-3">{submission.essayQuestions}</td>
                    <td className="px-4 py-3">{submission.status}</td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/exams/${examId}/submissions/${submission.id}`}>
                          Review
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
