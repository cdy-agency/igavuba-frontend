import type { QuizContentAssessment } from './quiz';
import type { AssignmentSummary } from './assignment.types';

export enum ContentType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  EXAM = 'EXAM',
}

export interface TextContentDetail {
  id: string;
  contentId: string;
  body: string;
}

export interface VideoContentDetail {
  id: string;
  contentId: string;
  videoUrl: string;
  durationSeconds: number | null;
  allowDownload: boolean;
}

export interface DocumentContentDetail {
  id: string;
  contentId: string;
  fileUrl: string;
  allowDownload: boolean;
}

export interface ModuleContentAssessment {
  id: string;
  contentId: string;
  type: string;
  title: string;
  description: string | null;
  instructions: string | null;
  settings?: QuizContentAssessment['settings'];
  quiz?: QuizContentAssessment['quiz'];
  assignment?: AssignmentSummary;
  exam?: {
    id: string;
    passingScore: number;
    maxAttempts: number;
    timeLimitMinutes: number | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    questions?: Array<{ id: string }>;
  };
}

export interface ContentRecord {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  institutionId: string | null;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  clonedFromContentId?: string | null;
  textContent: TextContentDetail | null;
  videoContent: VideoContentDetail | null;
  documentContent: DocumentContentDetail | null;
  assessment: ModuleContentAssessment | null;
}

export interface ModuleContentItem {
  id: string;
  moduleId: string;
  contentId: string;
  order: number;
  isOptional: boolean;
  requiredForCompletion: boolean;
  unlockDate: string | null;
  createdAt: string;
  content: ContentRecord;
  /** Set while this lesson is staged for removal in an active draft revision. */
  deletedAt?: string | null;
  /** Only present while editing a draft revision of a published course. */
  changeStatus?: 'ADDED' | 'DELETED' | 'CHANGED' | null;
}

export interface CreateTextContentPayload {
  title: string;
  description?: string;
  body: string;
  isPublished?: boolean;
}

export interface CreateVideoContentPayload {
  title: string;
  description?: string;
  videoUrl: string;
  durationSeconds?: number;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface CreateDocumentContentPayload {
  title: string;
  description?: string;
  fileUrl: string;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface CreateQuizContentPayload {
  title: string;
  description?: string;
  instructions?: string;
  settings?: {
    showResults?: boolean;
    showCorrectAnswers?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
  };
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  isPublished?: boolean;
}

export interface CreateExamContentPayload {
  title: string;
  description?: string;
  instructions?: string;
  settings?: {
    showResults?: boolean;
    showCorrectAnswers?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
  };
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  availableFrom?: string;
  availableTo?: string;
  isPublished?: boolean;
}

export interface CreateAssignmentContentPayload {
  title: string;
  description?: string;
  instructions?: string;
  passingScore?: number;
  maxAttempts?: number;
  dueDate?: string;
  allowLateSubmission?: boolean;
  showFeedbackAfterGrading?: boolean;
  submissionTypes?: import('./assignment.types').AssignmentSubmissionType[];
  isPublished?: boolean;
}

export interface UpdateTextContentPayload {
  title?: string;
  description?: string;
  body?: string;
  isPublished?: boolean;
}

export interface UpdateVideoContentPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  durationSeconds?: number;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface UpdateDocumentContentPayload {
  title?: string;
  description?: string;
  fileUrl?: string;
  isPublished?: boolean;
  allowDownload?: boolean;
}

export interface ReorderModuleContentsPayload {
  contentIds: string[];
}

export interface ModuleContentMutationResponse {
  success: boolean;
  message: string;
  data: ModuleContentItem;
}

export interface ModuleContentsReorderResponse {
  success: boolean;
  message: string;
  data: ModuleContentItem[];
}

export interface ContentMutationResponse {
  success: boolean;
  message: string;
  data: ContentRecord;
}

export interface DetachContentResponse {
  success: boolean;
  message: string;
  data: { moduleId: string; contentId: string };
}

export interface ContentLibraryQueryParams {
  type?: ContentType;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

export interface AttachExistingContentPayload {
  contentId: string;
}
