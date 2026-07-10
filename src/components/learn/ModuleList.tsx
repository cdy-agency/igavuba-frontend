'use client';

import React from 'react';
import {
  FileText,
  Video,
  FileType,
  Loader,
  ChevronUp,
  CheckCircle2,
  Circle,
  Award,
  Lock,
  ClipboardCheck,
} from 'lucide-react';
import { ContentType } from '@/types/content';
import type { LessonItem, ModuleItem } from '@/types/learning';

type Props = {
  modules: (ModuleItem & { locked?: boolean })[];
  onToggleModule: (id: string) => void;
  selectedLesson?: LessonItem | null;
  onSelectLesson: (lesson: LessonItem) => void;
  courseLockedEnabled?: boolean;
  onBlockedLessonSelect?: () => void;
  onPaymentLockedLessonSelect?: () => void;
  isPreviewAccess?: boolean;
  hasPendingPayment?: boolean;
  fetchingModules?: Record<string, boolean>;

  courseCompleted: boolean;
  courseEligible: boolean;
  onCourseCompletionClick: () => void;
  finalExamLesson?: LessonItem | null;
  onSelectFinalExam?: () => void;
  moduleLessonsComplete?: boolean;
  finalExamPaymentLocked?: boolean;
};

const getContentIcon = (type: string) => {
  switch (type) {
    case ContentType.TEXT:
      return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
    case ContentType.VIDEO:
      return <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />;
    case ContentType.DOCUMENT:
      return <FileType className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />;
    default:
      return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />;
  }
};

const getProgress = (lessons: LessonItem[]) => {
  const completed = lessons.filter((lesson) => lesson.completed).length;
  return `${completed}/${lessons.length}`;
};

const ModuleList: React.FC<Props> = ({
  modules,
  onToggleModule,
  selectedLesson,
  onSelectLesson,
  courseLockedEnabled = true,
  onBlockedLessonSelect,
  onPaymentLockedLessonSelect,
  isPreviewAccess = false,
  hasPendingPayment = false,
  fetchingModules = {},
  courseCompleted,
  courseEligible,
  onCourseCompletionClick,
  finalExamLesson,
  onSelectFinalExam,
  moduleLessonsComplete = true,
  finalExamPaymentLocked = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {modules.map((module) => {
        const isExpanded = module.expanded;
        const isLocked = !!module.locked;

        return (
          <div
            key={module.id}
            className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 overflow-hidden"
          >
            {/* Module Header */}
            <button
              onClick={() => onToggleModule(module.id)}
              className={`w-full flex items-center justify-between transition-colors ${
                isLocked
                  ? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed opacity-80'
                  : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 px-4 py-2 sm:py-3">
                <div className="text-left min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide break-words">
                    {module.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 px-4">
                {!isLocked && (
                  <span className="text-white font-medium text-xs sm:text-sm">
                    {getProgress(module.lessons ?? [])}
                  </span>
                )}
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                  {isLocked ? (
                    <Lock size={18} className="text-white" />
                  ) : (
                    <ChevronUp
                      size={16}
                      className={`text-white transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
                    />
                  )}
                </div>
              </div>
            </button>

            {/* Lessons */}
            {isExpanded && !isLocked && (
              <div className="bg-gray-100 dark:bg-gray-900">
                {fetchingModules[module.id] ? (
                  <div className="flex justify-center py-4 sm:py-6">
                    <Loader className="w-5 h-5 sm:w-6 sm:h-6 text-primary dark:text-primary animate-spin" />
                  </div>
                ) : (
                  (module.lessons ?? []).map((lesson, lessonIndex) => {
                    const active = selectedLesson?.id === lesson.id;
                    const isPaymentLocked = Boolean(lesson.isPaymentLocked);

                    const isLessonBlocked =
                      !isPaymentLocked &&
                      courseLockedEnabled &&
                      (module.lessons || []).slice(0, lessonIndex).some((l) => !l.completed);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (isPaymentLocked) {
                            onSelectLesson(lesson);
                            return;
                          }
                          if (isLessonBlocked) {
                            if (onBlockedLessonSelect) onBlockedLessonSelect();
                            return;
                          }
                          onSelectLesson(lesson);
                        }}
                        className={`w-full flex items-center gap-3 transition-all text-left py-2 pr-8 sm:pr-6 ${
                          isPaymentLocked || isLessonBlocked
                            ? 'opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 border-l-4 border-transparent'
                            : active
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-primary'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                        }`}
                      >
                        {/* Icon */}
                        <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                          {isPaymentLocked || isLessonBlocked ? (
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                          ) : (
                            getContentIcon(lesson.type ?? '')
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm sm:text-base font-medium ${
                              isPaymentLocked || isLessonBlocked
                                ? 'text-gray-400 dark:text-gray-500'
                                : active
                                  ? 'dark:text-blue-300'
                                  : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {lesson.title}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {isPaymentLocked
                              ? hasPendingPayment
                                ? 'Awaiting payment confirmation'
                                : isPreviewAccess
                                  ? 'Available after payment approval'
                                  : 'Locked'
                              : isLessonBlocked
                                ? 'Complete previous lesson first'
                                : lesson.type === ContentType.VIDEO
                                  ? 'Video Lesson'
                                  : lesson.type === ContentType.TEXT
                                    ? 'Text Content'
                                    : lesson.type === ContentType.DOCUMENT
                                      ? 'Document'
                                      : 'Lesson'}
                          </div>
                        </div>

                        {/* Completion indicator */}
                        <div className="shrink-0 self-center flex items-center justify-center">
                          {isPaymentLocked || isLessonBlocked ? (
                            <Lock className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                          ) : lesson.completed ? (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}

                {modules[modules?.length - 1]?.id === module.id && finalExamLesson ? (
                  <button
                    type="button"
                    onClick={() => onSelectFinalExam?.()}
                    className={`w-full flex items-center gap-3 transition-all text-left py-2 pr-8 sm:pr-6 ${
                      selectedLesson?.id === finalExamLesson.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-primary'
                        : finalExamPaymentLocked
                          ? 'opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 border-l-4 border-transparent'
                          : moduleLessonsComplete
                            ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                            : 'opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 border-l-4 border-transparent'
                    }`}
                    disabled={!moduleLessonsComplete && !finalExamPaymentLocked}
                  >
                    <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                      {finalExamPaymentLocked ? (
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                      ) : moduleLessonsComplete ? (
                        <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      ) : (
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm sm:text-base font-medium ${
                          selectedLesson?.id === finalExamLesson.id
                            ? 'dark:text-blue-300'
                            : finalExamPaymentLocked
                              ? 'text-gray-400 dark:text-gray-500'
                              : moduleLessonsComplete
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {finalExamLesson.title}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {finalExamPaymentLocked
                          ? hasPendingPayment
                            ? 'Awaiting payment confirmation'
                            : 'Available after payment approval'
                          : moduleLessonsComplete
                            ? 'Final exam'
                            : 'Complete all lessons first'}
                      </div>
                    </div>
                    <div className="shrink-0 self-center flex items-center justify-center">
                      {finalExamLesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </button>
                ) : null}

                {/* Course Completion Button — only show on last module */}
                {modules[modules?.length - 1]?.id === module.id && (
                  <button
                    onClick={() => {
                      const canComplete =
                        courseEligible &&
                        (!finalExamLesson || finalExamLesson.completed);
                      if (canComplete) {
                        onCourseCompletionClick();
                      } else {
                        onSelectLesson({
                          id: 'course-completion',
                          type: 'COURSE_COMPLETION',
                        } as LessonItem);
                      }
                    }}
                    className={`w-full flex items-center gap-3 transition-all text-left py-2 pr-8 sm:pr-6 ${
                      selectedLesson?.id === 'course-completion' ||
                      selectedLesson?.type === 'COURSE_COMPLETION'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-primary'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                      <Award
                        className={`w-5 h-5 ${
                          courseCompleted
                            ? 'text-green-500 dark:text-green-400'
                            : courseEligible
                              ? 'text-primary'
                              : 'text-gray-400 dark:text-gray-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm sm:text-base font-medium ${
                          courseCompleted
                            ? 'text-green-600 dark:text-green-400'
                            : courseEligible
                              ? 'text-primary dark:text-blue-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Complete Course
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {!courseEligible
                          ? 'Finish all lessons first'
                          : finalExamLesson && !finalExamLesson.completed
                            ? 'Pass the final exam first'
                            : !courseCompleted
                              ? 'View certificate & finish'
                              : 'Completed'}
                      </div>
                    </div>

                    <div className="shrink-0 self-center flex items-center justify-center">
                      {courseCompleted && (
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            courseEligible
                              ? 'text-primary dark:text-blue-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModuleList;
