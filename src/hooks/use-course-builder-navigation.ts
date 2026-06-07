'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getModuleContents } from '@/api/content.api';
import { moduleContentQueryKeys } from '@/hooks/use-module-contents';
import { useCourseModules } from '@/hooks/use-course-modules';
import type { ModuleContentItem } from '@/types/content';
import type { CourseModule } from '@/types/module';

export interface FlatLessonItem {
  moduleId: string;
  contentId: string;
  title: string;
  item: ModuleContentItem;
}

export function useCourseBuilderNavigation(
  courseId: string,
  selectedModuleId: string | null,
  selectedContentId: string | null,
  enabled = true,
) {
  const { data: modulesData } = useCourseModules(courseId, enabled);
  const modules: CourseModule[] = modulesData ?? [];

  const contentQueries = useQueries({
    queries: modules.map((module) => ({
      queryKey: moduleContentQueryKeys.list(module.id),
      queryFn: () => getModuleContents(module.id),
      enabled: enabled && Boolean(module.id),
    })),
  });

  const flatLessons = useMemo(() => {
    const items: FlatLessonItem[] = [];
    modules.forEach((module, index) => {
      const contents = contentQueries[index]?.data ?? [];
      for (const entry of contents) {
        items.push({
          moduleId: module.id,
          contentId: entry.contentId,
          title: entry.content.title,
          item: entry,
        });
      }
    });
    return items;
  }, [modules, contentQueries]);

  const currentIndex = flatLessons.findIndex(
    (lesson) =>
      lesson.moduleId === selectedModuleId && lesson.contentId === selectedContentId,
  );

  const current = currentIndex >= 0 ? flatLessons[currentIndex] : null;
  const previous = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;

  return {
    flatLessons,
    currentIndex,
    current,
    previous,
    next,
    total: flatLessons.length,
    position: currentIndex >= 0 ? currentIndex + 1 : 0,
    isLoading: contentQueries.some((query) => query.isPending),
  };
}
