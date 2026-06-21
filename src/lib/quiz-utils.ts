import { QuestionType } from '@/types/question';
import type { DraftQuestionOptionValues, DraftQuestionValues } from '@/schema/question.schema';

export function createClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getDefaultOptionsForType(type: QuestionType): DraftQuestionOptionValues[] {
  if (type === QuestionType.TRUE_FALSE) {
    return [
      { clientId: createClientId(), text: 'True', isCorrect: true },
      { clientId: createClientId(), text: 'False', isCorrect: false },
    ];
  }

  return [
    { clientId: createClientId(), text: 'Option 1', isCorrect: false },
    { clientId: createClientId(), text: 'Option 2', isCorrect: false },
  ];
}

export function createEmptyDraftQuestion(type: QuestionType): DraftQuestionValues {
  return {
    clientId: createClientId(),
    type,
    title: '',
    points: 1,
    options: getDefaultOptionsForType(type),
  };
}

export function applyQuestionTypeChange(
  current: DraftQuestionValues,
  nextType: QuestionType,
): DraftQuestionValues {
  return {
    ...current,
    type: nextType,
    options: getDefaultOptionsForType(nextType),
  };
}

export function createEmptyDraftOption(optionIndex: number): DraftQuestionOptionValues {
  return {
    clientId: createClientId(),
    text: `Option ${optionIndex}`,
    isCorrect: false,
  };
}

export function nextOptionLabel(optionCount: number): string {
  return `Option ${optionCount + 1}`;
}

export function questionTypeLabel(type: QuestionType): string {
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
      return 'Single Choice';
    case QuestionType.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case QuestionType.TRUE_FALSE:
      return 'True/False';
    default:
      return type;
  }
}

export function defaultQuizSettings() {
  return {
    showResults: true,
    showCorrectAnswers: true,
    shuffleQuestions: false,
    shuffleOptions: false,
  };
}
