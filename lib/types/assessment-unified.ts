/** Types for the unified assessment API (/api/assessments) */

export type UUID = string;

export type AssessmentType = 'QUIZ' | 'EXAM' | 'ASSIGNMENT';
export type QuestionType = 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'ESSAY' | 'TEXT';
export type SubmissionType = 'TEXT' | 'DOCUMENT' | 'BOTH';

export interface AssignmentSettings {
  submissionType: SubmissionType;
}

export interface QuestionOption {
  text: string;
  isCorrect?: boolean; // hidden from students until results published
}

export interface Assessment {
  _id: UUID;
  title: string;
  description?: string;
  type: AssessmentType;
  course: UUID;
  questions: UUID[];
  totalMarks: number;
  duration?: number;
  dueDate?: string;
  publishResults: boolean;
  assignmentSettings?: AssignmentSettings;
  createdBy: UUID;
  maxAttempts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentQuestion {
  _id: UUID;
  assessment: UUID;
  questionText: string;
  type: QuestionType;
  options?: QuestionOption[];
  marks: number;
  order: number;
}

export interface AssessmentAttempt {
  _id: UUID;
  assessment: UUID;
  student: UUID;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  questionOrder?: UUID[];
}

export interface AssessmentAnswerPayload {
  questionId?: UUID;
  selectedOptions?: string[];
  textAnswer?: string;
  fileUrl?: string;
}

export interface AssessmentSubmission {
  _id: UUID;
  attempt: UUID;
  answers: UUID[];
  autoScore: number;
  manualScore: number;
  totalScore: number;
  gradedBy?: UUID;
  isGraded: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StartAttemptResponse {
  attempt: AssessmentAttempt;
  expiresAt?: string;
}

export interface QuestionsForAttemptResponse {
  questions: AssessmentQuestion[];
  attemptId: UUID;
  expiresAt?: string;
}

export interface SubmitAssessmentResponse {
  message: string;
  submission: AssessmentSubmission;
  totalScore: number;
  autoScore: number;
  manualScore: number;
  publishResults: boolean;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}
export interface ApiError {
  ok: false;
  status: number;
  message: string;
  details?: unknown;
}
export type ApiResult<T> = ApiSuccess<T> | ApiError;
