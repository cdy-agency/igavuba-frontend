'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CourseHeader from '@/components/learn/CourseHeader';
import ModuleList from '@/components/learn/ModuleList';
import LessonContent from '@/components/learn/LessonContent';
import { IncompleteCourseModal } from '@/components/learn/Incompletecoursemodal';
import { useLearningCourse } from '@/hooks/use-learning';
import {
  useCompleteContentProgress,
  useCourseResumeProgress,
  useStartContentProgress,
} from '@/hooks/use-progress';
import { mapFinalExamToLesson, mapLearningCourseToModules } from '@/lib/learning-utils';
import { useAuth } from '@/lib/hooks/use-auth';
import type { AugmentedModule, LessonItem, LessonSummary } from '@/types/learning';
import { PaymentUploadDialog } from '@/components/payments/payment-upload-dialog';
import { useMyPayments } from '@/hooks/use-payments';

type LockedAugmentedModule = AugmentedModule & { locked?: boolean };

export default function LearningPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = useParams<{ slug: string }>() || {};
  const { user } = useAuth();

  const { data: learningCourse, isLoading, isError } = useLearningCourse(slug ?? '');
  const courseId = learningCourse?.id ?? '';
  const { data: resumeData } = useCourseResumeProgress(courseId, Boolean(courseId));

  const startContentProgress = useStartContentProgress(courseId, slug);
  const completeContentProgress = useCompleteContentProgress(courseId, slug);

  const [modules, setModules] = useState<LockedAugmentedModule[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonSummary>();
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [courseAcknowledged, setCourseAcknowledged] = useState(false);
  const [finalExamCompleted, setFinalExamCompleted] = useState(false);
  const selectedLessonRef = useRef<LessonSummary | undefined>(undefined);
  const lastStartedContentIdRef = useRef<string | null>(null);
  const startContentRef = useRef(startContentProgress.mutateAsync);
  startContentRef.current = startContentProgress.mutateAsync;

  const enrollmentId = learningCourse?.enrollment.id ?? '';
  const courseTitle = learningCourse?.title ?? 'Untitled Course';
  const isPreviewAccess = learningCourse?.access.level === 'PREVIEW';
  const { data: myPayments } = useMyPayments(Boolean(courseId) && isPreviewAccess);
  const hasPendingPayment = useMemo(
    () =>
      myPayments?.some(
        (payment) => payment.courseId === courseId && payment.status === 'PENDING',
      ) ?? false,
    [myPayments, courseId],
  );
  const userName = user?.name ?? 'Student';
  const queryContentId = searchParams.get('contentId');

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
    setFinalExamCompleted(learningCourse.finalExam?.completed ?? false);

    const normalized = mapLearningCourseToModules(learningCourse, {
      enableLockedModules: learningCourse.access.level === 'PREVIEW',
    });

    const moduleLessons = normalized.flatMap((module) => module.lessons || []);
    const finalExam = learningCourse.finalExam
      ? mapFinalExamToLesson({
          ...learningCourse.finalExam,
          completed: learningCourse.finalExam.completed,
        })
      : null;
    const allLessons = finalExam ? [...moduleLessons, finalExam] : moduleLessons;
    const targetContentId =
      queryContentId || resumeData?.contentId || selectedLessonRef.current?.id;

    let initialLesson: LessonSummary | undefined;
    let activeModuleId = '';

    if (targetContentId) {
      initialLesson = allLessons.find((lesson) => lesson.id === targetContentId);
    }

    if (!initialLesson) {
      initialLesson = allLessons.find((lesson) => !lesson.completed);
    }

    if (!initialLesson && normalized[0]?.lessons?.length) {
      initialLesson = normalized[0].lessons[0];
    }

    const preservedLesson =
      selectedLessonRef.current?.type === 'COURSE_COMPLETION'
        ? selectedLessonRef.current
        : allLessons.find((lesson) => lesson.id === selectedLessonRef.current?.id);

    const nextLesson = preservedLesson ?? initialLesson;
    if (nextLesson) {
      const ownerModule = normalized.find((module) =>
        (module.lessons || []).some((lesson) => lesson.id === nextLesson.id),
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

    setSelectedLesson(nextLesson);
  }, [learningCourse, resumeData, queryContentId]);

  useEffect(() => {
    if (!courseId || !selectedLesson?.id || selectedLesson.type === 'COURSE_COMPLETION') {
      return;
    }

    if (lastStartedContentIdRef.current === selectedLesson.id) {
      return;
    }

    lastStartedContentIdRef.current = selectedLesson.id;
    void startContentRef.current(selectedLesson.id);
  }, [courseId, selectedLesson?.id, selectedLesson?.type]);

  const computeLocked = (mods: LockedAugmentedModule[]) =>
    mods.map((module) => ({
      ...module,
      locked: Boolean(module.locked),
    }));

  const isSelectedLessonPaymentLocked = Boolean(
    selectedLesson?.raw?.isPaymentLocked ||
      (learningCourse?.finalExam?.isPaymentLocked &&
        selectedLesson?.id === learningCourse.finalExam.id),
  );

  const openPaymentDialog = () => {
    if (hasPendingPayment) return;
    setPaymentDialogOpen(true);
  };

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

    const finalExam = learningCourse?.finalExam
      ? mapFinalExamToLesson({
          ...learningCourse.finalExam,
          completed: finalExamCompleted,
        })
      : null;

    if (selectedLesson.id === finalExam?.id) {
      if (dir === 'next') {
        handleCourseCompletionClick();
        return;
      }

      const lastModule = modules[modules.length - 1];
      const lastLesson = lastModule?.lessons?.[lastModule.lessons.length - 1];
      if (lastLesson) {
        setSelectedLesson(lastLesson);
        setModules((prev) =>
          prev.map((entry) =>
            entry.id === lastModule.id ? { ...entry, expanded: true } : entry,
          ),
        );
      }
      return;
    }

    if (selectedLesson.type === 'COURSE_COMPLETION') {
      if (dir === 'prev' && finalExam) {
        setSelectedLesson(finalExam);
      }
      return;
    }

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

    if (dir === 'next' && finalExam) {
      const moduleLessonsComplete =
        currentModules.flatMap((module) => module.lessons || []).every((lesson) => lesson.completed) ||
        currentModules.flatMap((module) => module.lessons || []).length === 0;

      if (moduleLessonsComplete) {
        setSelectedLesson(finalExam);
        return;
      }
    }

    if (dir === 'next') {
      const allModuleLessons = currentModules.flatMap((module) => module.lessons || []);
      const allComplete =
        allModuleLessons.length > 0 && allModuleLessons.every((lesson) => lesson.completed);
      if (allComplete && !finalExam) {
        handleCourseCompletionClick();
      }
    }
  };

  const markLessonInState = (contentId: string, moduleId: string, progress: number) => {
    setEnrollmentProgress(progress);

    if (learningCourse?.finalExam?.id === contentId) {
      setFinalExamCompleted(true);
      setSelectedLesson((prev) =>
        prev && prev.id === contentId ? { ...prev, completed: true } : prev,
      );
      return;
    }

    setModules((prev) => {
      const updated = prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons?.map((lesson) =>
                lesson.id === contentId ? { ...lesson, completed: true } : lesson,
              ),
            }
          : module,
      );
      return computeLocked(updated);
    });
    setSelectedLesson((prev) =>
      prev && prev.id === contentId ? { ...prev, completed: true } : prev,
    );
  };

  const markLessonComplete = async () => {
    if (!selectedLesson?.id || selectedLesson.completed) {
      if (selectedLesson?.completed) {
        navigateLesson('next');
      }
      return;
    }

    const moduleId = String(selectedLesson.raw?.moduleId || '');
    const allCurrentLessons = modules.flatMap((module) => module.lessons || []);
    const currentLessonIndex = allCurrentLessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id,
    );
    const isLastLesson =
      currentLessonIndex >= 0 && currentLessonIndex === allCurrentLessons.length - 1;

    try {
      const result = await completeContentProgress.mutateAsync(selectedLesson.id);
      markLessonInState(selectedLesson.id, moduleId, result.progress);

      if (!isLastLesson) {
        navigateLesson('next');
      }
    } catch {
      // toast handled in hook
    }
  };

  const finalExamLesson = useMemo(() => {
    if (!learningCourse?.finalExam) return null;
    return mapFinalExamToLesson({
      ...learningCourse.finalExam,
      completed: finalExamCompleted,
    });
  }, [learningCourse?.finalExam, finalExamCompleted]);

  const moduleLessonsComplete = useMemo(() => {
    const moduleLessons = modules.flatMap((module) => module.lessons || []);
    return moduleLessons.length === 0 || moduleLessons.every((lesson) => lesson.completed);
  }, [modules]);

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
              const paymentLocked = Boolean(
                (lesson as LessonSummary).raw?.isPaymentLocked ||
                  (learningCourse?.finalExam?.isPaymentLocked &&
                    lesson.id === learningCourse.finalExam.id),
              );
              setSelectedLesson(lesson as unknown as LessonSummary);
              if (isMobile) setSidebarOpen(false);
              if (paymentLocked && !hasPendingPayment) {
                openPaymentDialog();
              }
            }}
            courseLockedEnabled={!isPreviewAccess}
            onBlockedLessonSelect={() => undefined}
            onPaymentLockedLessonSelect={openPaymentDialog}
            isPreviewAccess={isPreviewAccess}
            hasPendingPayment={hasPendingPayment}
            fetchingModules={{}}
            courseCompleted={courseCompleted}
            courseEligible={courseEligible}
            onCourseCompletionClick={handleCourseCompletionClick}
            finalExamLesson={finalExamLesson as unknown as LessonItem | null}
            onSelectFinalExam={() => {
              if (!finalExamLesson || !moduleLessonsComplete) return;
              if (learningCourse?.finalExam?.isPaymentLocked) {
                openPaymentDialog();
                return;
              }
              setSelectedLesson(finalExamLesson);
              if (isMobile) setSidebarOpen(false);
            }}
            moduleLessonsComplete={moduleLessonsComplete}
            finalExamPaymentLocked={Boolean(learningCourse?.finalExam?.isPaymentLocked)}
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
              onAutoComplete={markLessonComplete}
              onQuizProgressUpdated={(contentId, moduleId, progress) => {
                markLessonInState(contentId, moduleId, progress);
              }}
              sidebarOpen={sidebarOpen}
              onCloseSidebar={() => setSidebarOpen(false)}
              courseId={courseId}
              courseSlug={slug}
              userId={user?.id || ''}
              courseTitle={courseTitle}
              enrollmentId={enrollmentId}
              userName={userName}
              isBlocked={isSelectedLessonPaymentLocked}
              onBlockedAttempt={openPaymentDialog}
              isPaymentLocked={isSelectedLessonPaymentLocked}
              hasPendingPayment={hasPendingPayment}
              onUploadPaymentProof={openPaymentDialog}
              coursePrice={learningCourse.publicPrice}
              courseCurrency={learningCourse.publicCurrency ?? learningCourse.access.currency}
            />
          ) : null}
        </main>
      </div>
      <PaymentUploadDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        courseId={courseId}
        courseTitle={courseTitle}
        amount={learningCourse.publicPrice}
        currency={learningCourse.publicCurrency ?? learningCourse.access.currency}
      />
      <IncompleteCourseModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
      />
    </div>
  );
}
