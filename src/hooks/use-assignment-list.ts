'use client';

import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/api/course.api';
import { getModuleContents } from '@/api/content.api';
import { getCourseModules } from '@/api/module.api';
import { ContentType } from '@/types/content';
import type { AssignmentListItem, AssignmentSubmissionType } from '@/types/assignment.types';

export const assignmentListQueryKeys = {
  all: ['assignment-list'] as const,
  list: () => ['assignment-list', 'items'] as const,
};

function parseSubmissionTypes(value: unknown): AssignmentSubmissionType[] {
  if (!Array.isArray(value)) return ['TEXT' as AssignmentSubmissionType];
  return value as AssignmentSubmissionType[];
}

function resolveAssignmentStatus(
  isPublished: boolean,
  dueDate: string | null,
): AssignmentListItem['status'] {
  if (!isPublished) return 'Draft';
  if (dueDate && new Date(dueDate) < new Date()) return 'Closed';
  return 'Published';
}

async function fetchAssignmentListItems(): Promise<AssignmentListItem[]> {
  const coursesResponse = await getCourses({ page: 1, limit: 100 });
  const courses = coursesResponse.data ?? [];
  const items: AssignmentListItem[] = [];

  for (const course of courses) {
    const modules = await getCourseModules(course.id);

    for (const courseModule of modules) {
      const contents = await getModuleContents(courseModule.id);

      for (const moduleContent of contents) {
        const { content } = moduleContent;
        if (content.type !== ContentType.ASSIGNMENT || !content.assessment?.assignment) {
          continue;
        }

        const assignment = content.assessment.assignment;
        items.push({
          id: assignment.id,
          contentId: content.id,
          title: content.title,
          moduleId: courseModule.id,
          moduleTitle: courseModule.title,
          courseId: course.id,
          courseTitle: course.title,
          courseSlug: course.slug,
          dueDate: assignment.dueDate,
          submissionsCount: 0,
          status: resolveAssignmentStatus(content.isPublished, assignment.dueDate),
          isPublished: content.isPublished,
          passingScore: assignment.passingScore,
          maxAttempts: assignment.maxAttempts,
          submissionTypes: parseSubmissionTypes(assignment.submissionTypes),
          createdAt: content.createdAt,
        });
      }
    }
  }

  return items.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function useAssignmentList(enabled = true) {
  return useQuery<AssignmentListItem[]>({
    queryKey: assignmentListQueryKeys.list(),
    queryFn: fetchAssignmentListItems,
    enabled,
    staleTime: 30_000,
  });
}
