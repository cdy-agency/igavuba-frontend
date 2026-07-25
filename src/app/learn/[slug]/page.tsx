'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  applyPreviewAccessLocks,
  getPaymentLockOptions,
  isLessonPaymentLocked,
  isPaymentEnrollmentError,
  PREVIEW_PAYMENT_MESSAGE,
  resolveAdjacentLesson,
  resolvePreviewAccessState,
  shouldGateLessonForPayment,
  shouldGateNavigationFromPreview,
  shouldShowPayToContinue,
} from '@/lib/learn-payment-gate';
import { useAuth } from '@/lib/hooks/use-auth';
import type { AugmentedModule, LessonItem, LessonSummary } from '@/types/learning';
import { PaymentUploadDialog } from '@/components/payments/payment-upload-dialog';
import { PaymentPendingDialog } from '@/components/payments/payment-pending-dialog';
import { useMyPayments } from '@/hooks/use-payments';
import { parseProgressBlockMessage } from '@/lib/academic-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

type LockedAugmentedModule = AugmentedModule & { locked?: boolean };

export default function LearningPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = useParams<{ slug: string }>() || {};
  const { user } = useAuth();

  const { data: learningCourse, isLoading, isError } = useLearningCourse(slug ?? '', true, {
    fresh: true,
  });
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
  const [paymentPendingDialogOpen, setPaymentPendingDialogOpen] = useState(false);
  const [courseAcknowledged, setCourseAcknowledged] = useState(false);
  const [finalExamCompleted, setFinalExamCompleted] = useState(false);
  const [assignmentContinueBlock, setAssignmentContinueBlock] = useState<{
    contentId: string;
    message: string;
  } | null>(null);
  const selectedLessonRef = useRef<LessonSummary | undefined>(undefined);
  const lastStartedContentIdRef = useRef<string | null>(null);
  const paymentPromptShownRef = useRef(false);
  const startContentRef = useRef(startContentProgress.mutateAsync);
  startContentRef.current = startContentProgress.mutateAsync;

  const enrollmentId = learningCourse?.enrollment.id ?? '';
  const courseTitle = learningCourse?.title ?? 'Untitled Course';
  const requiresPayment = Boolean(learningCourse?.access.requiresPayment);
  const previewContentId = learningCourse?.access.previewContentId ?? null;
  const finalExamPaymentLocked = Boolean(learningCourse?.finalExam?.isPaymentLocked);
  const finalExamId = learningCourse?.finalExam?.id;
  const { data: myPayments, isFetched: paymentsFetched } = useMyPayments(
    Boolean(courseId) && requiresPayment,
    { refetchOnMount: 'always' },
  );
  const { isPreviewAccess, hasPendingPayment } = useMemo(
    () => resolvePreviewAccessState(learningCourse, myPayments, courseId),
    [learningCourse, myPayments, courseId],
  );
  const paymentLockOptions = useMemo(
    () => getPaymentLockOptions(isPreviewAccess, previewContentId, finalExamPaymentLocked, finalExamId),
    [isPreviewAccess, previewContentId, finalExamPaymentLocked, finalExamId],
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
    paymentPromptShownRef.current = false;
  }, [courseId]);

  useEffect(() => {
    if (hasPendingPayment) {
      setPaymentDialogOpen(false);
    }
  }, [hasPendingPayment]);

  useEffect(() => {
    if (!isPreviewAccess) {
      setPaymentDialogOpen(false);
      setPaymentPendingDialogOpen(false);
    }
  }, [isPreviewAccess]);

  useEffect(() => {
    if (
      !learningCourse ||
      !isPreviewAccess ||
      !paymentsFetched ||
      paymentPromptShownRef.current
    ) {
      return;
    }

    paymentPromptShownRef.current = true;

    if (hasPendingPayment) {
      return;
    }

    setPaymentDialogOpen(true);
  }, [learningCourse, isPreviewAccess, hasPendingPayment, paymentsFetched]);

  useEffect(() => {
    if (!learningCourse) return;

    setEnrollmentProgress(learningCourse.enrollment.progress);
    setFinalExamCompleted(learningCourse.finalExam?.completed ?? false);

    const normalized = applyPreviewAccessLocks(
      mapLearningCourseToModules(learningCourse, {
        enableLockedModules: isPreviewAccess,
      }),
      previewContentId,
      isPreviewAccess,
    );

    const moduleLessons = normalized.flatMap((module) => module.lessons || []);
    const finalExam = learningCourse.finalExam
      ? mapFinalExamToLesson({
          ...learningCourse.finalExam,
          completed: learningCourse.finalExam.completed,
          isPaymentLocked: isPreviewAccess ? true : learningCourse.finalExam.isPaymentLocked,
        })
      : null;
    const allLessons = finalExam ? [...moduleLessons, finalExam] : moduleLessons;
    const targetContentId =
      queryContentId || resumeData?.contentId || selectedLessonRef.current?.id;

    let initialLesson: LessonSummary | undefined;
    let activeModuleId = '';

    const isAccessibleLesson = (lesson: LessonSummary | undefined) =>
      !isLessonPaymentLocked(lesson, paymentLockOptions);

    if (targetContentId) {
      initialLesson = allLessons.find((lesson) => lesson.id === targetContentId);
      if (initialLesson && !isAccessibleLesson(initialLesson)) {
        initialLesson = undefined;
      }
    }

    if (!initialLesson) {
      initialLesson = allLessons.find((lesson) => !lesson.completed && isAccessibleLesson(lesson));
    }

    if (!initialLesson && previewContentId) {
      initialLesson = allLessons.find((lesson) => lesson.id === previewContentId);
    }

    if (!initialLesson && normalized[0]?.lessons?.length) {
      initialLesson = normalized[0].lessons.find(isAccessibleLesson) ?? normalized[0].lessons[0];
    }

    const preservedCandidate =
      selectedLessonRef.current?.type === 'COURSE_COMPLETION'
        ? selectedLessonRef.current
        : allLessons.find((lesson) => lesson.id === selectedLessonRef.current?.id);

    const preservedLesson =
      preservedCandidate && isAccessibleLesson(preservedCandidate)
        ? preservedCandidate
        : undefined;

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
  }, [learningCourse, resumeData, queryContentId, isPreviewAccess, previewContentId, paymentLockOptions]);

  useEffect(() => {
    if (!courseId || !selectedLesson?.id || selectedLesson.type === 'COURSE_COMPLETION') {
      return;
    }

    if (isLessonPaymentLocked(selectedLesson, paymentLockOptions)) {
      return;
    }

    if (lastStartedContentIdRef.current === selectedLesson.id) {
      return;
    }

    lastStartedContentIdRef.current = selectedLesson.id;
    void startContentRef.current(selectedLesson.id);
  }, [courseId, selectedLesson?.id, selectedLesson?.type, paymentLockOptions]);

  const computeLocked = (mods: LockedAugmentedModule[]) =>
    mods.map((module) => ({
      ...module,
      locked: Boolean(module.locked),
    }));

  const isSelectedLessonPaymentLocked = isLessonPaymentLocked(
    selectedLesson,
    paymentLockOptions,
  );
  const showPayToContinue = shouldShowPayToContinue(selectedLesson?.id, paymentLockOptions);

  const openPaymentDialog = () => {
    if (hasPendingPayment) {
      setPaymentPendingDialogOpen(true);
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handlePayToContinue = () => {
    if (hasPendingPayment) {
      setPaymentPendingDialogOpen(true);
      return;
    }
    openPaymentDialog();
  };

  const tryNavigateToLesson = (lesson: LessonSummary) => {
    if (shouldGateLessonForPayment(lesson, paymentLockOptions)) {
      openPaymentDialog();
      return false;
    }

    setSelectedLesson(lesson);
    return true;
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

    if (shouldGateNavigationFromPreview(selectedLesson.id, dir, paymentLockOptions)) {
      openPaymentDialog();
      return;
    }

    const adjacentLesson = resolveAdjacentLesson(dir, selectedLesson, modules, finalExam);
    if (!adjacentLesson) {
      if (dir === 'next' && selectedLesson.id === finalExam?.id) {
        handleCourseCompletionClick();
        return;
      }

      if (dir === 'next') {
        const allModuleLessons = modules.flatMap((module) => module.lessons || []);
        const allComplete =
          allModuleLessons.length > 0 && allModuleLessons.every((lesson) => lesson.completed);
        if (allComplete && !finalExam) {
          handleCourseCompletionClick();
        }
      }
      return;
    }

    if (shouldGateLessonForPayment(adjacentLesson, paymentLockOptions)) {
      openPaymentDialog();
      return;
    }

    if (selectedLesson.id === finalExam?.id) {
      if (dir === 'prev') {
        tryNavigateToLesson(adjacentLesson);
        const lastModule = modules[modules.length - 1];
        if (lastModule?.id) {
          setModules((prev) =>
            prev.map((entry) =>
              entry.id === lastModule.id ? { ...entry, expanded: true } : entry,
            ),
          );
        }
      }
      return;
    }

    if (selectedLesson.type === 'COURSE_COMPLETION') {
      if (dir === 'prev' && finalExam) {
        tryNavigateToLesson(finalExam);
      }
      return;
    }

    const ownerModule = modules.find((module) =>
      module.lessons?.some((lesson) => lesson.id === adjacentLesson.id),
    );
    if (ownerModule?.id) {
      setModules((prev) =>
        prev.map((entry) => (entry.id === ownerModule.id ? { ...entry, expanded: true } : entry)),
      );
    }

    tryNavigateToLesson(adjacentLesson);
  };

  const markLessonInState = useCallback((contentId: string, moduleId: string, progress: number) => {
    setEnrollmentProgress((current) => (current === progress ? current : progress));

    if (learningCourse?.finalExam?.id === contentId) {
      setFinalExamCompleted(true);
      setSelectedLesson((prev) =>
        prev && prev.id === contentId && !prev.completed ? { ...prev, completed: true } : prev,
      );
      return;
    }

    setModules((prev) => {
      const targetLesson = prev
        .flatMap((module) => module.lessons ?? [])
        .find((lesson) => lesson.id === contentId);

      if (targetLesson?.completed) {
        return prev;
      }

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
      prev && prev.id === contentId && !prev.completed ? { ...prev, completed: true } : prev,
    );
  }, [learningCourse?.finalExam?.id]);

  const handleQuizProgressUpdated = useCallback(
    (contentId: string, moduleId: string, progress: number) => {
      markLessonInState(contentId, moduleId, progress);
    },
    [markLessonInState],
  );

  const markLessonComplete = async () => {
    if (!selectedLesson?.id) return;

    if (showPayToContinue) {
      handlePayToContinue();
      return;
    }

    const finalExam = finalExamLesson;

    if (selectedLesson.completed) {
      if (shouldGateNavigationFromPreview(selectedLesson.id, 'next', paymentLockOptions)) {
        openPaymentDialog();
        return;
      }

      const nextLesson = resolveAdjacentLesson('next', selectedLesson, modules, finalExam);
      if (shouldGateLessonForPayment(nextLesson, paymentLockOptions)) {
        openPaymentDialog();
        return;
      }

      navigateLesson('next');
      return;
    }

    const moduleId = String(selectedLesson.raw?.moduleId || '');
    const allCurrentLessons = modules.flatMap((module) => module.lessons || []);
    const currentLessonIndex = allCurrentLessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id,
    );
    const isLastLesson =
      currentLessonIndex >= 0 && currentLessonIndex === allCurrentLessons.length - 1;
    const completedPreviewLesson =
      shouldGateNavigationFromPreview(selectedLesson.id, 'next', paymentLockOptions);

    try {
      const result = await completeContentProgress.mutateAsync(selectedLesson.id);
      markLessonInState(selectedLesson.id, moduleId, result.progress);

      if (completedPreviewLesson) {
        openPaymentDialog();
        return;
      }

      const nextLesson = resolveAdjacentLesson('next', selectedLesson, modules, finalExam);
      if (shouldGateLessonForPayment(nextLesson, paymentLockOptions)) {
        openPaymentDialog();
        return;
      }

      if (!isLastLesson) {
        navigateLesson('next');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (isPreviewAccess && isPaymentEnrollmentError(message)) {
        toast.error(PREVIEW_PAYMENT_MESSAGE);
        openPaymentDialog();
        return;
      }
      const assessmentTitle = parseProgressBlockMessage(message);
      if (assessmentTitle) {
        const assessmentLesson = modules
          .flatMap((module) => module.lessons ?? [])
          .find(
            (lesson) =>
              lesson.title === assessmentTitle ||
              lesson.title.includes(assessmentTitle) ||
              assessmentTitle.includes(lesson.title),
          );

        if (assessmentLesson) {
          setAssignmentContinueBlock({
            contentId: assessmentLesson.id,
            message: `${assessmentTitle} must be submitted before continuing.`,
          });
          setSelectedLesson(assessmentLesson);
        }
        return;
      }
    }
  };

  const finalExamLesson = useMemo(() => {
    if (!learningCourse?.finalExam) return null;
    return mapFinalExamToLesson({
      ...learningCourse.finalExam,
      completed: finalExamCompleted,
      isPaymentLocked: isPreviewAccess ? true : learningCourse.finalExam.isPaymentLocked,
    });
  }, [learningCourse?.finalExam, finalExamCompleted, isPreviewAccess]);

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
              const summary = lesson as unknown as LessonSummary;

              if (shouldGateLessonForPayment(summary, paymentLockOptions)) {
                openPaymentDialog();
                return;
              }

              setSelectedLesson(summary);
              setAssignmentContinueBlock(null);
              if (isMobile) setSidebarOpen(false);
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
              if (shouldGateLessonForPayment(finalExamLesson, paymentLockOptions)) {
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
            <div className="relative h-full">
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
                onQuizProgressUpdated={handleQuizProgressUpdated}
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
                showPayToContinue={showPayToContinue}
                onPayToContinue={handlePayToContinue}
                assignmentContinueBlockMessage={
                  assignmentContinueBlock?.contentId === selectedLesson.id
                    ? assignmentContinueBlock.message
                    : null
                }
              />
            </div>
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
        onSubmitted={() => setPaymentPendingDialogOpen(true)}
      />
      <PaymentPendingDialog
        open={paymentPendingDialogOpen}
        onOpenChange={setPaymentPendingDialogOpen}
        courseTitle={courseTitle}
      />
      <IncompleteCourseModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
      />
    </div>
  );
}
