'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Eye, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { CreateQuizModal } from '@/components/quiz/create-quiz-modal';
import { QuizPreviewModal } from '@/components/quiz/quiz-preview-modal';
import { useDeleteQuiz } from '@/hooks/use-quiz';
import { useQuizList } from '@/hooks/use-quiz-list';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { QuizListItem } from '@/types/quiz';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function QuizManagementPage({ embedded = false }: { embedded?: boolean }) {
  const authReady = useAuthReady();
  const { data: quizzes = [], isPending, refetch } = useQuizList(authReady);
  const deleteQuizMutation = useDeleteQuiz();

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editQuizId, setEditQuizId] = useState<string | null>(null);
  const [previewQuizId, setPreviewQuizId] = useState<string | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<QuizListItem | null>(null);

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return quizzes;
    return quizzes.filter(
      (quiz: QuizListItem) =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.moduleTitle?.toLowerCase().includes(query) ||
        quiz.courseTitle?.toLowerCase().includes(query),
    );
  }, [quizzes, search]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard/courses" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Quizzes</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Quiz Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create, edit, preview, and delete quizzes across your courses.
              </p>
            </div>
            <Button size="sm" className="h-8 shrink-0 px-3 text-xs" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Create, edit, preview, and delete quizzes attached to your courses.
          </p>
          <Button size="sm" className="h-8 shrink-0 px-3 text-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Quiz
          </Button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search quizzes..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No quizzes found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Module</th>
                  <th className="px-4 py-3 font-medium">Questions</th>
                  <th className="px-4 py-3 font-medium">Passing Score</th>
                  <th className="px-4 py-3 font-medium">Max Attempts</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz: QuizListItem) => (
                  <tr key={quiz.quizId} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{quiz.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {quiz.moduleTitle ?? '—'}
                      {quiz.courseTitle ? (
                        <span className="block text-xs">{quiz.courseTitle}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{quiz.questionsCount}</td>
                    <td className="px-4 py-3">{quiz.passingScore}%</td>
                    <td className="px-4 py-3">{quiz.maxAttempts}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(quiz.createdAt)}</td>
                    <td className="px-4 py-3">
                      <DashboardActionGroup className="justify-end">
                        <DashboardActionIconButton
                          label="Edit"
                          icon={Pencil}
                          variant="primary"
                          onClick={() => setEditQuizId(quiz.quizId)}
                        />
                        <DashboardActionIconButton
                          label="Preview"
                          icon={Eye}
                          onClick={() => setPreviewQuizId(quiz.quizId)}
                        />
                        <DashboardActionIconButton
                          label="Delete"
                          icon={Trash2}
                          variant="destructive"
                          onClick={() => setQuizToDelete(quiz)}
                        />
                      </DashboardActionGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateQuizModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          void refetch();
        }}
      />

      <CreateQuizModal
        open={Boolean(editQuizId)}
        onOpenChange={(open) => {
          if (!open) setEditQuizId(null);
        }}
        quizId={editQuizId}
        moduleId={quizzes.find((quiz: QuizListItem) => quiz.quizId === editQuizId)?.moduleId}
        onSuccess={() => {
          void refetch();
        }}
      />

      <QuizPreviewModal
        open={Boolean(previewQuizId)}
        onOpenChange={(open) => {
          if (!open) setPreviewQuizId(null);
        }}
        quizId={previewQuizId}
      />

      <DeleteDialog
        isOpen={Boolean(quizToDelete)}
        onOpenChange={(open) => {
          if (!open) setQuizToDelete(null);
        }}
        title="Delete quiz"
        description={
          quizToDelete
            ? `Delete "${quizToDelete.title}"? The quiz must not be attached to any module. Detach it from the course builder first if deletion fails.`
            : undefined
        }
        confirmText="Delete quiz"
        onConfirm={async () => {
          if (!quizToDelete) return;
          try {
            await deleteQuizMutation.mutateAsync(quizToDelete.quizId);
            setQuizToDelete(null);
            void refetch();
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to delete quiz.'));
          }
        }}
      />
    </div>
  );
}
