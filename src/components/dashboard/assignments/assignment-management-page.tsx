'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { useDeleteAssignment } from '@/hooks/use-assignment';
import { useAssignmentList } from '@/hooks/use-assignment-list';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { AssignmentListItem } from '@/types/assignment.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import {
  buildAssessmentsPath,
  buildCourseBuilderContentPath,
} from '@/lib/course-builder-navigation';
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

function getAssignmentBuilderHref(assignment: AssignmentListItem) {
  if (!assignment.courseSlug) {
    return '/dashboard/courses';
  }

  return buildCourseBuilderContentPath({
    courseSlug: assignment.courseSlug,
    contentId: assignment.contentId,
    moduleId: assignment.moduleId,
  });
}

export function AssignmentManagementPage({ embedded = false }: { embedded?: boolean }) {
  const authReady = useAuthReady();
  const { data: assignments = [], isPending } = useAssignmentList(authReady);
  const deleteAssignmentMutation = useDeleteAssignment();

  const [search, setSearch] = useState('');
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentListItem | null>(null);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assignments;
    return assignments.filter(
      (assignment: AssignmentListItem) =>
        assignment.title.toLowerCase().includes(query) ||
        assignment.moduleTitle?.toLowerCase().includes(query) ||
        assignment.courseTitle?.toLowerCase().includes(query),
    );
  }, [assignments, search]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href={buildAssessmentsPath('assignments')} className="hover:text-foreground">
              Assessments
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Assignments</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Assignment Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create assignments in the course builder, then review and grade submissions here.
              </p>
            </div>
            <Button asChild size="sm" className="h-8 shrink-0 px-3 text-xs">
              <Link href="/dashboard/courses">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create in Course Builder
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Open attached course assignments to edit content, then manage submissions here.
          </p>
          <Button asChild size="sm" className="h-8 shrink-0 px-3 text-xs">
            <Link href="/dashboard/courses">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create in Course Builder
            </Link>
          </Button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search assignments..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No assignments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Module</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment: AssignmentListItem) => (
                  <tr key={assignment.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={getAssignmentBuilderHref(assignment)}
                        className="hover:text-primary hover:underline"
                      >
                        {assignment.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {assignment.moduleTitle}
                      <span className="block text-xs">{assignment.courseTitle}</span>
                    </td>
                    <td className="px-4 py-3">
                      {assignment.dueDate ? formatDate(assignment.dueDate) : '—'}
                    </td>
                    <td className="px-4 py-3">{assignment.status}</td>
                    <td className="px-4 py-3">{formatDate(assignment.createdAt)}</td>
                    <td className="px-4 py-3">
                      <DashboardActionGroup className="justify-end">
                        <DashboardActionIconButton
                          label="Submissions"
                          icon={Users}
                          href={`/dashboard/assignments/${assignment.id}/submissions`}
                        />
                        <DashboardActionIconButton
                          label="Edit"
                          icon={Pencil}
                          variant="primary"
                          href={getAssignmentBuilderHref(assignment)}
                        />
                        <DashboardActionIconButton
                          label="Delete"
                          icon={Trash2}
                          variant="destructive"
                          onClick={() => setAssignmentToDelete(assignment)}
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

      <DeleteDialog
        isOpen={Boolean(assignmentToDelete)}
        onOpenChange={(open) => {
          if (!open) setAssignmentToDelete(null);
        }}
        title="Delete assignment"
        description={
          assignmentToDelete
            ? `Delete "${assignmentToDelete.title}"? This removes the assignment content permanently.`
            : undefined
        }
        confirmText="Delete assignment"
        onConfirm={async () => {
          if (!assignmentToDelete) return;
          try {
            await deleteAssignmentMutation.mutateAsync(assignmentToDelete.id);
            setAssignmentToDelete(null);
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to delete assignment.'));
          }
        }}
      />
    </div>
  );
}
