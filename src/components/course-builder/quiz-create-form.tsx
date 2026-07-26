'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
import { useLocalDraft } from '@/hooks/use-autosave';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { persistQuizQuestions } from '@/api/quiz.api';
import type { DraftQuestionValues } from '@/schema/question.schema';
import { quizInfoSchema, quizSettingsFormSchema } from '@/schema/quiz.schema';
import { useCreateQuizContent } from '@/hooks/use-module-contents';
import { defaultQuizSettings } from '@/lib/quiz-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

interface QuizCreateFormProps {
  moduleId: string;
  onCreated: (contentId: string) => void;
  onCancel: () => void;
}

export function QuizCreateForm({ moduleId, onCreated, onCancel }: QuizCreateFormProps) {
  const draftStorageKey = `course-builder-quiz-create-${moduleId}`;
  const initialDraftState = {
    title: '',
    description: '',
    passingScore: 70,
    maxAttempts: 1,
    timeLimitMinutes: '',
    settings: defaultQuizSettings(),
    isVisible: true,
    questions: createInitialDraftQuestions(),
  };
  const { draft, setDraft, clearDraft, hydrated } = useLocalDraft(draftStorageKey, initialDraftState);

  const [title, setTitle] = useState(initialDraftState.title);
  const [description, setDescription] = useState(initialDraftState.description);
  const [passingScore, setPassingScore] = useState(initialDraftState.passingScore);
  const [maxAttempts, setMaxAttempts] = useState(initialDraftState.maxAttempts);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialDraftState.timeLimitMinutes);
  const [settings, setSettings] = useState(initialDraftState.settings);
  const [isVisible, setIsVisible] = useState(initialDraftState.isVisible);
  const [questions, setQuestions] = useState<DraftQuestionValues[]>(initialDraftState.questions);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPersistingQuestions, setIsPersistingQuestions] = useState(false);

  const createQuiz = useCreateQuizContent(moduleId);
  const isSubmitting = createQuiz.isPending || isPersistingQuestions;

  useEffect(() => {
    if (!hydrated) return;
    setTitle(draft.title);
    setDescription(draft.description);
    setPassingScore(draft.passingScore);
    setMaxAttempts(draft.maxAttempts);
    setTimeLimitMinutes(draft.timeLimitMinutes);
    setSettings(draft.settings);
    setIsVisible(draft.isVisible);
    setQuestions(draft.questions);
  }, [hydrated, draft]);

  useEffect(() => {
    if (!hydrated) return;

    setDraft({
      title,
      description,
      passingScore,
      maxAttempts,
      timeLimitMinutes,
      settings,
      isVisible,
      questions,
    });
  }, [hydrated, title, description, passingScore, maxAttempts, timeLimitMinutes, settings, isVisible, questions, setDraft]);

  const validateForm = () => {
    const infoResult = quizInfoSchema.safeParse({ title, description });
    if (!infoResult.success) {
      return infoResult.error.issues[0]?.message ?? 'Invalid quiz information';
    }

    const settingsResult = quizSettingsFormSchema.safeParse({
      passingScore,
      maxAttempts,
      timeLimitMinutes,
      settings,
    });
    if (!settingsResult.success) {
      return settingsResult.error.issues[0]?.message ?? 'Invalid quiz settings';
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
      const response = await createQuiz.mutateAsync({
        title: title.trim() || 'Untitled Quiz',
        description: description.trim() || undefined,
        passingScore,
        maxAttempts,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
        settings,
        isPublished: isVisible,
      });

      const quizRecord = response.data.content.assessment?.quiz;
      if (!quizRecord?.id) {
        throw new Error('Quiz was created but the quiz ID was not returned.');
      }

      setIsPersistingQuestions(true);
      await persistQuizQuestions(quizRecord.id, mapDraftQuestionsToPayload(questions));
      clearDraft();
      onCreated(response.data.contentId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create quiz.'));
    } finally {
      setIsPersistingQuestions(false);
    }
  };

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Untitled Quiz"
      description={description}
      onDescriptionChange={setDescription}
      onDelete={onCancel}
      icon={<CheckCircle2 className="h-4.5 w-4.5 text-orange-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-foreground">Quiz settings</p>
          <LessonSettingsGroup>
            <ContentVisibilityToggle
              visible={isVisible}
              onChange={setIsVisible}
              disabled={isSubmitting}
            />
          </LessonSettingsGroup>
          <div className="grid gap-3 rounded-lg border border-border/60 bg-slate-50/40 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quiz-passing-score">Passing score (%)</Label>
              <Input
                id="quiz-passing-score"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(event) => setPassingScore(Number(event.target.value) || 0)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quiz-max-attempts">Max attempts</Label>
              <Input
                id="quiz-max-attempts"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(Number(event.target.value) || 1)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="quiz-time-limit">Time limit (minutes)</Label>
              <Input
                id="quiz-time-limit"
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(event) => setTimeLimitMinutes(event.target.value)}
                placeholder="Optional"
                disabled={isSubmitting}
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
                <Label htmlFor={`quiz-${key}`}>{label}</Label>
                <Switch
                  id={`quiz-${key}`}
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
          submitLabel="Create Quiz"
          isSubmitting={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Questions</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add and configure all questions before saving. Your progress stays on this page until
            you create the quiz.
          </p>
        </div>
        <QuizQuestionBuilder questions={questions} onChange={setQuestions} />
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        {isSubmitting ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving quiz...
          </div>
        ) : null}
      </div>
    </BuilderLessonShell>
  );
}
