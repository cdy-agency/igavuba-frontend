'use client';

import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/api/course.api';
import { getModuleContents } from '@/api/content.api';
import { getCourseModules } from '@/api/module.api';
import { ContentType } from '@/types/content';
import type { QuizListItem } from '@/types/quiz';

export const quizListQueryKeys = {
  all: ['quiz-list'] as const,
  list: () => ['quiz-list', 'items'] as const,
};

async function fetchQuizListItems(): Promise<QuizListItem[]> {
  const coursesResponse = await getCourses({ page: 1, limit: 100 });
  const courses = coursesResponse.data ?? [];
  const items: QuizListItem[] = [];

  for (const course of courses) {
    const modules = await getCourseModules(course.id);

    for (const courseModule of modules) {
      const contents = await getModuleContents(courseModule.id);

      for (const moduleContent of contents) {
        const { content } = moduleContent;
        if (content.type !== ContentType.QUIZ || !content.assessment?.quiz) {
          continue;
        }

        const quiz = content.assessment.quiz;
        items.push({
          quizId: quiz.id,
          contentId: content.id,
          title: content.title,
          moduleId: courseModule.id,
          moduleTitle: courseModule.title,
          courseId: course.id,
          courseTitle: course.title,
          courseSlug: course.slug,
          questionsCount: quiz.questions?.length ?? 0,
          passingScore: quiz.passingScore,
          maxAttempts: quiz.maxAttempts,
          createdAt: content.createdAt,
        });
      }
    }
  }

  return items.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function useQuizList(enabled = true) {
  return useQuery<QuizListItem[]>({
    queryKey: quizListQueryKeys.list(),
    queryFn: fetchQuizListItems,
    enabled,
    staleTime: 30_000,
  });
}
