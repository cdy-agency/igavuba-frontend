import type { AugmentedModule, LearningCourse, LessonSummary } from '@/types/learning';
import type { PaymentRecord } from '@/types/payment';

export type PreviewAccessState = {
  isPreviewAccess: boolean;
  hasPendingPayment: boolean;
  hasApprovedPayment: boolean;
};

export function resolvePreviewAccessState(
  course: LearningCourse | undefined,
  payments: PaymentRecord[] | undefined,
  courseId: string,
): PreviewAccessState {
  if (!course) {
    return { isPreviewAccess: false, hasPendingPayment: false, hasApprovedPayment: false };
  }

  const coursePayments = payments?.filter((payment) => payment.courseId === courseId) ?? [];
  const hasApprovedPayment = coursePayments.some((payment) => payment.status === 'APPROVED');
  const hasPendingPayment = coursePayments.some((payment) => payment.status === 'PENDING');

  // Trust backend access level: ACTIVE enrollment (e.g. 100% coupon) is FULL, not preview.
  const isPreviewAccess =
    course.access.level === 'PREVIEW' ||
    (course.enrollment.status === 'PENDING_PAYMENT' &&
      course.access.requiresPayment &&
      course.enrollment.source !== 'INSTITUTION_ASSIGNMENT' &&
      !hasApprovedPayment);

  return { isPreviewAccess, hasPendingPayment, hasApprovedPayment };
}

type PaymentLockOptions = {
  isPreviewAccess?: boolean;
  previewContentId?: string | null;
  finalExamPaymentLocked?: boolean;
  finalExamId?: string;
};

export function isLessonPaymentLocked(
  lesson: LessonSummary | undefined,
  options: PaymentLockOptions = {},
): boolean {
  if (!lesson) return false;

  if (options.isPreviewAccess && options.previewContentId) {
    return lesson.id !== options.previewContentId;
  }

  return Boolean(
    lesson.isPaymentLocked ||
      lesson.raw?.isPaymentLocked ||
      (options.finalExamPaymentLocked &&
        options.finalExamId &&
        lesson.id === options.finalExamId),
  );
}

export function getPaymentLockOptions(
  isPreviewAccess: boolean,
  previewContentId: string | null,
  finalExamPaymentLocked?: boolean,
  finalExamId?: string,
): PaymentLockOptions {
  return {
    isPreviewAccess,
    previewContentId,
    finalExamPaymentLocked,
    finalExamId,
  };
}

function stripLockedLesson(lesson: LessonSummary): LessonSummary {
  const content = lesson.raw?.content;

  return {
    ...lesson,
    isPaymentLocked: true,
    raw: {
      moduleId: lesson.raw?.moduleId ?? '',
      moduleContentId: lesson.raw?.moduleContentId ?? '',
      isPaymentLocked: true,
      content: {
        id: content?.id ?? lesson.id,
        title: content?.title ?? lesson.title,
        description: content?.description ?? null,
        type: content?.type ?? lesson.type,
        createdAt: content?.createdAt ?? '',
      },
    },
  };
}

export function applyPreviewAccessLocks(
  modules: AugmentedModule[],
  previewContentId: string | null,
  isPreviewAccess: boolean,
): AugmentedModule[] {
  if (!isPreviewAccess || !previewContentId) {
    return modules;
  }

  return modules.map((module, moduleIndex) => {
    const containsPreview =
      module.lessons?.some((lesson) => lesson.id === previewContentId) ?? false;

    return {
      ...module,
      locked: moduleIndex > 0 && !containsPreview ? true : Boolean(module.locked),
      lessons: (module.lessons ?? []).map((lesson) => {
        if (lesson.id === previewContentId) {
          return {
            ...lesson,
            isPaymentLocked: false,
            raw: lesson.raw
              ? { ...lesson.raw, isPaymentLocked: false }
              : lesson.raw,
          };
        }

        return stripLockedLesson(lesson);
      }),
    };
  });
}

export function resolveAdjacentLesson(
  dir: 'prev' | 'next',
  current: LessonSummary,
  modules: AugmentedModule[],
  finalExam: LessonSummary | null,
): LessonSummary | null {
  if (current.id === finalExam?.id) {
    if (dir === 'next') return null;

    const lastModule = modules[modules.length - 1];
    const lastLesson = lastModule?.lessons?.[lastModule.lessons.length - 1];
    return lastLesson ?? null;
  }

  if (current.type === 'COURSE_COMPLETION') {
    if (dir === 'prev' && finalExam) return finalExam;
    return null;
  }

  const moduleIndex = modules.findIndex((module) =>
    module.lessons?.some((lesson) => lesson.id === current.id),
  );
  if (moduleIndex === -1) return null;

  const lessons = modules[moduleIndex]?.lessons || [];
  const index = lessons.findIndex((lesson) => lesson.id === current.id);

  if (dir === 'prev' && index > 0) return lessons[index - 1] ?? null;
  if (dir === 'next' && index < lessons.length - 1) return lessons[index + 1] ?? null;

  const step = dir === 'next' ? 1 : -1;
  for (let i = moduleIndex + step; i >= 0 && i < modules.length; i += step) {
    const module = modules[i];
    if (!module?.lessons?.length || module.locked) continue;

    return dir === 'next'
      ? (module.lessons[0] ?? null)
      : (module.lessons[module.lessons.length - 1] ?? null);
  }

  if (dir === 'next' && finalExam) {
    const moduleLessons = modules.flatMap((module) => module.lessons || []);
    const allComplete =
      moduleLessons.length > 0 && moduleLessons.every((lesson) => lesson.completed);

    if (allComplete) return finalExam;
  }

  return null;
}

export function shouldGateLessonForPayment(
  lesson: LessonSummary | null,
  lockOptions: PaymentLockOptions,
): boolean {
  if (!lockOptions.isPreviewAccess || !lesson) return false;
  return isLessonPaymentLocked(lesson, lockOptions);
}

export function shouldGateNavigationFromPreview(
  currentLessonId: string,
  dir: 'prev' | 'next',
  lockOptions: PaymentLockOptions,
): boolean {
  if (dir !== 'next' || !lockOptions.isPreviewAccess || !lockOptions.previewContentId) {
    return false;
  }

  return currentLessonId === lockOptions.previewContentId;
}

export function isPreviewLesson(
  lessonId: string | undefined,
  lockOptions: PaymentLockOptions,
): boolean {
  return Boolean(
    lockOptions.isPreviewAccess &&
      lockOptions.previewContentId &&
      lessonId === lockOptions.previewContentId,
  );
}

export function shouldShowPayToContinue(
  lessonId: string | undefined,
  lockOptions: PaymentLockOptions,
): boolean {
  return isPreviewLesson(lessonId, lockOptions);
}

export function isPaymentEnrollmentError(message: string | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes('not enrolled in this course') ||
    normalized.includes('learner is not enrolled')
  );
}

export const PREVIEW_PAYMENT_MESSAGE =
  'Upload payment proof to unlock the rest of this course.';
