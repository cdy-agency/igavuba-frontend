import type { ExamAttemptStatus } from '@/types/exam.types';
import type { QuestionType } from '@/types/question';

export interface ExamLearnerQuestion {
  id: string;
  type: QuestionType | string;
  title: string;
  instructions?: string | null;
  points: number;
  order: number;
  options: Array<{ id: string; text: string; order: number }>;
}

export interface LearningExamContent {
  examId: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  instructions: string | null;
  settings: {
    showResults: boolean;
    showCorrectAnswers: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };
}

export interface ExamAttemptStartPayload {
  attemptId: string;
  examId: string;
  contentId: string;
  courseId: string;
  startedAt: string;
  attemptsUsed: number;
  maxAttempts: number;
  passingScore: number;
  timeLimitMinutes: number | null;
  settings: LearningExamContent['settings'];
  title: string;
  description: string | null;
  instructions: string | null;
  questions: ExamLearnerQuestion[];
}

export interface ExamAttemptSummary {
  id: string;
  status: ExamAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
  percentage: number | null;
  passed: boolean | null;
}

export interface ExamAttemptHistory {
  attempts: ExamAttemptSummary[];
  maxAttempts: number;
  attemptsRemaining: number;
  inProgressAttemptId: string | null;
}

export interface ExamSubmitPayload {
  attemptId: string;
  answers: Array<{
    questionId: string;
    selectedOptionIds?: string[];
    textAnswer?: string;
  }>;
}

export interface ExamSubmitResult {
  attemptId: string;
  examId: string;
  contentId: string;
  courseId: string;
  status: ExamAttemptStatus;
  message: string;
}

export interface ExamPublishedResult {
  attemptId: string;
  examId: string;
  status: ExamAttemptStatus;
  autoScore: number;
  manualScore: number;
  finalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string | null;
  publishedAt: string | null;
  showCorrectAnswers: boolean;
  message?: string;
  questions: Array<{
    id: string;
    title: string;
    type: string;
    points: number;
    earnedPoints: number;
    textAnswer?: string | null;
    feedback?: string | null;
    selectedOptionIds: string[];
    explanation?: string | null;
    options: Array<{ id: string; text: string; order: number; isCorrect?: boolean }>;
  }>;
}

export interface ExamAttemptMutationResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}
