'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Loader2, Plus, Trash2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonSettingsGroup,
} from '@/components/course-builder/lesson-form-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateExamQuestion,
  useCreateExamQuestionOption,
  useDeleteExamQuestion,
  useExamDetail,
  useUpdateExam,
  useUpdateExamQuestion,
} from '@/hooks/use-exam';
import type { ModuleContentItem } from '@/types/content';
import { QuestionType, type Question } from '@/types/question';
import {
  AssessmentAcademicRules,
  defaultAssessmentAcademicRules,
} from '@/components/academic/assessment-academic-rules';
import { AssessmentSettingsTabs } from '@/components/academic/assessment-settings-tabs';
import { AcademicRuleBadges } from '@/components/academic/academic-rule-badge';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';
import {
  createEmptyDraftQuestion,
  defaultQuizSettings,
  questionTypeLabel,
} from '@/lib/quiz-utils';

interface ExamLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
  readOnly?: boolean;
}

export function ExamLessonEditor({
  item,
  moduleId,
  onDelete,
  readOnly = false,
}: ExamLessonEditorProps) {
  const examId = item.content.assessment?.exam?.id ?? null;
  const { data: exam, isPending } = useExamDetail(examId ?? '', Boolean(examId));

  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [settings, setSettings] = useState(defaultQuizSettings());
  const [academicRules, setAcademicRules] = useState<AssessmentAcademicRulesFormValues>(
    defaultAssessmentAcademicRules(),
  );
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const updateExamMutation = useUpdateExam(examId ?? '', moduleId);
  const createQuestion = useCreateExamQuestion(examId ?? '', moduleId);
  const updateQuestion = useUpdateExamQuestion(examId ?? '', moduleId);
  const deleteQuestion = useDeleteExamQuestion(examId ?? '', moduleId);
  const createOption = useCreateExamQuestionOption(examId ?? '', moduleId);

  useEffect(() => {
    if (!exam) return;
    setTitle(exam.assessment.title);
    setDescription(exam.assessment.description ?? '');
    setTimeLimitMinutes(exam.timeLimitMinutes ? String(exam.timeLimitMinutes) : '');
    setAvailableFrom(
      exam.availableFrom ? new Date(exam.availableFrom).toISOString().slice(0, 16) : '',
    );
    setAvailableTo(exam.availableTo ? new Date(exam.availableTo).toISOString().slice(0, 16) : '');
    setIsVisible(exam.assessment.content.isPublished);
    setSettings(exam.assessment.settings ?? defaultQuizSettings());
    setAcademicRules(
      defaultAssessmentAcademicRules({
        required: exam.required ?? true,
        countsTowardCertificate: exam.countsTowardCertificate ?? true,
        blockProgressUntilPassed: exam.blockProgressUntilPassed ?? false,
        passingScore: exam.passingScore,
        maxAttempts: exam.maxAttempts,
      }),
    );
  }, [exam]);

  const questions: Question[] = exam?.questions ?? [];
  const activeQuestion = useMemo(
    () => questions.find((question) => question.id === activeQuestionId) ?? questions[0] ?? null,
    [activeQuestionId, questions],
  );

  const persistExamMeta = async () => {
    if (readOnly || !examId) return;
    await updateExamMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
      availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null,
      availableTo: availableTo ? new Date(availableTo).toISOString() : null,
      isPublished: isVisible,
      settings,
      ...academicRules,
    });
  };

  const persistAcademicRules = async (nextRules: AssessmentAcademicRulesFormValues) => {
    if (readOnly || !examId) return;
    await updateExamMutation.mutateAsync(nextRules);
  };

  const handleAddQuestion = async (type: QuestionType) => {
    if (readOnly) return;
    const draft = createEmptyDraftQuestion(type);
    const response = await createQuestion.mutateAsync({
      title: 'New question',
      type: draft.type,
      points: draft.points,
    });

    if (type !== QuestionType.ESSAY) {
      for (let index = 0; index < draft.options.length; index += 1) {
        const option = draft.options[index];
        await createOption.mutateAsync({
          questionId: response.data.id,
          payload: {
            text: option.text,
            isCorrect: option.isCorrect,
            order: index + 1,
          },
        });
      }
    }

    setActiveQuestionId(response.data.id);
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
      onTitleChange={setTitle}
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
                <LessonSettingsGroup>
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
                    <Input
                      id={`exam-from-${item.contentId}`}
                      type="datetime-local"
                      value={availableFrom}
                      onChange={(event) => setAvailableFrom(event.target.value)}
                      onBlur={readOnly ? undefined : persistExamMeta}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`exam-to-${item.contentId}`}>Available to</Label>
                    <Input
                      id={`exam-to-${item.contentId}`}
                      type="datetime-local"
                      value={availableTo}
                      onChange={(event) => setAvailableTo(event.target.value)}
                      onBlur={readOnly ? undefined : persistExamMeta}
                      disabled={readOnly}
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
                        checked={settings[key]}
                        disabled={readOnly}
                        onCheckedChange={(checked) => {
                          if (readOnly) return;
                          setSettings((current) => ({ ...current, [key]: checked }));
                          void updateExamMutation.mutateAsync({
                            settings: { ...settings, [key]: checked },
                          });
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
                onChange={(values) =>
                  setAcademicRules((current) => ({ ...current, ...values }))
                }
                onBlur={() => void persistAcademicRules(academicRules)}
              />
            }
          />
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Questions</p>
            {!readOnly ? (
            <Select onValueChange={(value) => void handleAddQuestion(value as QuestionType)} value="">
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Add" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                <SelectItem value={QuestionType.ESSAY}>Essay</SelectItem>
              </SelectContent>
            </Select>
            ) : null}
          </div>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setActiveQuestionId(question.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  activeQuestion?.id === question.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <span className="block text-[11px] uppercase text-muted-foreground">
                  Q{index + 1} · {questionTypeLabel(question.type)}
                </span>
                <span className="block truncate font-medium">{question.title}</span>
              </button>
            ))}
          </div>
        </div>

        {activeQuestion ? (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{questionTypeLabel(activeQuestion.type)}</p>
              {!readOnly ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await deleteQuestion.mutateAsync(activeQuestion.id);
                  setActiveQuestionId(null);
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                defaultValue={activeQuestion.title}
                readOnly={readOnly}
                onBlur={
                  readOnly
                    ? undefined
                    : (event) =>
                        updateQuestion.mutate({
                          questionId: activeQuestion.id,
                          payload: { title: event.target.value.trim() },
                        })
                }
              />
            </div>
            {activeQuestion.type === QuestionType.ESSAY ? (
              <div className="space-y-2">
                <Label>Instructions (optional)</Label>
                <Textarea
                  defaultValue={activeQuestion.instructions ?? ''}
                  readOnly={readOnly}
                  onBlur={
                    readOnly
                      ? undefined
                      : (event) =>
                          updateQuestion.mutate({
                            questionId: activeQuestion.id,
                            payload: { instructions: event.target.value.trim() || undefined },
                          })
                  }
                  rows={3}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                min={1}
                defaultValue={activeQuestion.points}
                className="w-28"
                readOnly={readOnly}
                onBlur={
                  readOnly
                    ? undefined
                    : (event) =>
                        updateQuestion.mutate({
                          questionId: activeQuestion.id,
                          payload: { points: Number(event.target.value) || 1 },
                        })
                }
              />
            </div>
            {activeQuestion.type !== QuestionType.ESSAY ? (
              <p className="text-xs text-muted-foreground">
                Edit options in the full question builder via Assessments → Exams if needed.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            {questions.length === 0 ? (
              !readOnly ? (
              <Button type="button" variant="outline" onClick={() => void handleAddQuestion(QuestionType.SINGLE_CHOICE)}>
                <Plus className="mr-1 h-4 w-4" />
                Add first question
              </Button>
              ) : (
                'No questions'
              )
            ) : (
              'Select a question'
            )}
          </div>
        )}
      </div>
    </BuilderLessonShell>
  );
}
