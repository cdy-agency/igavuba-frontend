'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  QuizQuestionBuilder,
  mapDraftQuestionsToPayload,
  validateDraftQuestions,
} from '@/components/quiz/quiz-question-builder';
import {
  QuizBuilderShell,
  QUIZ_UNLIMITED_ATTEMPTS,
  type QuizBuilderView,
} from '@/components/quiz/quiz-builder-shell';
import { useLocalDraft } from '@/hooks/use-autosave';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { persistQuizQuestions } from '@/api/quiz.api';
import type { DraftQuestionValues } from '@/schema/question.schema';
import { quizInfoSchema, quizSettingsFormSchema } from '@/schema/quiz.schema';
import { useCreateQuizContent } from '@/hooks/use-module-contents';
import { createEmptyDraftQuestion, defaultQuizSettings } from '@/lib/quiz-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { QuestionType } from '@/types/question';

interface QuizCreateFormProps {
  moduleId: string;
  onCreated: (contentId: string) => void;
  onCancel: () => void;
}

export function QuizCreateForm({ moduleId, onCreated, onCancel }: QuizCreateFormProps) {
  const draftStorageKey = `course-builder-quiz-create-${moduleId}`;
  const initialDraftState = useMemo(
    () => ({
      title: '',
      description: '',
      passingScore: 70,
      maxAttempts: 1,
      unlimitedAttempts: true,
      unlimitedTime: true,
      timeLimitMinutes: '',
      settings: defaultQuizSettings(),
      isVisible: true,
      questions: [] as DraftQuestionValues[],
    }),
    [],
  );
  const { draft, setDraft, clearDraft, hydrated } = useLocalDraft(
    draftStorageKey,
    initialDraftState,
  );

  const [view, setView] = useState<QuizBuilderView>('builder');
  const [title, setTitle] = useState(initialDraftState.title);
  const [description, setDescription] = useState(initialDraftState.description);
  const [passingScore, setPassingScore] = useState(initialDraftState.passingScore);
  const [maxAttempts, setMaxAttempts] = useState(initialDraftState.maxAttempts);
  const [unlimitedAttempts, setUnlimitedAttempts] = useState(
    initialDraftState.unlimitedAttempts,
  );
  const [unlimitedTime, setUnlimitedTime] = useState(initialDraftState.unlimitedTime);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialDraftState.timeLimitMinutes);
  const [settings, setSettings] = useState(initialDraftState.settings);
  const [isVisible, setIsVisible] = useState(initialDraftState.isVisible);
  const [questions, setQuestions] = useState<DraftQuestionValues[]>(initialDraftState.questions);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPersistingQuestions, setIsPersistingQuestions] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const createQuiz = useCreateQuizContent(moduleId);
  const isSubmitting = createQuiz.isPending || isPersistingQuestions;

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + (question.points || 0), 0),
    [questions],
  );

  useEffect(() => {
    if (!hydrated || draftReady) return;
    setTitle(draft.title);
    setDescription(draft.description);
    setPassingScore(draft.passingScore);
    setMaxAttempts(draft.maxAttempts);
    setUnlimitedAttempts(
      typeof draft.unlimitedAttempts === 'boolean'
        ? draft.unlimitedAttempts
        : typeof (draft as { limitAttempts?: boolean }).limitAttempts === 'boolean'
          ? !(draft as { limitAttempts?: boolean }).limitAttempts
          : true,
    );
    setUnlimitedTime(
      typeof draft.unlimitedTime === 'boolean'
        ? draft.unlimitedTime
        : !draft.timeLimitMinutes,
    );
    setTimeLimitMinutes(draft.timeLimitMinutes);
    setSettings(draft.settings);
    setIsVisible(draft.isVisible);
    setQuestions(draft.questions);
    setDraftReady(true);
  }, [hydrated, draft, draftReady]);

  useEffect(() => {
    if (!draftReady) return;

    setDraft({
      title,
      description,
      passingScore,
      maxAttempts,
      unlimitedAttempts,
      unlimitedTime,
      timeLimitMinutes,
      settings,
      isVisible,
      questions,
    });
  }, [
    draftReady,
    title,
    description,
    passingScore,
    maxAttempts,
    unlimitedAttempts,
    unlimitedTime,
    timeLimitMinutes,
    settings,
    isVisible,
    questions,
    setDraft,
  ]);

  const validateForm = () => {
    const infoResult = quizInfoSchema.safeParse({
      title: title.trim() || 'Untitled Quiz',
      description,
    });
    if (!infoResult.success) {
      return infoResult.error.issues[0]?.message ?? 'Invalid quiz information';
    }

    if (!unlimitedTime && !timeLimitMinutes) {
      return 'Enter a time limit in minutes, or turn on Unlimited';
    }

    if (!unlimitedAttempts && maxAttempts < 1) {
      return 'Max attempts must be at least 1';
    }

    const settingsResult = quizSettingsFormSchema.safeParse({
      passingScore,
      maxAttempts: unlimitedAttempts ? QUIZ_UNLIMITED_ATTEMPTS : maxAttempts,
      timeLimitMinutes: unlimitedTime ? undefined : timeLimitMinutes,
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
      if (error.toLowerCase().includes('question')) {
        setView('builder');
      } else {
        setView('settings');
      }
      return;
    }

    setFormError(null);

    try {
      const response = await createQuiz.mutateAsync({
        title: title.trim() || 'Untitled Quiz',
        description: description.trim() || undefined,
        passingScore,
        maxAttempts: unlimitedAttempts ? QUIZ_UNLIMITED_ATTEMPTS : maxAttempts,
        timeLimitMinutes:
          unlimitedTime || !timeLimitMinutes ? undefined : Number(timeLimitMinutes),
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
    <QuizBuilderShell
      view={view}
      onViewChange={setView}
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder="Untitled Quiz"
      timeLimitMinutes={timeLimitMinutes}
      onTimeLimitChange={setTimeLimitMinutes}
      unlimitedTime={unlimitedTime}
      onUnlimitedTimeChange={setUnlimitedTime}
      totalMarks={totalMarks}
      passingScore={passingScore}
      onPassingScoreChange={setPassingScore}
      maxAttempts={maxAttempts}
      onMaxAttemptsChange={setMaxAttempts}
      unlimitedAttempts={unlimitedAttempts}
      onUnlimitedAttemptsChange={setUnlimitedAttempts}
      isVisible={isVisible}
      onVisibilityToggle={() => setIsVisible((current) => !current)}
      onAddQuestion={() => {
        setView('builder');
        setQuestions((current) => [
          ...current,
          createEmptyDraftQuestion(QuestionType.SINGLE_CHOICE),
        ]);
      }}
      onSave={handleSubmit}
      onDelete={onCancel}
      isSaving={isSubmitting}
      builderContent={
        <div className="space-y-3">
          <QuizQuestionBuilder questions={questions} onChange={setQuestions} />
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving quiz...
            </div>
          ) : null}
        </div>
      }
      settingsContent={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quiz-description">Description</Label>
            <Input
              id="quiz-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description for learners"
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
              className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5"
            >
              <Label htmlFor={`quiz-${key}`}>{label}</Label>
              <Switch
                id={`quiz-${key}`}
                size="sm"
                checked={settings[key]}
                onCheckedChange={(checked) =>
                  setSettings((current) => ({ ...current, [key]: checked }))
                }
                disabled={isSubmitting}
              />
            </div>
          ))}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        </div>
      }
    />
  );
}
