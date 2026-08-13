'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';
import {
  AssessmentAcademicRules,
  defaultAssessmentAcademicRules,
  type AcademicRulesSaveStatus,
} from '@/components/academic/assessment-academic-rules';
import { AcademicRulesImpactDialog } from '@/components/academic/academic-rules-impact-dialog';
import { AcademicRuleBadges } from '@/components/academic/academic-rule-badge';
import { useCourseDetail } from '@/hooks/use-courses';
import { CourseLifecycleStatus } from '@/types/course-status';
import { QuizManagedQuestionBuilder } from '@/components/quiz/quiz-managed-question-builder';
import {
  QuizBuilderShell,
  QUIZ_UNLIMITED_ATTEMPTS,
  type QuizBuilderView,
} from '@/components/quiz/quiz-builder-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAutoSave } from '@/hooks/use-autosave';
import { useUpdateQuiz, useQuizDetail } from '@/hooks/use-quiz';
import type { ModuleContentItem } from '@/types/content';
import type { AssessmentSettings } from '@/types/quiz';
import { defaultQuizSettings } from '@/lib/quiz-utils';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { getContentTitleError } from '@/components/course-builder/lesson-form-ui';

interface QuizLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
  readOnly?: boolean;
}

type QuizFormValue = {
  title: string;
  description: string;
  timeLimitMinutes: string;
  unlimitedTime: boolean;
  isVisible: boolean;
  settings: AssessmentSettings;
  academicRules: AssessmentAcademicRulesFormValues;
  unlimitedAttempts: boolean;
};

export function QuizLessonEditor({
  item,
  moduleId,
  onDelete,
  readOnly = false,
}: QuizLessonEditorProps) {
  const params = useParams<{ slug?: string }>();
  const { data: course } = useCourseDetail(params.slug ?? '', Boolean(params.slug));
  const isPublishedCourse = course?.status === CourseLifecycleStatus.PUBLISHED;
  const quizId = item.content.assessment?.quiz?.id ?? null;
  const {
    data: quiz,
    isPending,
    isError,
    error,
    refetch,
  } = useQuizDetail(quizId ?? '', Boolean(quizId));
  const { setBuilderSaveState } = useCourseBuilder();

  const [view, setView] = useState<QuizBuilderView>('builder');
  const [title, setTitle] = useState(item.content.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [unlimitedTime, setUnlimitedTime] = useState(true);
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [settings, setSettings] = useState<AssessmentSettings>(defaultQuizSettings());
  const [unlimitedAttempts, setUnlimitedAttempts] = useState(true);
  const [academicRules, setAcademicRules] = useState<AssessmentAcademicRulesFormValues>(
    defaultAssessmentAcademicRules(),
  );
  const addQuestionRef = useRef<(() => void) | null>(null);
  const lastSavedRulesRef = useRef<AssessmentAcademicRulesFormValues | null>(null);
  const [pendingRules, setPendingRules] = useState<AssessmentAcademicRulesFormValues | null>(
    null,
  );
  const [impactOpen, setImpactOpen] = useState(false);

  const updateQuizMutation = useUpdateQuiz(quizId ?? '', {
    silent: true,
    moduleId,
  });
  const hydratedQuizIdRef = useRef<string | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const clearSavedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formValue = useMemo<QuizFormValue>(
    () => ({
      title,
      description,
      timeLimitMinutes,
      unlimitedTime,
      isVisible,
      settings,
      academicRules:
        impactOpen && lastSavedRulesRef.current ? lastSavedRulesRef.current : academicRules,
      unlimitedAttempts,
    }),
    [
      title,
      description,
      timeLimitMinutes,
      unlimitedTime,
      isVisible,
      settings,
      academicRules,
      unlimitedAttempts,
      impactOpen,
    ],
  );

  const totalMarks = useMemo(
    () => quiz?.questions.reduce((sum, question) => sum + question.points, 0) ?? 0,
    [quiz?.questions],
  );

  const applyQuizToForm = useCallback((nextQuiz: NonNullable<typeof quiz>) => {
    const attempts = nextQuiz.maxAttempts ?? 1;
    const nextValue: QuizFormValue = {
      title: nextQuiz.assessment.title,
      description: nextQuiz.assessment.description ?? '',
      timeLimitMinutes: nextQuiz.timeLimitMinutes ? String(nextQuiz.timeLimitMinutes) : '',
      unlimitedTime: !nextQuiz.timeLimitMinutes,
      isVisible: nextQuiz.assessment.content.isPublished,
      settings: nextQuiz.assessment.settings ?? defaultQuizSettings(),
      unlimitedAttempts: attempts >= QUIZ_UNLIMITED_ATTEMPTS,
      academicRules: defaultAssessmentAcademicRules({
        required: nextQuiz.required ?? true,
        countsTowardCertificate: nextQuiz.countsTowardCertificate ?? false,
        blockProgressUntilPassed: nextQuiz.blockProgressUntilPassed ?? false,
        passingScore: nextQuiz.passingScore,
        maxAttempts: attempts >= QUIZ_UNLIMITED_ATTEMPTS ? 1 : attempts,
      }),
    };

    setTitle(nextValue.title);
    setDescription(nextValue.description);
    setTimeLimitMinutes(nextValue.timeLimitMinutes);
    setUnlimitedTime(nextValue.unlimitedTime);
    setIsVisible(nextValue.isVisible);
    setSettings(nextValue.settings);
    setUnlimitedAttempts(nextValue.unlimitedAttempts);
    setAcademicRules(nextValue.academicRules);
    lastSavedRulesRef.current = nextValue.academicRules;
    return nextValue;
  }, []);

  useEffect(() => {
    if (!quiz) return;
    if (hydratedQuizIdRef.current === quiz.id) return;
    hydratedQuizIdRef.current = quiz.id;
    applyQuizToForm(quiz);
    setAutosaveEnabled(true);
  }, [quiz, applyQuizToForm]);

  const handleStatusChange = useCallback(
    (
      status: 'idle' | 'saving' | 'pending' | 'offline' | 'saved',
      message?: string | null,
    ) => {
      if (clearSavedStatusTimerRef.current) {
        clearTimeout(clearSavedStatusTimerRef.current);
        clearSavedStatusTimerRef.current = null;
      }

      if (status === 'idle') {
        setBuilderSaveState(null);
        return;
      }

      const nextMessage =
        message ||
        (status === 'saving'
          ? 'Saving...'
          : status === 'offline'
            ? 'Offline draft'
            : status === 'saved'
              ? 'Saved'
              : 'Pending changes');

      setBuilderSaveState({
        status,
        message: nextMessage,
        isSaving: status === 'saving',
      });

      // Clear the transient "Saved" chip so it does not linger forever.
      if (status === 'saved') {
        clearSavedStatusTimerRef.current = setTimeout(() => {
          setBuilderSaveState((current) =>
            current?.status === 'saved' ? null : current,
          );
          clearSavedStatusTimerRef.current = null;
        }, 1500);
      }
    },
    [setBuilderSaveState],
  );

  const saveFormValue = useCallback(
    async (next: QuizFormValue) => {
      if (readOnly || !quizId) return;
      if (getContentTitleError(next.title)) return;
      await updateQuizMutation.mutateAsync({
        title: next.title.trim() || 'Untitled Quiz',
        description: next.description.trim() || undefined,
        timeLimitMinutes:
          next.unlimitedTime || !next.timeLimitMinutes
            ? null
            : Number(next.timeLimitMinutes),
        isPublished: next.isVisible,
        settings: next.settings,
        required: next.academicRules.required,
        countsTowardCertificate: next.academicRules.countsTowardCertificate,
        blockProgressUntilPassed: next.academicRules.blockProgressUntilPassed,
        passingScore: next.academicRules.passingScore,
        maxAttempts: next.unlimitedAttempts
          ? QUIZ_UNLIMITED_ATTEMPTS
          : next.academicRules.maxAttempts,
      });
      lastSavedRulesRef.current = next.academicRules;
    },
    [quizId, readOnly, updateQuizMutation],
  );

  const autoSave = useAutoSave({
    storageKey: `course-builder-quiz-${quizId}`,
    value: formValue,
    onChange: (next) => {
      setTitle(next.title);
      setDescription(next.description);
      setTimeLimitMinutes(next.timeLimitMinutes);
      setUnlimitedTime(next.unlimitedTime ?? !next.timeLimitMinutes);
      setIsVisible(next.isVisible);
      setSettings(next.settings);
      setAcademicRules(next.academicRules);
      setUnlimitedAttempts(next.unlimitedAttempts ?? true);
    },
    saveFn: saveFormValue,
    debounceMs: 700,
    restoreOnMount: false,
    enabled: autosaveEnabled && !readOnly && Boolean(quizId) && !getContentTitleError(title),
    onStatusChange: handleStatusChange,
  });

  const flushRef = useRef(autoSave.flush);
  flushRef.current = autoSave.flush;
  const markSavedRef = useRef(autoSave.markSaved);
  markSavedRef.current = autoSave.markSaved;

  useEffect(() => {
    return () => {
      if (clearSavedStatusTimerRef.current) {
        clearTimeout(clearSavedStatusTimerRef.current);
      }
      void flushRef.current().finally(() => {
        setBuilderSaveState(null);
      });
    };
  }, [setBuilderSaveState]);

  const handleAcademicRulesChange = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    setAcademicRules((current) => ({ ...current, ...patch }));
  };

  const requestAcademicRulesSave = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    if (readOnly) return;
    const nextRules = { ...academicRules, ...patch };
    if (!isPublishedCourse) return;

    setPendingRules(nextRules);
    setImpactOpen(true);
  };

  const rulesSaveStatus: AcademicRulesSaveStatus =
    autoSave.status === 'saving'
      ? 'saving'
      : autoSave.status === 'saved'
        ? 'saved'
        : autoSave.error
          ? 'error'
          : 'idle';

  const handleManualSave = async () => {
    try {
      await autoSave.flush();
      toast.success('Quiz saved');
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError, 'Unable to save quiz.'));
    }
  };

  if (!quizId) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center">
        <p className="text-sm text-muted-foreground">Quiz data is unavailable for this lesson.</p>
      </div>
    );
  }

  if (isPending && !quiz) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && !quiz) {
    return (
      <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-foreground">Unable to load this quiz</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {getApiErrorMessage(error, 'The quiz request failed. Try again.')}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
    <QuizBuilderShell
      view={view}
      onViewChange={setView}
      title={title}
      titleError={titleError}
      onTitleChange={
        readOnly
          ? undefined
          : (value) => {
              setTitle(value);
              setTitleError(getContentTitleError(value));
            }
      }
      titlePlaceholder="Untitled Quiz"
      timeLimitMinutes={timeLimitMinutes}
      onTimeLimitChange={
        readOnly
          ? undefined
          : (value) => {
              setTimeLimitMinutes(value);
            }
      }
      unlimitedTime={unlimitedTime}
      onUnlimitedTimeChange={
        readOnly
          ? undefined
          : (value) => {
              setUnlimitedTime(value);
              if (value) setTimeLimitMinutes('');
            }
      }
      totalMarks={totalMarks}
      passingScore={academicRules.passingScore}
      onPassingScoreChange={
        readOnly
          ? undefined
          : (value) => {
              setAcademicRules((current) => ({ ...current, passingScore: value }));
            }
      }
      maxAttempts={academicRules.maxAttempts}
      onMaxAttemptsChange={
        readOnly
          ? undefined
          : (value) => {
              setAcademicRules((current) => ({ ...current, maxAttempts: value }));
            }
      }
      unlimitedAttempts={unlimitedAttempts}
      onUnlimitedAttemptsChange={
        readOnly
          ? undefined
          : (value) => {
              setUnlimitedAttempts(value);
            }
      }
      isVisible={isVisible}
      onVisibilityToggle={
        readOnly
          ? undefined
          : () => {
              const nextVisible = !isVisible;
              const nextForm = { ...formValue, isVisible: nextVisible };
              setIsVisible(nextVisible);
              // Keep autosave from treating visibility as a second pending edit.
              markSavedRef.current(nextForm);
              handleStatusChange('saving', 'Saving...');
              void updateQuizMutation
                .mutateAsync({ isPublished: nextVisible })
                .then(() => {
                  handleStatusChange('saved', 'Saved');
                })
                .catch(() => {
                  setIsVisible(!nextVisible);
                  markSavedRef.current({ ...formValue, isVisible: !nextVisible });
                  handleStatusChange('pending', 'Save pending');
                });
            }
      }
      onAddQuestion={
        readOnly
          ? undefined
          : () => {
              setView('builder');
              addQuestionRef.current?.();
            }
      }
      onSave={readOnly ? undefined : () => void handleManualSave()}
      onDelete={readOnly ? undefined : onDelete}
      isSaving={updateQuizMutation.isPending}
      readOnly={readOnly}
      builderContent={
        readOnly ? (
          <p className="text-sm text-muted-foreground">
            Question details are view-only during review.
          </p>
        ) : (
          <QuizManagedQuestionBuilder
            quizId={quizId}
            moduleId={moduleId}
            addQuestionRef={addQuestionRef}
          />
        )
      }
      settingsContent={
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-foreground">Quiz configuration</p>
            <AcademicRuleBadges
              required={academicRules.required}
              countsTowardCertificate={academicRules.countsTowardCertificate}
              blockProgressUntilPassed={academicRules.blockProgressUntilPassed}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`quiz-description-${item.contentId}`}>Description</Label>
            <Input
              id={`quiz-description-${item.contentId}`}
              value={description}
              disabled={readOnly}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={readOnly ? undefined : () => void autoSave.flush()}
              placeholder="Short description for learners"
            />
          </div>

          {(
            [
              ['showResults', 'Show results'],
              ['showCorrectAnswers', 'Show correct answers'],
              ['shuffleQuestions', 'Shuffle questions'],
              ['shuffleOptions', 'Shuffle options'],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5"
            >
              <Label htmlFor={`${key}-${item.contentId}`}>{label}</Label>
              <Switch
                id={`${key}-${item.contentId}`}
                size="sm"
                checked={settings[key]}
                disabled={readOnly}
                onCheckedChange={(checked) => {
                  if (readOnly) return;
                  setSettings((current) => ({ ...current, [key]: checked }));
                }}
              />
            </div>
          ))}

          <AssessmentAcademicRules
            idPrefix={`quiz-${item.contentId}`}
            values={academicRules}
            readOnly={readOnly}
            disabled={updateQuizMutation.isPending}
            saveStatus={rulesSaveStatus}
            onChange={handleAcademicRulesChange}
            onCommit={requestAcademicRulesSave}
          />
        </div>
      }
    />
      <AcademicRulesImpactDialog
        open={impactOpen}
        onOpenChange={(open) => {
          setImpactOpen(open);
          if (!open && pendingRules) {
            if (lastSavedRulesRef.current) {
              setAcademicRules(lastSavedRulesRef.current);
            }
            setPendingRules(null);
          }
        }}
        onConfirm={() => {
          if (!pendingRules) return;
          setAcademicRules(pendingRules);
          setPendingRules(null);
        }}
        onCancel={() => {
          if (lastSavedRulesRef.current) {
            setAcademicRules(lastSavedRulesRef.current);
          }
          setPendingRules(null);
        }}
      />
    </>
  );
}
