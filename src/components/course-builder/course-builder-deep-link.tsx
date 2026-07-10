'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCourseModules } from '@/api/module.api';
import { getModuleContents } from '@/api/content.api';
import { getCourseFinalExam } from '@/api/course-final-exam.api';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';

interface CourseBuilderDeepLinkProps {
  courseId: string;
}

export function CourseBuilderDeepLink({ courseId }: CourseBuilderDeepLinkProps) {
  const searchParams = useSearchParams();
  const authReady = useAuthReady();
  const { setSelectedModuleId, setSelectedContentId, selectFinalExam } = useCourseBuilder();
  const appliedRef = useRef(false);

  const contentId = searchParams.get('contentId');
  const moduleId = searchParams.get('moduleId');

  useEffect(() => {
    if (!authReady || appliedRef.current || !contentId) {
      return;
    }

    const applySelection = (resolvedModuleId: string) => {
      setSelectedModuleId(resolvedModuleId);
      setSelectedContentId(contentId);
      appliedRef.current = true;
    };

    if (moduleId) {
      applySelection(moduleId);
      return;
    }

    void (async () => {
      try {
        const finalExamResponse = await getCourseFinalExam(courseId);
        if (finalExamResponse.data?.contentId === contentId) {
          selectFinalExam();
          appliedRef.current = true;
          return;
        }

        const modules = await getCourseModules(courseId);

        for (const courseModule of modules) {
          const contents = await getModuleContents(courseModule.id);
          if (contents.some((item) => item.contentId === contentId)) {
            applySelection(courseModule.id);
            return;
          }
        }
      } catch {
        // Ignore deep-link lookup failures; builder still loads normally.
      }
    })();
  }, [
    authReady,
    contentId,
    courseId,
    moduleId,
    setSelectedContentId,
    setSelectedModuleId,
    selectFinalExam,
  ]);

  return null;
}
