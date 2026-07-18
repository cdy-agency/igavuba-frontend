export type AssessmentType = 'QUIZ' | 'ASSIGNMENT' | 'EXAM';

export type AssessmentLearnerStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'AWAITING_REVIEW'
  | 'PASSED'
  | 'FAILED'
  | 'ATTEMPTS_EXHAUSTED';

export type CertificateEligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE';

export type CourseCompletionStatus = 'COMPLETED' | 'IN_PROGRESS';

export interface AssessmentAcademicRules {
  required: boolean;
  countsTowardCertificate: boolean;
  blockProgressUntilPassed: boolean;
  passingScore: number;
  maxAttempts: number;
}

export interface CourseAcademicPolicyAssessment extends AssessmentAcademicRules {
  id: string;
  contentId: string;
  typeId: string;
  title: string;
  type: AssessmentType;
  maxScore?: number | null;
  isFinalExam: boolean;
  moduleOrder: number;
  contentOrder: number;
}

export interface CourseAcademicPolicy {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  requireFinalExam: boolean;
  requireAssignments: boolean;
  requireAllRequiredAssessments: boolean;
  assessments: CourseAcademicPolicyAssessment[];
}

export interface UpdateCourseAcademicPolicyPayload {
  requireFinalExam?: boolean;
  requireAssignments?: boolean;
  requireAllRequiredAssessments?: boolean;
}

export interface AssessmentSummaryItem {
  assessmentId: string;
  contentId: string;
  type: AssessmentType;
  title: string;
  status: AssessmentLearnerStatus;
  passed: boolean | null;
  percentage: number | null;
  countsTowardCertificate: boolean;
  required: boolean;
}

export interface CertificateEligibilityResult {
  eligibilityStatus: CertificateEligibilityStatus;
  courseCompleted: boolean;
  courseCompletionStatus: CourseCompletionStatus;
  overallGrade: number | null;
  requiredAssessments: AssessmentSummaryItem[];
  passedAssessments: AssessmentSummaryItem[];
  pendingAssessments: AssessmentSummaryItem[];
  failedAssessments: AssessmentSummaryItem[];
  reasons: string[];
}

export interface CourseCompletionResult {
  status: CourseCompletionStatus;
  progressPercentage: number;
  reasons: string[];
  pendingItems: string[];
}

export interface GrantAssessmentAttemptPayload {
  learnerProfileId: string;
  reason?: string;
  attemptsGranted?: number;
}

export interface GrantAssessmentAttemptResult {
  id: string;
  assessmentId: string;
  learnerProfileId: string;
  attemptsGranted: number;
  reason: string | null;
  grantedAt: string;
  grantedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface AcademicApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BlockedProgressDetails {
  assessmentTitle: string;
  assessmentContentId?: string;
  reason: string;
  status: AssessmentLearnerStatus;
  attemptsRemaining: number | null;
  currentScore: number | null;
  passingScore: number | null;
  attemptsExhausted: boolean;
}
