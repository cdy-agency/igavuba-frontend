'use client';

import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  Copy,
  GripVertical,
  Loader2,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
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
  useReorderQuizQuestions,
  useUpdateQuizQuestion,
  useUpdateQuizQuestionOption,
} from '@/hooks/use-quiz';
import { QuestionType, type Question } from '@/types/question';
import {
  createEmptyDraftQuestion,
  getDefaultOptionsForType,
  nextOptionLabel,
} from '@/lib/quiz-utils';
import { cn } from '@/lib/utils';

interface QuizManagedQuestionBuilderProps {
  quizId: string;
  moduleId?: string | null;
  addQuestionRef?: MutableRefObject<(() => void) | null>;
}

function displayTitle(value: string) {
  if (value === 'Untitled question' || value === 'New question') return '';
  return value;
}

function ManagedQuestionCard({
  quizId,
  moduleId,
  question,
  index,
  onDeleted,
}: {
  quizId: string;
  moduleId?: string | null;
  question: Question;
  index: number;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(displayTitle(question.title));
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const [points, setPoints] = useState(question.points);
  const [type, setType] = useState(question.type);
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(question.explanation));

  const updateQuestion = useUpdateQuizQuestion(quizId, moduleId ?? undefined);
  const deleteQuestion = useDeleteQuizQuestion(quizId, moduleId ?? undefined);
  const createQuestion = useCreateQuizQuestion(quizId, moduleId ?? undefined);
  const createOption = useCreateQuizQuestionOption(quizId, moduleId ?? undefined);
  const updateOption = useUpdateQuizQuestionOption(quizId, moduleId ?? undefined);
  const deleteOption = useDeleteQuizQuestionOption(quizId, moduleId ?? undefined);

  const syncOptionsForType = async (nextType: QuestionType) => {
    for (const option of question.options) {
      await deleteOption.mutateAsync(option.id);
    }

    const defaults = getDefaultOptionsForType(nextType);
    for (let optionIndex = 0; optionIndex < defaults.length; optionIndex += 1) {
      const option = defaults[optionIndex];
      await createOption.mutateAsync({
        questionId: question.id,
        payload: {
          text: option.text,
          isCorrect: option.isCorrect,
          order: optionIndex + 1,
        },
      });
    }
  };

  const handleSaveMeta = async () => {
    await updateQuestion.mutateAsync({
      questionId: question.id,
      payload: {
        title: title.trim() || 'Untitled question',
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

  const handleDuplicate = async () => {
    const response = await createQuestion.mutateAsync({
      title: title.trim() || 'Untitled question',
      type,
      points,
      explanation: explanation.trim() || undefined,
    });

    for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
      const option = question.options[optionIndex];
      await createOption.mutateAsync({
        questionId: response.data.id,
        payload: {
          text: option.text,
          isCorrect: option.isCorrect,
          order: optionIndex + 1,
        },
      });
    }
  };

  const isBusy =
    updateQuestion.isPending ||
    deleteQuestion.isPending ||
    createQuestion.isPending ||
    createOption.isPending ||
    updateOption.isPending ||
    deleteOption.isPending;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border border-border/80 bg-white',
        isDragging && 'z-10 opacity-60 shadow-md',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-3 py-2.5">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-600">
          Q{index + 1}
        </span>

        <Select
          value={type}
          onValueChange={(value) => void handleTypeChange(value as QuestionType)}
          disabled={isBusy}
        >
          <SelectTrigger className="h-8 w-[150px] border-border/70 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
            <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
            <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1}
            value={points}
            disabled={isBusy}
            onChange={(event) => setPoints(Number(event.target.value) || 1)}
            onBlur={() => void handleSaveMeta()}
            className="h-8 w-14 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <span className="text-xs text-muted-foreground">Marks</span>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            disabled={isBusy}
            onClick={() => void handleDuplicate()}
            aria-label="Duplicate question"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            disabled={isBusy}
            onClick={async () => {
              await deleteQuestion.mutateAsync(question.id);
              onDeleted();
            }}
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <Input
          value={title}
          disabled={isBusy}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => void handleSaveMeta()}
          placeholder="Click to enter your question..."
          className="h-auto rounded-none border-0 border-b border-transparent bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <div className="space-y-2">
          {question.options.map((option) => {
            const isSingle =
              type === QuestionType.SINGLE_CHOICE || type === QuestionType.TRUE_FALSE;

            return (
              <div
                key={option.id}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5',
                  option.isCorrect && 'bg-slate-50',
                )}
              >
                {isSingle ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      option.isCorrect
                        ? 'border-primary bg-primary'
                        : 'border-slate-300 bg-white',
                    )}
                    onClick={() => void handleOptionCorrectChange(option.id, true)}
                    aria-label="Mark as correct"
                  >
                    {option.isCorrect ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </button>
                ) : (
                  <Checkbox
                    checked={option.isCorrect}
                    disabled={isBusy}
                    onCheckedChange={(checked) =>
                      void handleOptionCorrectChange(option.id, checked === true)
                    }
                  />
                )}
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
                  className="h-9 flex-1 rounded-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            );
          })}

          {type !== QuestionType.TRUE_FALSE ? (
            <button
              type="button"
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-[13px] font-medium text-primary hover:underline disabled:opacity-50"
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
              <Plus className="h-3.5 w-3.5" />
              Add option
            </button>
          ) : null}
        </div>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Advanced Settings
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  advancedOpen && 'rotate-180',
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <Textarea
              value={explanation}
              disabled={isBusy}
              onChange={(event) => setExplanation(event.target.value)}
              onBlur={() => void handleSaveMeta()}
              placeholder="Explain the correct answer (optional)"
              rows={3}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

export function QuizManagedQuestionBuilder({
  quizId,
  moduleId,
  addQuestionRef,
}: QuizManagedQuestionBuilderProps) {
  const { data: quiz, isPending } = useQuizDetail(quizId);
  const createQuestion = useCreateQuizQuestion(quizId, moduleId ?? undefined);
  const createOption = useCreateQuizQuestionOption(quizId, moduleId ?? undefined);
  const reorderQuestions = useReorderQuizQuestions(quizId, moduleId ?? undefined);

  const serverQuestions = useMemo(() => {
    const list = quiz?.questions ?? [];
    return [...list].sort((a, b) => a.order - b.order);
  }, [quiz?.questions]);

  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>(serverQuestions);

  useEffect(() => {
    setOrderedQuestions(serverQuestions);
  }, [serverQuestions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAddQuestion = useCallback(
    async (type: QuestionType = QuestionType.SINGLE_CHOICE) => {
      const draft = createEmptyDraftQuestion(type);
      const response = await createQuestion.mutateAsync({
        title: 'Untitled question',
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
    },
    [createOption, createQuestion],
  );

  useEffect(() => {
    if (!addQuestionRef) return;
    addQuestionRef.current = () => {
      void handleAddQuestion();
    };
    return () => {
      addQuestionRef.current = null;
    };
  }, [addQuestionRef, handleAddQuestion]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedQuestions.findIndex((question) => question.id === active.id);
    const newIndex = orderedQuestions.findIndex((question) => question.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextQuestions = arrayMove(orderedQuestions, oldIndex, newIndex);
    setOrderedQuestions(nextQuestions);
    void reorderQuestions.mutateAsync(nextQuestions.map((question) => question.id));
  };

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (orderedQuestions.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5">
        <p className="max-w-sm text-center text-[14px] text-muted-foreground">
          No questions added yet. Start by adding your first question.
        </p>
        <Button
          type="button"
          className="h-10 gap-1.5 px-5"
          disabled={createQuestion.isPending || createOption.isPending}
          onClick={() => void handleAddQuestion()}
        >
          {createQuestion.isPending || createOption.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Your First Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={orderedQuestions.map((question) => question.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {orderedQuestions.map((question, index) => (
              <ManagedQuestionCard
                key={question.id}
                quizId={quizId}
                moduleId={moduleId}
                question={question}
                index={index}
                onDeleted={() => undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-center pt-1">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-1.5 border-border/80 bg-white px-5 text-[13px] text-foreground hover:bg-muted/40"
          disabled={
            createQuestion.isPending ||
            createOption.isPending ||
            reorderQuestions.isPending
          }
          onClick={() => void handleAddQuestion()}
        >
          {createQuestion.isPending || createOption.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Another Question
        </Button>
      </div>
    </div>
  );
}
