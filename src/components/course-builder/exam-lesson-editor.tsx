'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClipboardList, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonSettingsGroup,
  getContentTitleError,
} from '@/components/course-builder/lesson-form-ui';
import { ExamManagedQuestionBuilder } from '@/components/exam/exam-managed-question-builder';
import { DateTimePicker, toDatetimeLocalValue } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useExamDetail, useUpdateExam } from '@/hooks/use-exam';
import { useCourseDetail } from '@/hooks/use-courses';
import type { ModuleContentItem } from '@/types/content';
import {
  AssessmentAcademicRules,
  defaultAssessmentAcademicRules,
  type AcademicRulesSaveStatus,
} from '@/components/academic/assessment-academic-rules';
import { AcademicRulesImpactDialog } from '@/components/academic/academic-rules-impact-dialog';
import { AssessmentSettingsTabs } from '@/components/academic/assessment-settings-tabs';
import { AcademicRuleBadges } from '@/components/academic/academic-rule-badge';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';
import { defaultQuizSettings } from '@/lib/quiz-utils';
import { CourseLifecycleStatus } from '@/types/course-status';

interface ExamLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
  readOnly?: boolean;
}

function academicRulesEqual(
  a: AssessmentAcademicRulesFormValues,
  b: AssessmentAcademicRulesFormValues,
) {
  return (
    a.required === b.required &&
    a.countsTowardCertificate === b.countsTowardCertificate &&
    a.blockProgressUntilPassed === b.blockProgressUntilPassed &&
    a.passingScore === b.passingScore &&
    a.maxAttempts === b.maxAttempts
  );
}

export function ExamLessonEditor({
  item,
  moduleId,
  onDelete,
  readOnly = false,
}: ExamLessonEditorProps) {
  const params = useParams<{ slug?: string }>();
  const { data: course } = useCourseDetail(params.slug ?? '', Boolean(params.slug));
  const examId = item.content.assessment?.exam?.id ?? null;
  const { data: exam, isPending } = useExamDetail(examId ?? '', Boolean(examId));
  const isPublishedCourse = course?.status === CourseLifecycleStatus.PUBLISHED;

  const [title, setTitle] = useState(item.content.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [settings, setSettings] = useState(defaultQuizSettings());
  const [academicRules, setAcademicRules] = useState<AssessmentAcademicRulesFormValues>(
    defaultAssessmentAcademicRules(),
  );

  const updateExamMutation = useUpdateExam(examId ?? '', moduleId);
  const lastSavedRulesRef = useRef<AssessmentAcademicRulesFormValues | null>(null);
  const [rulesSaveStatus, setRulesSaveStatus] = useState<AcademicRulesSaveStatus>('idle');
  const [pendingRules, setPendingRules] = useState<AssessmentAcademicRulesFormValues | null>(
    null,
  );
  const [impactOpen, setImpactOpen] = useState(false);

  useEffect(() => {
    if (!exam) return;
    setTitle(exam.assessment.title);
    setDescription(exam.assessment.description ?? '');
    setTimeLimitMinutes(exam.timeLimitMinutes ? String(exam.timeLimitMinutes) : '');
    setAvailableFrom(toDatetimeLocalValue(exam.availableFrom));
    setAvailableTo(toDatetimeLocalValue(exam.availableTo));
    setIsVisible(exam.assessment.content.isPublished);
    setSettings(exam.assessment.settings ?? defaultQuizSettings());
    const nextRules = defaultAssessmentAcademicRules({
      required: exam.required ?? true,
      countsTowardCertificate: exam.countsTowardCertificate ?? false,
      blockProgressUntilPassed: exam.blockProgressUntilPassed ?? false,
      passingScore: exam.passingScore,
      maxAttempts: exam.maxAttempts,
    });
    setAcademicRules(nextRules);
    lastSavedRulesRef.current = nextRules;
    setRulesSaveStatus('idle');
  }, [exam]);

  const persistExamMeta = async () => {
    if (readOnly || !examId) return;
    const error = getContentTitleError(title);
    setTitleError(error);
    if (error) return;

    await updateExamMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
      availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null,
      availableTo: availableTo ? new Date(availableTo).toISOString() : null,
      isPublished: isVisible,
      settings,
      ...(lastSavedRulesRef.current ?? academicRules),
    });
  };

  const persistAcademicRules = async (nextRules: AssessmentAcademicRulesFormValues) => {
    if (readOnly || !examId) return;
    if (lastSavedRulesRef.current && academicRulesEqual(lastSavedRulesRef.current, nextRules)) {
      setRulesSaveStatus('saved');
      return;
    }

    setRulesSaveStatus('saving');
    try {
      await updateExamMutation.mutateAsync(nextRules);
      lastSavedRulesRef.current = nextRules;
      setAcademicRules(nextRules);
      setRulesSaveStatus('saved');
    } catch {
      if (lastSavedRulesRef.current) {
        setAcademicRules(lastSavedRulesRef.current);
      }
      setRulesSaveStatus('error');
    }
  };

  const requestAcademicRulesSave = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    if (readOnly) return;
    const nextRules = { ...academicRules, ...patch };
    if (lastSavedRulesRef.current && academicRulesEqual(lastSavedRulesRef.current, nextRules)) {
      setRulesSaveStatus('saved');
      return;
    }

    if (isPublishedCourse) {
      setPendingRules(nextRules);
      setImpactOpen(true);
      return;
    }

    void persistAcademicRules(nextRules);
  };

  if (!examId) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center">
        <p className="text-sm text-muted-foreground">Exam data is unavailable for this lesson.</p>
      </div>
    );
  }

  if (isPending && !exam) {
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
      titleError={titleError}
      onTitleChange={(value) => {
        if (readOnly) return;
        setTitle(value);
        setTitleError(getContentTitleError(value));
      }}
      onTitleBlur={readOnly ? undefined : persistExamMeta}
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={readOnly ? undefined : persistExamMeta}
      onDelete={readOnly ? undefined : onDelete}
      icon={<ClipboardList className="h-4.5 w-4.5 text-rose-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-foreground">Exam configuration</p>
            <AcademicRuleBadges
              required={academicRules.required}
              countsTowardCertificate={academicRules.countsTowardCertificate}
              blockProgressUntilPassed={academicRules.blockProgressUntilPassed}
            />
          </div>
          <AssessmentSettingsTabs
            settingsContent={
              <>
                <LessonSettingsGroup title="Visibility">
                  <ContentVisibilityToggle
                    visible={isVisible}
                    disabled={readOnly}
                    onChange={(visible) => {
                      if (readOnly) return;
                      setIsVisible(visible);
                      void updateExamMutation.mutateAsync({ isPublished: visible });
                    }}
                  />
                </LessonSettingsGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`exam-time-${item.contentId}`}>Time limit (minutes)</Label>
                    <Input
                      id={`exam-time-${item.contentId}`}
                      type="number"
                      min={1}
                      value={timeLimitMinutes}
                      onChange={(event) => setTimeLimitMinutes(event.target.value)}
                      onBlur={readOnly ? undefined : persistExamMeta}
                      disabled={readOnly}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`exam-from-${item.contentId}`}>Available from</Label>
                    <DateTimePicker
                      id={`exam-from-${item.contentId}`}
                      value={availableFrom}
                      onChange={setAvailableFrom}
                      onBlur={readOnly ? undefined : persistExamMeta}
                      disabled={readOnly}
                      placeholder="Start date & time"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`exam-to-${item.contentId}`}>Available to</Label>
                    <DateTimePicker
                      id={`exam-to-${item.contentId}`}
                      value={availableTo}
                      onChange={setAvailableTo}
                      onBlur={readOnly ? undefined : persistExamMeta}
                      disabled={readOnly}
                      placeholder="End date & time"
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
                      <Label htmlFor={`exam-${key}-${item.contentId}`}>{label}</Label>
                      <Switch
                        id={`exam-${key}-${item.contentId}`}
                        size="sm"
                        checked={settings[key]}
                        disabled={readOnly}
                        onCheckedChange={(checked) => {
                          if (readOnly) return;
                          const next = { ...settings, [key]: checked };
                          setSettings(next);
                          void updateExamMutation.mutateAsync({ settings: next });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            }
            academicRulesContent={
              <AssessmentAcademicRules
                idPrefix={`exam-${item.contentId}`}
                values={academicRules}
                readOnly={readOnly}
                disabled={updateExamMutation.isPending}
                saveStatus={rulesSaveStatus}
                onChange={(values) =>
                  setAcademicRules((current) => ({ ...current, ...values }))
                }
                onCommit={requestAcademicRulesSave}
              />
            }
          />
        </div>
      }
    >
      <ExamManagedQuestionBuilder examId={examId} moduleId={moduleId} readOnly={readOnly} />
      <AcademicRulesImpactDialog
        open={impactOpen}
        onOpenChange={(open) => {
          setImpactOpen(open);
          if (!open && pendingRules) {
            if (lastSavedRulesRef.current) {
              setAcademicRules(lastSavedRulesRef.current);
            }
            setPendingRules(null);
            setRulesSaveStatus('idle');
          }
        }}
        onConfirm={async () => {
          if (!pendingRules) return;
          await persistAcademicRules(pendingRules);
          setPendingRules(null);
        }}
        onCancel={() => {
          if (lastSavedRulesRef.current) {
            setAcademicRules(lastSavedRulesRef.current);
          }
          setPendingRules(null);
          setRulesSaveStatus('idle');
        }}
      />
    </BuilderLessonShell>
  );
}
