import type { AssessmentSettings } from './quiz';
import type { QuestionType } from './question';

export interface LearnerQuizOption {
  id: string;
  text: string;
  order: number;
  isCorrect?: boolean;
  wasSelected?: boolean;
  selectionCorrect?: boolean;
}

export interface LearnerQuizQuestion {
  id: string;
  type: QuestionType;
  title: string;
  points: number;
  order: number;
  explanation?: string | null;
  options: LearnerQuizOption[];
  selectedOptionIds?: string[];
  isCorrect?: boolean;
  earnedPoints?: number;
  correctSelections?: number | null;
  totalCorrectOptions?: number | null;
}

export interface QuizAttemptSummary {
  id: string;
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string | null;
  inProgress: boolean;
}

export interface QuizAttemptHistory {
  quizId: string;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  bestScore: number | null;
  bestPercentage: number | null;
  bestPassed: boolean | null;
  attempts: QuizAttemptSummary[];
}

export interface QuizAttemptStartPayload {
  attemptId: string;
  quizId: string;
  contentId: string;
  courseId: string;
  startedAt: string;
  attemptsUsed: number;
  maxAttempts: number;
  passingScore: number;
  timeLimitMinutes: number | null;
  settings: AssessmentSettings;
  title: string;
  description: string | null;
  instructions: string | null;
  questions: LearnerQuizQuestion[];
}

export interface QuizSubmitAnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
}

export interface QuizSubmitPayload {
  attemptId: string;
  answers: QuizSubmitAnswerPayload[];
}

export interface QuizSubmitResult {
  attemptId: string;
  quizId: string;
  contentId: string;
  courseId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeLimitExceeded: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  markedComplete: boolean;
  usedBestScore: boolean;
  courseProgress?: number;
  showResults: boolean;
  showCorrectAnswers: boolean;
  message?: string;
  result?: {
    questions: LearnerQuizQuestion[];
  };
}

export interface QuizAttemptMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LearningQuizContent {
  quizId: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  instructions: string | null;
  settings: AssessmentSettings;
}
