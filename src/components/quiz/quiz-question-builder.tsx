'use client';

import { useState } from 'react';
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
import type { DraftQuestionValues } from '@/schema/question.schema';
import { draftQuestionSchema } from '@/schema/question.schema';
import { QuestionType } from '@/types/question';
import {
  applyQuestionTypeChange,
  createEmptyDraftOption,
  createEmptyDraftQuestion,
  createClientId,
} from '@/lib/quiz-utils';
import { cn } from '@/lib/utils';

interface QuizQuestionBuilderProps {
  questions: DraftQuestionValues[];
  onChange: (questions: DraftQuestionValues[]) => void;
  className?: string;
  allowEssayTypes?: boolean;
}

function SortableQuestionCard({
  question,
  index,
  allowEssayTypes,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  question: DraftQuestionValues;
  index: number;
  allowEssayTypes: boolean;
  onUpdate: (next: DraftQuestionValues) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(question.explanation));
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.clientId,
  });

  const handleOptionCorrectChange = (optionClientId: string, checked: boolean) => {
    onUpdate({
      ...question,
      options: question.options.map((option) => {
        if (option.clientId !== optionClientId) {
          if (
            question.type === QuestionType.SINGLE_CHOICE ||
            question.type === QuestionType.TRUE_FALSE
          ) {
            return { ...option, isCorrect: false };
          }
          return option;
        }
        return { ...option, isCorrect: checked };
      }),
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border border-border/80 bg-white',
        isDragging && 'opacity-60 shadow-md',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-3 py-2.5">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-600">
          Q{index + 1}
        </span>

        <Select
          value={question.type}
          onValueChange={(value) =>
            onUpdate(applyQuestionTypeChange(question, value as QuestionType))
          }
        >
          <SelectTrigger className="h-8 w-[150px] border-border/70 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
            <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
            <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
            {allowEssayTypes ? (
              <SelectItem value={QuestionType.ESSAY}>Essay</SelectItem>
            ) : null}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1}
            value={question.points}
            onChange={(event) =>
              onUpdate({ ...question, points: Number(event.target.value) || 1 })
            }
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
            onClick={onDuplicate}
            aria-label="Duplicate question"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <Input
          value={question.title}
          onChange={(event) => onUpdate({ ...question, title: event.target.value })}
          placeholder="Click to enter your question..."
          className="h-auto rounded-none border-0 border-b border-transparent bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {question.type === QuestionType.ESSAY ? (
          <Textarea
            value={question.instructions ?? ''}
            onChange={(event) =>
              onUpdate({ ...question, instructions: event.target.value })
            }
            placeholder="Guidance for the essay response (optional)"
            rows={3}
          />
        ) : (
          <div className="space-y-2">
            {question.options.map((option) => {
              const isSingle =
                question.type === QuestionType.SINGLE_CHOICE ||
                question.type === QuestionType.TRUE_FALSE;

              return (
                <div
                  key={option.clientId}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5',
                    option.isCorrect && 'bg-slate-50',
                  )}
                >
                  {isSingle ? (
                    <button
                      type="button"
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                        option.isCorrect
                          ? 'border-primary bg-primary'
                          : 'border-slate-300 bg-white',
                      )}
                      onClick={() => handleOptionCorrectChange(option.clientId, true)}
                      aria-label="Mark as correct"
                    >
                      {option.isCorrect ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </button>
                  ) : (
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) =>
                        handleOptionCorrectChange(option.clientId, checked === true)
                      }
                    />
                  )}
                  <Input
                    value={option.text}
                    disabled={question.type === QuestionType.TRUE_FALSE}
                    onChange={(event) =>
                      onUpdate({
                        ...question,
                        options: question.options.map((currentOption) =>
                          currentOption.clientId === option.clientId
                            ? { ...currentOption, text: event.target.value }
                            : currentOption,
                        ),
                      })
                    }
                    placeholder="Option text"
                    className="h-9 flex-1 rounded-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {question.type !== QuestionType.TRUE_FALSE &&
                  question.options.length > 2 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() =>
                        onUpdate({
                          ...question,
                          options: question.options.filter(
                            (currentOption) => currentOption.clientId !== option.clientId,
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              );
            })}

            {question.type !== QuestionType.TRUE_FALSE ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[13px] font-medium text-primary hover:underline"
                onClick={() =>
                  onUpdate({
                    ...question,
                    options: [
                      ...question.options,
                      createEmptyDraftOption(question.options.length + 1),
                    ],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add option
              </button>
            ) : null}
          </div>
        )}

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
              value={question.explanation ?? ''}
              onChange={(event) =>
                onUpdate({ ...question, explanation: event.target.value })
              }
              placeholder="Explain the correct answer (optional)"
              rows={3}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

export function QuizQuestionBuilder({
  questions,
  onChange,
  className,
  allowEssayTypes = false,
}: QuizQuestionBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAddQuestion = (type: QuestionType = QuestionType.SINGLE_CHOICE) => {
    onChange([...questions, createEmptyDraftQuestion(type)]);
  };

  const handleDeleteQuestion = (clientId: string) => {
    onChange(questions.filter((question) => question.clientId !== clientId));
  };

  const handleDuplicateQuestion = (clientId: string) => {
    const source = questions.find((question) => question.clientId === clientId);
    if (!source) return;

    const duplicate: DraftQuestionValues = {
      ...source,
      clientId: createClientId(),
      id: undefined,
      options: source.options.map((option) => ({
        ...option,
        clientId: createClientId(),
        id: undefined,
      })),
    };

    const index = questions.findIndex((question) => question.clientId === clientId);
    const next = [...questions];
    next.splice(index + 1, 0, duplicate);
    onChange(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((question) => question.clientId === active.id);
    const newIndex = questions.findIndex((question) => question.clientId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(questions, oldIndex, newIndex));
  };

  if (questions.length === 0) {
    return (
      <div className={cn('flex min-h-[280px] flex-col items-center justify-center gap-5', className)}>
        <p className="max-w-sm text-center text-[14px] text-muted-foreground">
          No questions added yet. Start by adding your first question.
        </p>
        <Button type="button" className="h-10 gap-1.5 px-5" onClick={() => handleAddQuestion()}>
          <Plus className="h-4 w-4" />
          Add Your First Question
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map((question) => question.clientId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((question, index) => (
              <SortableQuestionCard
                key={question.clientId}
                question={question}
                index={index}
                allowEssayTypes={allowEssayTypes}
                onUpdate={(next) =>
                  onChange(
                    questions.map((current) =>
                      current.clientId === next.clientId ? next : current,
                    ),
                  )
                }
                onDelete={() => handleDeleteQuestion(question.clientId)}
                onDuplicate={() => handleDuplicateQuestion(question.clientId)}
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
          onClick={() => handleAddQuestion()}
        >
          <Plus className="h-4 w-4" />
          Add Another Question
        </Button>
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
    instructions: question.instructions?.trim() || undefined,
    explanation: question.explanation?.trim() || undefined,
    points: question.points,
    order: index + 1,
    options:
      question.type === QuestionType.ESSAY
        ? []
        : question.options.map((option, optionIndex) => ({
            text: option.text.trim(),
            isCorrect: option.isCorrect,
            order: optionIndex + 1,
          })),
  }));
}

export function createInitialDraftQuestions(): DraftQuestionValues[] {
  return [];
}
