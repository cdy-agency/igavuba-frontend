export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  ESSAY = 'ESSAY',
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id: string;
  quizId?: string | null;
  examId?: string | null;
  type: QuestionType;
  title: string;
  instructions?: string | null;
  explanation: string | null;
  points: number;
  order: number;
  options: QuestionOption[];
}

export interface CreateQuestionPayload {
  title: string;
  type?: QuestionType;
  instructions?: string;
  explanation?: string;
  points?: number;
  order?: number;
}

export interface UpdateQuestionPayload {
  title?: string;
  type?: QuestionType;
  instructions?: string;
  explanation?: string;
  points?: number;
  order?: number;
}

export interface CreateQuestionOptionPayload {
  text: string;
  isCorrect?: boolean;
  order?: number;
}

export interface UpdateQuestionOptionPayload {
  text?: string;
  isCorrect?: boolean;
  order?: number;
}

export interface QuestionMutationResponse {
  success: boolean;
  message: string;
  data: Question;
}

export interface QuestionOptionMutationResponse {
  success: boolean;
  message: string;
  data: QuestionOption;
}

export interface QuestionDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export interface QuestionOptionDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}
