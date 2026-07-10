export type ExamAttemptStatus =
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PENDING_MANUAL_REVIEW'
  | 'GRADED'
  | 'PUBLISHED';

export interface ExamQuestionOption {
  id: string;
  text: string;
  order: number;
  isCorrect?: boolean;
}

export interface ExamQuestion {
  id: string;
  examId?: string | null;
  type: string;
  title: string;
  instructions?: string | null;
  explanation?: string | null;
  points: number;
  order: number;
  isManualGraded?: boolean;
  options: ExamQuestionOption[];
}

export interface ExamDetail {
  id: string;
  assessmentId: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  assessment: {
    id: string;
    contentId: string;
    title: string;
    description: string | null;
    instructions: string | null;
    settings: {
      showResults: boolean;
      showCorrectAnswers: boolean;
      shuffleQuestions: boolean;
      shuffleOptions: boolean;
    };
    content: {
      id: string;
      isPublished: boolean;
    };
  };
  questions: ExamQuestion[];
}

export interface ExamListItem {
  examId: string;
  contentId: string;
  title: string;
  moduleId?: string;
  moduleTitle?: string;
  courseId?: string;
  courseTitle?: string;
  courseSlug?: string;
  isFinalExam?: boolean;
  questionsCount: number;
  passingScore: number;
  maxAttempts: number;
  createdAt: string;
}

export interface ExamSubmissionListItem {
  id: string;
  status: ExamAttemptStatus;
  student: { id: string; name: string | null; email: string };
  submittedAt: string | null;
  autoScore: number;
  manualScore: number;
  finalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  essayQuestions: number;
  publishedAt: string | null;
}

export interface ExamMutationResponse<T = ExamDetail> {
  success: boolean;
  message: string;
  data: T;
}
