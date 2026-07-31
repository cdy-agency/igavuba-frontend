'use client';

import { useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateQuizQuestion,
  useCreateQuizQuestionOption,
  useDeleteQuizQuestion,
  useDeleteQuizQuestionOption,
  useQuizDetail,
  useUpdateQuizQuestion,
  useUpdateQuizQuestionOption,
} from '@/hooks/use-quiz';
import { QuestionType, type Question } from '@/types/question';
import {
  createEmptyDraftQuestion,
  getDefaultOptionsForType,
  nextOptionLabel,
  questionTypeLabel,
} from '@/lib/quiz-utils';

interface QuizManagedQuestionBuilderProps {
  quizId: string;
  moduleId?: string | null;
}

function ManagedQuestionEditor({
  quizId,
  moduleId,
  question,
  onDeleted,
}: {
  quizId: string;
  moduleId?: string | null;
  question: Question;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(question.title);
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const [points, setPoints] = useState(question.points);
  const [type, setType] = useState(question.type);

  const updateQuestion = useUpdateQuizQuestion(quizId, moduleId ?? undefined);
  const deleteQuestion = useDeleteQuizQuestion(quizId, moduleId ?? undefined);
  const createOption = useCreateQuizQuestionOption(quizId, moduleId ?? undefined);
  const updateOption = useUpdateQuizQuestionOption(quizId, moduleId ?? undefined);
  const deleteOption = useDeleteQuizQuestionOption(quizId, moduleId ?? undefined);

  const syncOptionsForType = async (nextType: QuestionType) => {
    for (const option of question.options) {
      await deleteOption.mutateAsync(option.id);
    }

    const defaults = getDefaultOptionsForType(nextType);
    for (let index = 0; index < defaults.length; index += 1) {
      const option = defaults[index];
      await createOption.mutateAsync({
        questionId: question.id,
        payload: {
          text: option.text,
          isCorrect: option.isCorrect,
          order: index + 1,
        },
      });
    }
  };

  const handleSaveMeta = async () => {
    await updateQuestion.mutateAsync({
      questionId: question.id,
      payload: {
        title: title.trim(),
        explanation: explanation.trim() || undefined,
        points,
        type,
      },
    });
  };

  const handleTypeChange = async (nextType: QuestionType) => {
    if (nextType === type) return;
    setType(nextType);
    await updateQuestion.mutateAsync({
      questionId: question.id,
      payload: { type: nextType },
    });
    await syncOptionsForType(nextType);
  };

  const handleOptionCorrectChange = async (optionId: string, checked: boolean) => {
    if (type === QuestionType.SINGLE_CHOICE || type === QuestionType.TRUE_FALSE) {
      for (const option of question.options) {
        if (option.id === optionId) {
          await updateOption.mutateAsync({
            optionId: option.id,
            payload: { isCorrect: checked },
          });
        } else if (option.isCorrect) {
          await updateOption.mutateAsync({
            optionId: option.id,
            payload: { isCorrect: false },
          });
        }
      }
      return;
    }

    await updateOption.mutateAsync({
      optionId,
      payload: { isCorrect: checked },
    });
  };

  const isBusy =
    updateQuestion.isPending ||
    deleteQuestion.isPending ||
    createOption.isPending ||
    updateOption.isPending ||
    deleteOption.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{questionTypeLabel(type)}</p>
        <div className="flex gap-2">
          <Select value={type} onValueChange={(value) => handleTypeChange(value as QuestionType)}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
              <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
              <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isBusy}
            onClick={async () => {
              await deleteQuestion.mutateAsync(question.id);
              onDeleted();
            }}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question title</Label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} onBlur={handleSaveMeta} />
      </div>

      <div className="space-y-2">
        <Label>Explanation (optional)</Label>
        <Textarea
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          onBlur={handleSaveMeta}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Points</Label>
        <Input
          type="number"
          min={1}
          value={points}
          onChange={(event) => setPoints(Number(event.target.value) || 1)}
          onBlur={handleSaveMeta}
          className="w-28"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          {type !== QuestionType.TRUE_FALSE ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() =>
                createOption.mutate({
                  questionId: question.id,
                  payload: {
                    text: nextOptionLabel(question.options.length),
                    isCorrect: false,
                  },
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add option
            </Button>
          ) : null}
        </div>

        <div className="space-y-2">
          {question.options.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              No options yet. Use &quot;Add option&quot; to create answer choices.
            </div>
          ) : null}
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start gap-2 rounded-md border p-2">
              <Checkbox
                checked={option.isCorrect}
                disabled={isBusy}
                onCheckedChange={(checked) =>
                  handleOptionCorrectChange(option.id, checked === true)
                }
                className="mt-2"
              />
              <Input
                defaultValue={option.text}
                disabled={type === QuestionType.TRUE_FALSE || isBusy}
                onBlur={async (event) => {
                  const nextText = event.target.value.trim();
                  if (nextText && nextText !== option.text) {
                    await updateOption.mutateAsync({
                      optionId: option.id,
                      payload: { text: nextText },
                    });
                  }
                }}
                className="flex-1"
              />
              {type !== QuestionType.TRUE_FALSE && question.options.length > 2 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  disabled={isBusy}
                  onClick={() => deleteOption.mutate(option.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuizManagedQuestionBuilder({ quizId, moduleId }: QuizManagedQuestionBuilderProps) {
  const { data: quiz, isPending } = useQuizDetail(quizId);
  const createQuestion = useCreateQuizQuestion(quizId, moduleId ?? undefined);
  const createOption = useCreateQuizQuestionOption(quizId, moduleId ?? undefined);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const questions: Question[] = quiz?.questions ?? [];
  const activeQuestion = useMemo(
    () => questions.find((question: Question) => question.id === activeQuestionId) ?? questions[0] ?? null,
    [activeQuestionId, questions],
  );

  const handleAddQuestion = async (type: QuestionType) => {
    const draft = createEmptyDraftQuestion(type);
    const response = await createQuestion.mutateAsync({
      title: 'New question',
      type: draft.type,
      points: draft.points,
    });

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

    setActiveQuestionId(response.data.id);
  };

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Questions</p>
          <Select value="" onValueChange={(value) => handleAddQuestion(value as QuestionType)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Add question" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
              <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
              <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No questions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((question: Question, index: number) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setActiveQuestionId(question.id)}
                className={
                  activeQuestion?.id === question.id
                    ? 'w-full rounded-md border border-primary bg-primary/5 px-3 py-2 text-left'
                    : 'w-full rounded-md border border-border px-3 py-2 text-left hover:bg-muted/40'
                }
              >
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Question {index + 1}
                </span>
                <span className="block truncate text-sm font-medium">
                  {question.title.trim() || 'Untitled question'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        {activeQuestion ? (
          <ManagedQuestionEditor
            key={activeQuestion.id}
            quizId={quizId}
            moduleId={moduleId}
            question={activeQuestion}
            onDeleted={() => setActiveQuestionId(null)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Select a question to edit.</p>
        )}
      </div>
    </div>
  );
}
