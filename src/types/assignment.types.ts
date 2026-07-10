export enum AssignmentSubmissionType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  LINK = 'LINK',
}

export enum AssignmentSubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  PUBLISHED = 'PUBLISHED',
}

export interface AssignmentAssessmentContent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAssessment {
  id: string;
  contentId: string;
  type: string;
  title: string;
  description: string | null;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
  content: AssignmentAssessmentContent;
}

export interface AssignmentSummary {
  id: string;
  assessmentId: string;
  passingScore: number;
  maxScore: number;
  maxAttempts: number;
  dueDate: string | null;
  allowLateSubmission: boolean;
  showFeedbackAfterGrading: boolean;
  submissionTypes: AssignmentSubmissionType[] | unknown;
}

export interface Assignment extends AssignmentSummary {
  contentId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  isPublished: boolean;
  submissionsCount: number;
  createdAt: string;
  updatedAt: string;
  assessment: AssignmentAssessment;
}

export interface AssignmentContentAssessment {
  id: string;
  contentId: string;
  type: string;
  title: string;
  description: string | null;
  instructions: string | null;
  assignment: AssignmentSummary;
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  instructions?: string;
  passingScore?: number;
  maxAttempts?: number;
  dueDate?: string;
  allowLateSubmission?: boolean;
  showFeedbackAfterGrading?: boolean;
  submissionTypes?: AssignmentSubmissionType[];
  isPublished?: boolean;
  institutionId?: string;
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
  submissionTypes?: AssignmentSubmissionType[];
  isPublished?: boolean;
}

export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  instructions?: string;
  passingScore?: number;
  maxAttempts?: number;
  dueDate?: string | null;
  allowLateSubmission?: boolean;
  showFeedbackAfterGrading?: boolean;
  submissionTypes?: AssignmentSubmissionType[];
  isPublished?: boolean;
}

export interface AssignmentMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AssignmentDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export interface AssignmentListItem {
  id: string;
  contentId: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  dueDate: string | null;
  submissionsCount: number;
  status: 'Published' | 'Draft' | 'Closed';
  isPublished: boolean;
  passingScore: number;
  maxAttempts: number;
  submissionTypes: AssignmentSubmissionType[];
  createdAt: string;
}

export interface LearningAssignmentContent {
  assignmentId: string;
  passingScore: number;
  maxScore?: number;
  maxAttempts: number;
  dueDate: string | null;
  allowLateSubmission: boolean;
  showFeedbackAfterGrading: boolean;
  instructions: string | null;
  submissionTypes: AssignmentSubmissionType[] | unknown;
}
