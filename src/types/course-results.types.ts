export type CourseResultsEnrollmentType = 'INTERNAL' | 'PUBLIC';

export type CourseResultsEnrollmentFilter = 'all' | 'internal' | 'public';

export type CourseResultsStatusFilter =
  | 'all'
  | 'passed'
  | 'failed'
  | 'completed'
  | 'in_progress';

export interface CourseResultsCourseSummary {
  id: string;
  slug: string;
  title: string;
  quizCount: number;
  assignmentCount: number;
}

export interface CourseLearnerResultRow {
  learnerId: string;
  userId: string;
  name: string;
  email: string;
  enrollmentType: CourseResultsEnrollmentType;
  progress: number;
  quizAverage: number | null;
  assignmentAverage: number | null;
  overallAverage: number | null;
  completed: boolean;
  passed: boolean | null;
  status: 'COMPLETED' | 'IN_PROGRESS';
  enrolledAt: string;
}

export interface CourseResultsData {
  course: CourseResultsCourseSummary;
  learners: CourseLearnerResultRow[];
  summary: {
    totalLearners: number;
    filteredCount: number;
  };
}

export interface CourseLearnerQuizAttemptSummary {
  id: string;
  attemptNumber: number;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  submittedAt: string | null;
}

export interface CourseLearnerQuizResult {
  quizId: string;
  title: string;
  passingScore: number;
  bestScore: number | null;
  bestPercentage: number | null;
  bestPassed: boolean | null;
  attemptsUsed: number;
  attempts: CourseLearnerQuizAttemptSummary[];
}

export interface CourseLearnerAssignmentGrade {
  submissionId: string;
  assignmentId: string;
  title: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  maxScore: number;
  passingScore: number;
  passed: boolean | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  publishedAt: string | null;
  grader: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface CourseLearnerResultDetail {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  learner: {
    id: string;
    userId: string;
    name: string | null;
    email: string;
    profileImage: string | null;
    isInternalStudent: boolean;
    studentId: string | null;
    admissionNumber: string | null;
  };
  enrollment: {
    id: string;
    source: string;
    status: string;
    enrollmentType: CourseResultsEnrollmentType;
    enrolledAt: string;
    completedAt: string | null;
    progress: number;
    isCompleted: boolean;
  };
  performance: {
    quizAverage: number | null;
    assignmentAverage: number | null;
    overallAverage: number | null;
    passed: boolean | null;
  };
  quizAttempts: CourseLearnerQuizResult[];
  assignmentGrades: CourseLearnerAssignmentGrade[];
}

export interface CourseResultsMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CourseResultsQueryParams {
  enrollmentType?: CourseResultsEnrollmentFilter;
  status?: CourseResultsStatusFilter;
}
