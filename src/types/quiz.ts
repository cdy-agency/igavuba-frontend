import type { Question } from './question';

export interface AssessmentSettings {
  showResults: boolean;
  showCorrectAnswers: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface QuizAssessmentContent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  institutionId: string | null;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAssessment {
  id: string;
  contentId: string;
  type: string;
  title: string;
  description: string | null;
  instructions: string | null;
  settings: AssessmentSettings;
  createdAt: string;
  updatedAt: string;
  content: QuizAssessmentContent;
}

export interface QuizSummary {
  id: string;
  assessmentId: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  required?: boolean;
  countsTowardCertificate?: boolean;
  blockProgressUntilPassed?: boolean;
}

export interface Quiz extends QuizSummary {
  assessment: QuizAssessment;
  questions: Question[];
}

export interface QuizContentAssessment {
  id: string;
  contentId: string;
  type: string;
  title: string;
  description: string | null;
  instructions: string | null;
  settings: AssessmentSettings;
  quiz: QuizSummary & { questions?: Question[] };
}

export interface CreateQuizPayload {
  title: string;
  description?: string;
  instructions?: string;
  settings?: Partial<AssessmentSettings>;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  isPublished?: boolean;
  institutionId?: string;
}

export interface CreateQuizContentPayload {
  title: string;
  description?: string;
  instructions?: string;
  settings?: Partial<AssessmentSettings>;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  isPublished?: boolean;
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string;
  instructions?: string;
  settings?: Partial<AssessmentSettings>;
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  isPublished?: boolean;
  required?: boolean;
  countsTowardCertificate?: boolean;
  blockProgressUntilPassed?: boolean;
}

export interface QuizMutationResponse {
  success: boolean;
  message: string;
  data: Quiz;
}

export interface QuizDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export interface QuizListItem {
  quizId: string;
  contentId: string;
  title: string;
  moduleId: string | null;
  moduleTitle: string | null;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  questionsCount: number;
  passingScore: number;
  maxAttempts: number;
  createdAt: string;
}
