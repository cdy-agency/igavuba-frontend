'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonSettingsGroup,
} from '@/components/course-builder/lesson-form-ui';
import { QuizManagedQuestionBuilder } from '@/components/quiz/quiz-managed-question-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateQuiz, useQuizDetail } from '@/hooks/use-quiz';
import type { ModuleContentItem } from '@/types/content';
import { defaultQuizSettings } from '@/lib/quiz-utils';

interface QuizLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
}

export function QuizLessonEditor({ item, moduleId, onDelete }: QuizLessonEditorProps) {
  const quizId = item.content.assessment?.quiz?.id ?? null;
  const { data: quiz, isPending } = useQuizDetail(quizId ?? '', Boolean(quizId));

  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [settings, setSettings] = useState(defaultQuizSettings());

  const updateQuizMutation = useUpdateQuiz(quizId ?? '');

  useEffect(() => {
    if (!quiz) return;
    setTitle(quiz.assessment.title);
    setDescription(quiz.assessment.description ?? '');
    setPassingScore(quiz.passingScore);
    setMaxAttempts(quiz.maxAttempts);
    setTimeLimitMinutes(quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : '');
    setIsVisible(quiz.assessment.content.isPublished);
    setSettings(quiz.assessment.settings ?? defaultQuizSettings());
  }, [quiz]);

  const persistQuizMeta = async () => {
    if (!quizId) return;
    await updateQuizMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      passingScore,
      maxAttempts,
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
      isPublished: isVisible,
      settings,
    });
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
      title={title}
      onTitleChange={setTitle}
      onTitleBlur={persistQuizMeta}
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={persistQuizMeta}
      onDelete={onDelete}
      icon={<CheckCircle2 className="h-4.5 w-4.5 text-orange-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-foreground">Quiz settings</p>
          <LessonSettingsGroup>
            <ContentVisibilityToggle
              visible={isVisible}
              onChange={(visible) => {
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
                value={passingScore}
                onChange={(event) => setPassingScore(Number(event.target.value) || 0)}
                onBlur={persistQuizMeta}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`attempts-${item.contentId}`}>Max attempts</Label>
              <Input
                id={`attempts-${item.contentId}`}
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(Number(event.target.value) || 1)}
                onBlur={persistQuizMeta}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`time-${item.contentId}`}>Time limit (minutes)</Label>
              <Input
                id={`time-${item.contentId}`}
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(event) => setTimeLimitMinutes(event.target.value)}
                onBlur={persistQuizMeta}
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
              <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label htmlFor={`${key}-${item.contentId}`}>{label}</Label>
                <Switch
                  id={`${key}-${item.contentId}`}
                  checked={settings[key]}
                  onCheckedChange={(checked) => {
                    setSettings((current) => ({ ...current, [key]: checked }));
                    void updateQuizMutation.mutateAsync({
                      settings: { ...settings, [key]: checked },
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <QuizManagedQuestionBuilder quizId={quizId} moduleId={moduleId} />
    </BuilderLessonShell>
  );
}
