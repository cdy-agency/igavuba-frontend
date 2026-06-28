import type {
  AssignmentSubmissionStatus,
  AssignmentSubmissionType,
} from './assignment.types';

export interface AssignmentSubmissionGrade {
  score: number | null;
  feedback: string | null;
  passed: boolean | null;
  publishedAt: string | null;
  passingScore: number;
  maxScore: number;
}

export interface AssignmentSubmission {
  id: string;
  attemptNumber: number;
  status: AssignmentSubmissionStatus;
  textAnswer: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletable?: boolean;
  grade: AssignmentSubmissionGrade | null;
}

export interface AssignmentSubmissionHistory {
  assignmentId: string;
  contentId: string;
  courseId: string;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  dueDate: string | null;
  allowLateSubmission: boolean;
  showFeedbackAfterGrading: boolean;
  passingScore: number;
  maxScore: number;
  submissionTypes: AssignmentSubmissionType[];
  contentCompleted: boolean;
  courseProgress?: number;
  latestGrade: AssignmentSubmission | null;
  submissions: AssignmentSubmission[];
}

export interface SubmitAssignmentPayload {
  textAnswer?: string;
  fileUrl?: string;
  linkUrl?: string;
}

export interface SubmitAssignmentResult extends AssignmentSubmission {
  attemptsUsed: number;
  attemptsRemaining: number;
  courseId: string;
  contentId: string;
  markedComplete: boolean;
  courseProgress?: number;
}

export interface DeleteAssignmentSubmissionResult {
  assignmentId: string;
  contentId: string;
  courseId: string;
  attemptsUsed: number;
  attemptsRemaining: number;
  contentCompleted: boolean;
  markedIncomplete: boolean;
  courseProgress?: number;
}

export interface GradeAssignmentSubmissionPayload {
  score: number;
  feedback?: string;
}

export interface LecturerAssignmentSubmission {
  id: string;
  attemptNumber: number;
  status: AssignmentSubmissionStatus;
  textAnswer: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  score: number | null;
  feedback: string | null;
  passed: boolean | null;
  gradedBy: string | null;
  gradedAt: string | null;
  publishedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  learner: {
    id: string;
    name: string | null;
    email: string;
  };
  grader: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface AssignmentSubmissionDetailData {
  assignment: import('./assignment.types').Assignment;
  submission: LecturerAssignmentSubmission;
}

export interface AssignmentSubmissionsPageData {
  assignment: import('./assignment.types').Assignment;
  submissions: LecturerAssignmentSubmission[];
}

export interface AssignmentSubmissionMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PublishGradeResult {
  submission: LecturerAssignmentSubmission;
  courseProgress?: number;
}

export interface PublishAllResultsData {
  publishedCount: number;
  submissions: LecturerAssignmentSubmission[];
  courseProgress?: number;
}
