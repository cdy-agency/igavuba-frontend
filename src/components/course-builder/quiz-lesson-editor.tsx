'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
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
import { useUpdateQuiz, useQuizDetail } from '@/hooks/use-quiz';
import type { ModuleContentItem } from '@/types/content';
import { defaultQuizSettings } from '@/lib/quiz-utils';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';

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
  const { data: quiz, isPending } = useQuizDetail(quizId ?? '', Boolean(quizId));

  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [settings, setSettings] = useState(defaultQuizSettings());
  const [academicRules, setAcademicRules] = useState<AssessmentAcademicRulesFormValues>(
    defaultAssessmentAcademicRules(),
  );

  const updateQuizMutation = useUpdateQuiz(quizId ?? '');

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

  const persistQuizMeta = async (overrides: Record<string, unknown> = {}) => {
    if (readOnly || !quizId) return;
    await updateQuizMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
      isPublished: isVisible,
      settings,
      ...academicRules,
      ...overrides,
    });
  };

  const persistAcademicRulesPatch = async (
    patch: Partial<AssessmentAcademicRulesFormValues>,
  ) => {
    if (readOnly || !quizId) return;
    await updateQuizMutation.mutateAsync(patch);
  };

  const handleAcademicRulesChange = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    setAcademicRules((current) => ({ ...current, ...patch }));
    void persistAcademicRulesPatch(patch);
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

  return (
    <BuilderLessonShell
      readOnly={readOnly}
      title={title}
      onTitleChange={setTitle}
      onTitleBlur={readOnly ? undefined : () => void persistQuizMeta()}
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={readOnly ? undefined : () => void persistQuizMeta()}
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
                      void updateQuizMutation.mutateAsync({ isPublished: visible });
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
                      onBlur={(event) =>
                        void persistAcademicRulesPatch({
                          passingScore: Number(event.currentTarget.value) || 0,
                        })
                      }
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
                      onBlur={(event) =>
                        void persistAcademicRulesPatch({
                          maxAttempts: Number(event.currentTarget.value) || 1,
                        })
                      }
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
                      onBlur={readOnly ? undefined : () => void persistQuizMeta()}
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
                          void updateQuizMutation.mutateAsync({ settings: nextSettings });
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
