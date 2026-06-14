'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CourseHeader from '@/components/learn/CourseHeader';
import ModuleList from '@/components/learn/ModuleList';
import LessonContent from '@/components/learn/LessonContent';
import { IncompleteCourseModal } from '@/components/learn/Incompletecoursemodal';
import { useLearningCourse, useMarkLearningContentComplete } from '@/hooks/use-learning';
import { mapLearningCourseToModules } from '@/lib/learning-utils';
import { useAuth } from '@/lib/hooks/use-auth';
import type { AugmentedModule, LessonItem, LessonSummary } from '@/types/learning';

type LockedAugmentedModule = AugmentedModule & { locked?: boolean };

export default function LearningPlayerPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>() || {};
  const { user } = useAuth();

  const { data: learningCourse, isLoading, isError } = useLearningCourse(slug ?? '');
  const markContentComplete = useMarkLearningContentComplete(slug ?? '');

  const [modules, setModules] = useState<LockedAugmentedModule[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonSummary>();
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [courseAcknowledged, setCourseAcknowledged] = useState(false);
  const selectedLessonRef = useRef<LessonSummary | undefined>(undefined);

  const enrollmentId = learningCourse?.enrollment.id ?? '';
  const courseId = learningCourse?.id ?? '';
  const courseTitle = learningCourse?.title ?? 'Untitled Course';
  const userName = user?.name ?? 'Student';

  useEffect(() => {
    selectedLessonRef.current = selectedLesson;
  }, [selectedLesson]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth <= 480;
      setIsMobile(mobile);
      setSidebarOpen((prev) => (typeof window !== 'undefined' ? !mobile : prev));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!enrollmentId) return;
    const key = `course_ack_${enrollmentId}`;
    if (localStorage.getItem(key) === 'true') {
      setCourseAcknowledged(true);
    }
  }, [enrollmentId]);

  useEffect(() => {
    if (!learningCourse) return;

    setEnrollmentProgress(learningCourse.enrollment.progress);

    const normalized = mapLearningCourseToModules(learningCourse, {
      enableLockedModules: false,
    });

    let initialLesson: LessonSummary | undefined;
    let activeModuleId = '';

    for (const module of normalized) {
      const firstIncomplete = module.lessons.find((lesson) => !lesson.completed);
      if (firstIncomplete) {
        initialLesson = firstIncomplete;
        activeModuleId = module.id;
        break;
      }
    }

    if (!initialLesson && normalized[0]?.lessons?.length) {
      initialLesson = normalized[0].lessons[0];
      activeModuleId = normalized[0].id;
    }

    const preservedLesson =
      selectedLessonRef.current?.type === 'COURSE_COMPLETION'
        ? selectedLessonRef.current
        : normalized
            .flatMap((module) => module.lessons || [])
            .find((lesson) => lesson.id === selectedLessonRef.current?.id);

    if (preservedLesson?.type !== 'COURSE_COMPLETION') {
      const ownerModule = normalized.find((module) =>
        (module.lessons || []).some((lesson) => lesson.id === preservedLesson?.id),
      );
      if (ownerModule?.id) {
        activeModuleId = ownerModule.id;
      }
    }

    setModules(
      normalized.map((module) =>
        module.id === activeModuleId ? { ...module, expanded: true, locked: false } : module,
      ),
    );

    setSelectedLesson((prev) => preservedLesson ?? prev ?? initialLesson);
  }, [learningCourse]);

  const computeLocked = (mods: LockedAugmentedModule[]) =>
    mods.map((module) => ({ ...module, locked: false }));

  const handleToggleModule = (moduleId: string) => {
    setModules((prev) => {
      const isCurrentlyExpanded = prev.find((module) => module.id === moduleId)?.expanded;
      return prev.map((module) =>
        module.id === moduleId
          ? { ...module, expanded: !isCurrentlyExpanded }
          : { ...module, expanded: false },
      );
    });
  };

  const navigateLesson = (dir: 'prev' | 'next') => {
    if (!selectedLesson) return;

    const currentModules = modules;
    const moduleIndex = currentModules.findIndex((module) =>
      module.lessons?.some((lesson) => lesson.id === selectedLesson.id),
    );
    if (moduleIndex === -1) return;

    const lessons = currentModules[moduleIndex]?.lessons || [];
    const index = lessons.findIndex((lesson) => lesson.id === selectedLesson.id);

    if (dir === 'prev' && index > 0) {
      setSelectedLesson(lessons[index - 1]);
      return;
    }

    if (dir === 'next' && index < lessons.length - 1) {
      setSelectedLesson(lessons[index + 1]);
      return;
    }

    const step = dir === 'next' ? 1 : -1;
    for (let i = moduleIndex + step; i >= 0 && i < currentModules.length; i += step) {
      const module = currentModules[i];
      if (!module?.lessons?.length || module.locked) continue;

      const nextLesson =
        dir === 'next' ? module.lessons[0] : module.lessons[module.lessons.length - 1];
      setSelectedLesson(nextLesson);
      setModules((prev) =>
        prev.map((entry) => (entry.id === module.id ? { ...entry, expanded: true } : entry)),
      );
      return;
    }

    if (dir === 'next') {
      const allLessons = currentModules.flatMap((module) => module.lessons || []);
      const allComplete = allLessons.length > 0 && allLessons.every((lesson) => lesson.completed);
      if (allComplete) {
        handleCourseCompletionClick();
      }
    }
  };

  const markLessonComplete = async () => {
    if (!selectedLesson?.raw?.moduleContentId || !slug) return;

    const moduleId = String(selectedLesson.raw.moduleId || '');
    const allCurrentLessons = modules.flatMap((module) => module.lessons || []);
    const currentLessonIndex = allCurrentLessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id,
    );
    const isLastLesson =
      currentLessonIndex >= 0 && currentLessonIndex === allCurrentLessons.length - 1;

    try {
      const result = await markContentComplete.mutateAsync(
        selectedLesson.raw.moduleContentId,
      );

      setEnrollmentProgress(result.progress);
      setModules((prev) => {
        const updated = prev.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons?.map((lesson) =>
                  lesson.id === selectedLesson.id ? { ...lesson, completed: true } : lesson,
                ),
              }
            : module,
        );
        return computeLocked(updated);
      });
      setSelectedLesson((prev) => (prev ? { ...prev, completed: true } : prev));

      if (!isLastLesson) {
        navigateLesson('next');
      }
    } catch {
      // Error toast handled in mutation hook
    }
  };

  const computedProgress = enrollmentProgress;

  const courseEligible = computedProgress === 100;
  const courseCompleted = courseEligible && courseAcknowledged;

  const handleCourseCompletionClick = () => {
    if (computedProgress !== 100) {
      setShowIncompleteModal(true);
      return;
    }

    if (enrollmentId) {
      localStorage.setItem(`course_ack_${enrollmentId}`, 'true');
    }

    setCourseAcknowledged(true);
    setSelectedLesson({
      id: 'course-completion',
      title: 'Course Completion',
      type: 'COURSE_COMPLETION',
      completed: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !learningCourse) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Unable to load course content
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/my-learning')}
            className="mt-4 text-primary hover:underline"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <CourseHeader
        courseTitle={courseTitle}
        courseSlug={slug}
        courseId={courseId}
        progress={computedProgress}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        onBack={() => router.back()}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed top-16 left-0 h-full transition-all duration-300 z-10 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-96'
          } w-96 border-r bg-gray-50 dark:bg-gray-800 overflow-y-auto`}
        >
          <ModuleList
            modules={modules as unknown as (import('@/types/learning').ModuleItem & {
              locked?: boolean;
            })[]}
            onToggleModule={handleToggleModule}
            selectedLesson={
              selectedLesson?.type === 'COURSE_COMPLETION'
                ? ({ id: 'course-completion', type: 'COURSE_COMPLETION' } as LessonItem)
                : (selectedLesson as unknown as LessonItem | undefined)
            }
            onSelectLesson={(lesson) => {
              setSelectedLesson(lesson as unknown as LessonSummary);
              if (isMobile) setSidebarOpen(false);
            }}
            courseLockedEnabled={false}
            onBlockedLessonSelect={() => undefined}
            fetchingModules={{}}
            courseCompleted={courseCompleted}
            courseEligible={courseEligible}
            onCourseCompletionClick={handleCourseCompletionClick}
          />
        </aside>

        <main
          className={`transition-all duration-300 ${
            sidebarOpen ? 'ml-96' : 'ml-0'
          } bg-white dark:bg-gray-800 overflow-hidden flex-1`}
        >
          {selectedLesson ? (
            <LessonContent
              lesson={{
                id: selectedLesson.id,
                type: selectedLesson.type,
                title: selectedLesson.title,
                raw: selectedLesson.raw,
                completed: selectedLesson.completed,
              }}
              onPrev={() => navigateLesson('prev')}
              onNext={() => navigateLesson('next')}
              onComplete={markLessonComplete}
              sidebarOpen={sidebarOpen}
              onCloseSidebar={() => setSidebarOpen(false)}
              courseId={courseId}
              userId={user?.id || ''}
              courseTitle={courseTitle}
              enrollmentId={enrollmentId}
              userName={userName}
              isBlocked={false}
              onBlockedAttempt={() => undefined}
            />
          ) : null}
        </main>
      </div>
      <IncompleteCourseModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
      />
    </div>
  );
}
