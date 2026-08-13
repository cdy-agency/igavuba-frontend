'use client';

import { useState } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonFormFooter,
  LessonSettingsGroup,
} from '@/components/course-builder/lesson-form-ui';
import {
  QuizQuestionBuilder,
  createInitialDraftQuestions,
  mapDraftQuestionsToPayload,
  validateDraftQuestions,
} from '@/components/quiz/quiz-question-builder';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { persistExamQuestions } from '@/api/exam.api';
import type { DraftQuestionValues } from '@/schema/question.schema';
import { quizInfoSchema, quizSettingsFormSchema } from '@/schema/quiz.schema';
import { useCreateExamContent } from '@/hooks/use-module-contents';
import { defaultQuizSettings } from '@/lib/quiz-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

interface ExamCreateFormProps {
  moduleId: string;
  onCreated: (contentId: string) => void;
  onCancel: () => void;
}

export function ExamCreateForm({ moduleId, onCreated, onCancel }: ExamCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [settings, setSettings] = useState(defaultQuizSettings());
  const [isVisible, setIsVisible] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestionValues[]>(createInitialDraftQuestions);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPersistingQuestions, setIsPersistingQuestions] = useState(false);

  const createExam = useCreateExamContent(moduleId);
  const isSubmitting = createExam.isPending || isPersistingQuestions;

  const validateForm = () => {
    const infoResult = quizInfoSchema.safeParse({ title, description });
    if (!infoResult.success) {
      return infoResult.error.issues[0]?.message ?? 'Invalid exam information';
    }

    const settingsResult = quizSettingsFormSchema.safeParse({
      passingScore,
      maxAttempts,
      timeLimitMinutes,
      settings,
    });
    if (!settingsResult.success) {
      return settingsResult.error.issues[0]?.message ?? 'Invalid exam settings';
    }

    const questionsResult = validateDraftQuestions(questions);
    if (!questionsResult.success) {
      return questionsResult.message;
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      toast.error(error);
      return;
    }

    setFormError(null);

    try {
      const response = await createExam.mutateAsync({
        title: title.trim() || 'Untitled Exam',
        description: description.trim() || undefined,
        passingScore,
        maxAttempts,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        availableTo: availableTo ? new Date(availableTo).toISOString() : undefined,
        settings,
        isPublished: isVisible,
      });

      const examRecord = response.data.content.assessment?.exam;
      if (!examRecord?.id) {
        throw new Error('Exam was created but the exam ID was not returned.');
      }

      setIsPersistingQuestions(true);
      await persistExamQuestions(examRecord.id, mapDraftQuestionsToPayload(questions));
      onCreated(response.data.contentId);
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Unable to create exam.'));
    } finally {
      setIsPersistingQuestions(false);
    }
  };

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Untitled Exam"
      description={description}
      onDescriptionChange={setDescription}
      onDelete={onCancel}
      icon={<ClipboardList className="h-4.5 w-4.5 text-rose-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-foreground">Exam settings</p>
          <LessonSettingsGroup>
            <ContentVisibilityToggle
              visible={isVisible}
              onChange={setIsVisible}
              disabled={isSubmitting}
            />
          </LessonSettingsGroup>
          <div className="grid gap-3 rounded-lg border border-border/60 bg-slate-50/40 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="exam-passing-score">Passing score (%)</Label>
              <Input
                id="exam-passing-score"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(event) => setPassingScore(Number(event.target.value) || 0)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exam-max-attempts">Max attempts</Label>
              <Input
                id="exam-max-attempts"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(Number(event.target.value) || 1)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="exam-time-limit">Time limit (minutes)</Label>
              <Input
                id="exam-time-limit"
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(event) => setTimeLimitMinutes(event.target.value)}
                placeholder="Optional"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exam-available-from">Available from</Label>
              <DateTimePicker
                id="exam-available-from"
                value={availableFrom}
                onChange={setAvailableFrom}
                disabled={isSubmitting}
                placeholder="Start date & time"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exam-available-to">Available to</Label>
              <DateTimePicker
                id="exam-available-to"
                value={availableTo}
                onChange={setAvailableTo}
                disabled={isSubmitting}
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
                className="flex items-center justify-between rounded-md border border-border/60 bg-white px-3 py-2"
              >
                <Label htmlFor={`exam-${key}`}>{label}</Label>
                <Switch
                  id={`exam-${key}`}
                  size="sm"
                  checked={settings[key]}
                  onCheckedChange={(checked) =>
                    setSettings((current) => ({ ...current, [key]: checked }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
        </div>
      }
      footer={
        <LessonFormFooter
          onCancel={onCancel}
          onSubmit={handleSubmit}
          submitLabel="Create Exam"
          isSubmitting={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Questions</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add auto-graded and essay questions before saving.
          </p>
        </div>
        <QuizQuestionBuilder questions={questions} onChange={setQuestions} allowEssayTypes />
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        {isSubmitting ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving exam...
          </div>
        ) : null}
      </div>
    </BuilderLessonShell>
  );
}
