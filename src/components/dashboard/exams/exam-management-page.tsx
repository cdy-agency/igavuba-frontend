'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { useDeleteExam } from '@/hooks/use-exam';
import { useExamList } from '@/hooks/use-exam-list';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { ExamListItem } from '@/types/exam.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import {
  buildAssessmentsPath,
  buildExamBuilderPath,
} from '@/lib/course-builder-navigation';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getExamBuilderHref(exam: ExamListItem) {
  return buildExamBuilderPath({
    examId: exam.examId,
    courseSlug: exam.courseSlug || undefined,
    contentId: exam.contentId,
    returnTo: exam.courseSlug ? 'builder' : 'assessments',
  });
}

export function ExamManagementPage({ embedded = false }: { embedded?: boolean }) {
  const authReady = useAuthReady();
  const { data: exams = [], isPending, isError, error, refetch } = useExamList(authReady);
  const deleteExamMutation = useDeleteExam();

  const [search, setSearch] = useState('');
  const [examToDelete, setExamToDelete] = useState<ExamListItem | null>(null);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exams;
    return exams.filter(
      (exam: ExamListItem) =>
        exam.title.toLowerCase().includes(query) ||
        exam.courseTitle?.toLowerCase().includes(query),
    );
  }, [exams, search]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href={buildAssessmentsPath('exams')} className="hover:text-foreground">
              Assessments
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Exams</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Exam Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Build exams, attach them to courses, and review submissions here.
              </p>
            </div>
            <Button asChild>
              <Link href={buildExamBuilderPath()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Build exams and attach them to courses, then manage submissions here.
          </p>
          <Button asChild>
            <Link href={buildExamBuilderPath()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Link>
          </Button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search exams..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="space-y-3 px-6 py-12 text-center text-sm">
            <p className="text-destructive">
              {getApiErrorMessage(error, 'Unable to load exams. Restart the backend after pulling the latest code.')}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No exams found. Create an exam from here or from a course builder.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Questions</th>
                  <th className="px-4 py-3 font-medium">Passing Score</th>
                  <th className="px-4 py-3 font-medium">Max Attempts</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam: ExamListItem) => (
                  <tr key={exam.examId} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={getExamBuilderHref(exam)}
                        className="hover:text-primary hover:underline"
                      >
                        {exam.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {exam.courseTitle ?? 'Not linked to a course'}
                      {exam.isFinalExam ? (
                        <span className="block text-xs">Final exam</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{exam.questionsCount}</td>
                    <td className="px-4 py-3">{exam.passingScore}%</td>
                    <td className="px-4 py-3">{exam.maxAttempts}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(exam.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <Link href={getExamBuilderHref(exam)}>
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </Button>
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/exams/${exam.examId}/submissions`}>
                            <Users className="mr-1 h-3.5 w-3.5" />
                            Submissions
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setExamToDelete(exam)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={Boolean(examToDelete)}
        onOpenChange={(open) => {
          if (!open) setExamToDelete(null);
        }}
        title="Delete exam"
        description={
          examToDelete
            ? `Delete "${examToDelete.title}"? Detach it from the course builder first if deletion fails.`
            : undefined
        }
        confirmText="Delete exam"
        onConfirm={async () => {
          if (!examToDelete) return;
          try {
            await deleteExamMutation.mutateAsync(examToDelete.examId);
            setExamToDelete(null);
            void refetch();
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to delete exam.'));
          }
        }}
      />
    </div>
  );
}
