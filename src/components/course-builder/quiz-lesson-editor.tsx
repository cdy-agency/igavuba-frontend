'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';
import {
  ContentVisibilityToggle,
  LessonSettingsGroup,
} from '@/components/course-builder/lesson-form-ui';
import {
  AssessmentAcademicRules,
  defaultAssessmentAcademicRules,
} from '@/components/academic/assessment-academic-rules';
import { AssessmentSettingsTabs } from '@/components/academic/assessment-settings-tabs';
import { AcademicRuleBadges } from '@/components/academic/academic-rule-badge';
import { QuizManagedQuestionBuilder } from '@/components/quiz/quiz-managed-question-builder';
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

interface QuizLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
  readOnly?: boolean;
}

export function QuizLessonEditor({
  item,
  moduleId,
  onDelete,
  readOnly = false,
}: QuizLessonEditorProps) {
  const quizId = item.content.assessment?.quiz?.id ?? null;
  const {
    data: quiz,
    isPending,
    isError,
    error,
    refetch,
  } = useQuizDetail(quizId ?? '', Boolean(quizId));
  const { setBuilderSaveState } = useCourseBuilder();

  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [settings, setSettings] = useState<AssessmentSettings>(defaultQuizSettings());
  const [academicRules, setAcademicRules] = useState<AssessmentAcademicRulesFormValues>(
    defaultAssessmentAcademicRules(),
  );

  const updateQuizMutation = useUpdateQuiz(quizId ?? '', { silent: true });

  useEffect(() => {
    if (!quiz) return;
    setTitle(quiz.assessment.title);
    setDescription(quiz.assessment.description ?? '');
    setTimeLimitMinutes(quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : '');
    setIsVisible(quiz.assessment.content.isPublished);
    setSettings(quiz.assessment.settings ?? defaultQuizSettings());
    setAcademicRules(
      defaultAssessmentAcademicRules({
        required: quiz.required ?? true,
        countsTowardCertificate: quiz.countsTowardCertificate ?? true,
        blockProgressUntilPassed: quiz.blockProgressUntilPassed ?? false,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
      }),
    );
  }, [quiz]);

  const saveFormValue = async (next: {
    title: string;
    description: string;
    timeLimitMinutes: string;
    isVisible: boolean;
    settings: AssessmentSettings;
    academicRules: AssessmentAcademicRulesFormValues;
  }) => {
    if (readOnly || !quizId) return;
    await updateQuizMutation.mutateAsync({
      title: next.title.trim(),
      description: next.description.trim() || undefined,
      timeLimitMinutes: next.timeLimitMinutes ? Number(next.timeLimitMinutes) : null,
      isPublished: next.isVisible,
      settings: next.settings,
      required: next.academicRules.required,
      countsTowardCertificate: next.academicRules.countsTowardCertificate,
      blockProgressUntilPassed: next.academicRules.blockProgressUntilPassed,
      passingScore: next.academicRules.passingScore,
      maxAttempts: next.academicRules.maxAttempts,
    });
  };

  const autoSave = useAutoSave({
    storageKey: `course-builder-quiz-${quizId}`,
    value: {
      title,
      description,
      timeLimitMinutes,
      isVisible,
      settings,
      academicRules,
    },
    onChange: (next) => {
      setTitle(next.title);
      setDescription(next.description);
      setTimeLimitMinutes(next.timeLimitMinutes);
      setIsVisible(next.isVisible);
      setSettings(next.settings);
      setAcademicRules(next.academicRules);
    },
    saveFn: async (next) => {
      if (!quizId) return;
      await saveFormValue(next);
    },
    debounceMs: 700,
    restoreOnMount: Boolean(quizId),
    onStatusChange: (status, message) => {
      setBuilderSaveState({
        status,
        message:
          message ||
          (status === 'saving'
            ? 'Saving...'
            : status === 'offline'
              ? 'Offline draft'
              : 'Pending changes'),
        isSaving: status === 'saving',
      });
    },
  });

  // Keep a stable flush ref so unmount cleanup does not re-run every render.
  // Depending on `autoSave` caused an infinite remount/fetch loop in production.
  const flushRef = useRef(autoSave.flush);
  flushRef.current = autoSave.flush;

  useEffect(() => {
    return () => {
      void flushRef.current();
      setBuilderSaveState(null);
    };
  }, [setBuilderSaveState]);

  const handleAcademicRulesChange = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    setAcademicRules((current) => ({ ...current, ...patch }));
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
    <BuilderLessonShell
      readOnly={readOnly}
      title={title}
      onTitleChange={setTitle}
      onTitleBlur={
        readOnly
          ? undefined
          : () => {
              void autoSave.flush();
            }
      }
      description={description}
      onDescriptionChange={(value) => {
        setDescription(value);
      }}
      onDescriptionBlur={
        readOnly
          ? undefined
          : () => {
              void autoSave.flush();
            }
      }
      onDelete={readOnly ? undefined : onDelete}
      icon={<CheckCircle2 className="h-4.5 w-4.5 text-orange-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-foreground">Quiz configuration</p>
            <AcademicRuleBadges
              required={academicRules.required}
              countsTowardCertificate={academicRules.countsTowardCertificate}
              blockProgressUntilPassed={academicRules.blockProgressUntilPassed}
            />
          </div>
          <AssessmentSettingsTabs
            settingsContent={
              <>
                <LessonSettingsGroup>
                  <ContentVisibilityToggle
                    visible={isVisible}
                    disabled={readOnly}
                    onChange={(visible) => {
                      if (readOnly) return;
                      setIsVisible(visible);
                    }}
                  />
                </LessonSettingsGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`passing-${item.contentId}`}>Passing score (%)</Label>
                    <Input
                      id={`passing-${item.contentId}`}
                      type="number"
                      min={0}
                      max={100}
                      value={academicRules.passingScore}
                      disabled={readOnly}
                      onChange={(event) =>
                        setAcademicRules((current) => ({
                          ...current,
                          passingScore: Number(event.target.value) || 0,
                        }))
                      }
                      onBlur={() => {
                        void autoSave.flush();
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`attempts-${item.contentId}`}>Max attempts</Label>
                    <Input
                      id={`attempts-${item.contentId}`}
                      type="number"
                      min={1}
                      value={academicRules.maxAttempts}
                      disabled={readOnly}
                      onChange={(event) =>
                        setAcademicRules((current) => ({
                          ...current,
                          maxAttempts: Number(event.target.value) || 1,
                        }))
                      }
                      onBlur={() => {
                        void autoSave.flush();
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`time-${item.contentId}`}>Time limit (minutes)</Label>
                    <Input
                      id={`time-${item.contentId}`}
                      type="number"
                      min={1}
                      value={timeLimitMinutes}
                      disabled={readOnly}
                      onChange={(event) => setTimeLimitMinutes(event.target.value)}
                      onBlur={readOnly ? undefined : () => void autoSave.flush()}
                      placeholder="Optional"
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
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <Label htmlFor={`${key}-${item.contentId}`}>{label}</Label>
                      <Switch
                        id={`${key}-${item.contentId}`}
                        checked={settings[key]}
                        disabled={readOnly}
                        onCheckedChange={(checked) => {
                          if (readOnly) return;
                          const nextSettings = { ...settings, [key]: checked };
                          setSettings(nextSettings);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            }
            academicRulesContent={
              <AssessmentAcademicRules
                idPrefix={`quiz-${item.contentId}`}
                values={academicRules}
                readOnly={readOnly}
                disabled={updateQuizMutation.isPending}
                onChange={handleAcademicRulesChange}
              />
            }
          />
        </div>
      }
    >
      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          Question details are view-only during review.
        </p>
      ) : (
        <QuizManagedQuestionBuilder quizId={quizId} moduleId={moduleId} />
      )}
    </BuilderLessonShell>
  );
}
