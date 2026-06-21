'use client';

import { useMemo, useState } from 'react';
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
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
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
import type { DraftQuestionValues } from '@/schema/question.schema';
import { draftQuestionSchema } from '@/schema/question.schema';
import { QuestionType } from '@/types/question';
import {
  applyQuestionTypeChange,
  createEmptyDraftOption,
  createEmptyDraftQuestion,
  questionTypeLabel,
} from '@/lib/quiz-utils';
import { cn } from '@/lib/utils';

interface QuizQuestionBuilderProps {
  questions: DraftQuestionValues[];
  onChange: (questions: DraftQuestionValues[]) => void;
  className?: string;
}

function SortableQuestionItem({
  question,
  index,
  isActive,
  onSelect,
  onDelete,
}: {
  question: DraftQuestionValues;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.clientId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border px-2 py-2',
        isActive ? 'border-primary bg-primary/5' : 'border-border bg-background',
        isDragging && 'opacity-60',
      )}
    >
      <button
        type="button"
        className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}>
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Question {index + 1}
        </span>
        <span className="block truncate text-sm font-medium">
          {question.title.trim() || 'Untitled question'}
        </span>
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onSelect}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function QuizQuestionBuilder({ questions, onChange, className }: QuizQuestionBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(questions[0]?.clientId ?? null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeQuestion = useMemo(
    () => questions.find((question) => question.clientId === activeId) ?? null,
    [activeId, questions],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateQuestion = (clientId: string, updater: (current: DraftQuestionValues) => DraftQuestionValues) => {
    onChange(questions.map((question) => (question.clientId === clientId ? updater(question) : question)));
  };

  const handleAddQuestion = (type: QuestionType) => {
    const nextQuestion = createEmptyDraftQuestion(type);
    onChange([...questions, nextQuestion]);
    setActiveId(nextQuestion.clientId);
    setValidationError(null);
  };

  const handleDeleteQuestion = (clientId: string) => {
    const nextQuestions = questions.filter((question) => question.clientId !== clientId);
    onChange(nextQuestions);
    if (activeId === clientId) {
      setActiveId(nextQuestions[0]?.clientId ?? null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((question) => question.clientId === active.id);
    const newIndex = questions.findIndex((question) => question.clientId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(questions, oldIndex, newIndex));
  };

  const handleOptionCorrectChange = (
    question: DraftQuestionValues,
    optionClientId: string,
    checked: boolean,
  ) => {
    updateQuestion(question.clientId, (current) => ({
      ...current,
      options: current.options.map((option) => {
        if (option.clientId !== optionClientId) {
          if (current.type === QuestionType.SINGLE_CHOICE || current.type === QuestionType.TRUE_FALSE) {
            return { ...option, isCorrect: false };
          }
          return option;
        }
        return { ...option, isCorrect: checked };
      }),
    }));
  };

  const validateActiveQuestion = () => {
    if (!activeQuestion) return true;
    const result = draftQuestionSchema.safeParse(activeQuestion);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid question');
      return false;
    }
    setValidationError(null);
    return true;
  };

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Questions</p>
          <Select
            onValueChange={(value) => handleAddQuestion(value as QuestionType)}
            value=""
          >
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
            No questions yet. Add your first question.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={questions.map((question) => question.clientId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <SortableQuestionItem
                    key={question.clientId}
                    question={question}
                    index={index}
                    isActive={question.clientId === activeId}
                    onSelect={() => {
                      setValidationError(null);
                      setActiveId(question.clientId);
                    }}
                    onDelete={() => handleDeleteQuestion(question.clientId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        {!activeQuestion ? (
          <p className="text-sm text-muted-foreground">Select a question to edit.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{questionTypeLabel(activeQuestion.type)}</p>
              <Select
                value={activeQuestion.type}
                onValueChange={(value) => {
                  const nextType = value as QuestionType;
                  updateQuestion(activeQuestion.clientId, (current) =>
                    applyQuestionTypeChange(current, nextType),
                  );
                  setValidationError(null);
                }}
              >
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                  <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-title">Question title</Label>
              <Input
                id="question-title"
                value={activeQuestion.title}
                onChange={(event) =>
                  updateQuestion(activeQuestion.clientId, (current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Enter question title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-explanation">Explanation (optional)</Label>
              <Textarea
                id="question-explanation"
                value={activeQuestion.explanation ?? ''}
                onChange={(event) =>
                  updateQuestion(activeQuestion.clientId, (current) => ({
                    ...current,
                    explanation: event.target.value,
                  }))
                }
                placeholder="Explain the correct answer"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-points">Points</Label>
              <Input
                id="question-points"
                type="number"
                min={1}
                value={activeQuestion.points}
                onChange={(event) =>
                  updateQuestion(activeQuestion.clientId, (current) => ({
                    ...current,
                    points: Number(event.target.value) || 1,
                  }))
                }
                className="w-28"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                {activeQuestion.type !== QuestionType.TRUE_FALSE ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() =>
                      updateQuestion(activeQuestion.clientId, (current) => ({
                        ...current,
                        options: [
                          ...current.options,
                          createEmptyDraftOption(current.options.length + 1),
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add option
                  </Button>
                ) : null}
              </div>

              <div className="space-y-2">
                {activeQuestion.options.map((option) => (
                  <div key={option.clientId} className="flex items-start gap-2 rounded-md border p-2">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) =>
                        handleOptionCorrectChange(
                          activeQuestion,
                          option.clientId,
                          checked === true,
                        )
                      }
                      className="mt-2"
                    />
                    <Input
                      value={option.text}
                      disabled={activeQuestion.type === QuestionType.TRUE_FALSE}
                      onChange={(event) =>
                        updateQuestion(activeQuestion.clientId, (current) => ({
                          ...current,
                          options: current.options.map((currentOption) =>
                            currentOption.clientId === option.clientId
                              ? { ...currentOption, text: event.target.value }
                              : currentOption,
                          ),
                        }))
                      }
                      placeholder="Option text"
                      className="flex-1"
                    />
                    {activeQuestion.type !== QuestionType.TRUE_FALSE &&
                    activeQuestion.options.length > 2 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() =>
                          updateQuestion(activeQuestion.clientId, (current) => ({
                            ...current,
                            options: current.options.filter(
                              (currentOption) => currentOption.clientId !== option.clientId,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {validationError ? (
              <p className="text-sm text-destructive">{validationError}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function validateDraftQuestions(questions: DraftQuestionValues[]) {
  if (questions.length === 0) {
    return { success: false as const, message: 'Add at least one question' };
  }

  for (let index = 0; index < questions.length; index += 1) {
    const result = draftQuestionSchema.safeParse(questions[index]);
    if (!result.success) {
      return {
        success: false as const,
        message: `Question ${index + 1}: ${result.error.issues[0]?.message ?? 'Invalid question'}`,
      };
    }
  }

  return { success: true as const };
}

export function mapDraftQuestionsToPayload(questions: DraftQuestionValues[]) {
  return questions.map((question, index) => ({
    title: question.title.trim(),
    type: question.type,
    explanation: question.explanation?.trim() || undefined,
    points: question.points,
    order: index + 1,
    options: question.options.map((option, optionIndex) => ({
      text: option.text.trim(),
      isCorrect: option.isCorrect,
      order: optionIndex + 1,
    })),
  }));
}

export function createInitialDraftQuestions(): DraftQuestionValues[] {
  return [createEmptyDraftQuestion(QuestionType.SINGLE_CHOICE)];
}
