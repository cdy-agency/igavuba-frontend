import type { ContentType } from '@/types/content';
import type { CourseAccessType, CourseLevel } from '@/types/course';
import type { EnrollmentSource, EnrollmentStatus } from '@/types/enrollment';

export interface LearningInstructor {
  name: string | null;
  profileImage: string | null;
  bio: string | null;
  qualification: string | null;
  specialization: string | null;
}

export interface LearningEnrollment {
  id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  source: EnrollmentSource;
}

export interface LearningLessonContent {
  id: string;
  moduleContentId: string;
  moduleId: string;
  title: string;
  description: string | null;
  type: ContentType;
  order: number;
  isOptional: boolean;
  requiredForCompletion: boolean;
  unlockDate: string | null;
  completed: boolean;
  isPaymentLocked?: boolean;
  createdAt: string;
  updatedAt: string;
  textContent?: {
    bodyHtml: string;
  };
  videoContent?: {
    externalUrl?: string;
    allowDownload?: boolean;
    media?: {
      url: string;
    };
  };
  documentContent?: {
    allowDownload?: boolean;
    media?: {
      url: string;
      fileName: string;
    };
  };
  quizContent?: {
    quizId: string;
    passingScore: number;
    maxAttempts: number;
    timeLimitMinutes: number | null;
    instructions: string | null;
    settings: {
      showResults: boolean;
      showCorrectAnswers: boolean;
      shuffleQuestions: boolean;
      shuffleOptions: boolean;
    };
  };
  assignmentContent?: {
    assignmentId: string;
    passingScore: number;
    maxAttempts: number;
    dueDate: string | null;
    allowLateSubmission: boolean;
    showFeedbackAfterGrading: boolean;
    instructions: string | null;
    submissionTypes: unknown;
  };
  examContent?: {
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
  };
}

export interface LearningModule {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  courseTitle: string;
  isPaymentLocked?: boolean;
  contents: LearningLessonContent[];
}

export interface LearningFinalExam {
  id: string;
  courseFinalExamId: string;
  title: string;
  description: string | null;
  type: ContentType;
  completed: boolean;
  isPaymentLocked?: boolean;
  createdAt: string;
  updatedAt: string;
  examContent: NonNullable<LearningLessonContent['examContent']>;
}

export interface LearningCourseAccess {
  level: 'FULL' | 'PREVIEW';
  previewContentId: string | null;
  requiresPayment: boolean;
  price: number | null;
  currency: string;
}

export interface LearningCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  previewVideo: string | null;
  level: CourseLevel | null;
  language: string | null;
  accessType: CourseAccessType;
  estimatedHours: number | null;
  publicPrice: number | null;
  publicCurrency?: string | null;
  publishedAt: string;
  categories: Array<{ id: string; name: string; slug: string }>;
  skills: string[];
  tools: string[];
  institution: {
    id: string;
    name: string;
    logo: string | null;
  };
  instructor: LearningInstructor;
  enrollment: LearningEnrollment;
  access: LearningCourseAccess;
  modules: LearningModule[];
  finalExam: LearningFinalExam | null;
}

export interface LearningCourseApiResponse {
  data: LearningCourse;
}

export interface MarkContentCompleteResult {
  moduleContentId: string;
  contentId: string;
  completed: boolean;
  progress: number;
}

export interface MarkContentCompleteResponse {
  data: MarkContentCompleteResult;
}

/** Sidebar lesson item used by ModuleList */
export interface LessonItem {
  id: string;
  title: string;
  type: string;
  completed?: boolean;
  isPaymentLocked?: boolean;
  isFinalExam?: boolean;
}

/** Sidebar module item used by ModuleList */
export interface ModuleItem {
  id: string;
  title: string;
  expanded?: boolean;
  locked?: boolean;
  lessons?: LessonItem[];
}

/** Lesson passed to LessonContent */
export interface LessonSummary {
  id: string;
  title: string;
  type: string;
  completed?: boolean;
  isFinalExam?: boolean;
  isPaymentLocked?: boolean;
  raw?: LearningLessonRaw;
}

export interface LearningLessonRaw {
  content: LearningRenderableContent;
  moduleId: string;
  moduleContentId: string;
  isPaymentLocked?: boolean;
}

/** Content shape expected by LessonContent renderers */
export interface LearningRenderableContent {
  id: string;
  title: string;
  description?: string | null;
  type: ContentType | string;
  createdAt?: string;
  textContent?: {
    bodyHtml?: string;
  };
  videoContent?: {
    externalUrl?: string;
    allowDownload?: boolean;
    media?: {
      url: string;
    };
  };
  documentContent?: {
    allowDownload?: boolean;
    media?: {
      url: string;
      fileName?: string;
    };
  };
  quizContent?: {
    quizId: string;
    passingScore: number;
    maxAttempts: number;
    timeLimitMinutes: number | null;
    instructions: string | null;
    settings: {
      showResults: boolean;
      showCorrectAnswers: boolean;
      shuffleQuestions: boolean;
      shuffleOptions: boolean;
    };
  };
  assignmentContent?: {
    assignmentId: string;
    passingScore: number;
    maxAttempts: number;
    dueDate: string | null;
    allowLateSubmission: boolean;
    showFeedbackAfterGrading: boolean;
    instructions: string | null;
    submissionTypes: unknown;
  };
  examContent?: {
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
  };
}

export interface AugmentedModule {
  id: string;
  title: string;
  courseTitle: string;
  description: string;
  slug: string;
  lessons: LessonSummary[];
  expanded: boolean;
  locked?: boolean;
  enableLockedModules?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Future progress tracking integration point */
export interface MarkLessonCompletePayload {
  enrollmentId: string;
  courseId: string;
  moduleId: string;
  moduleContentId: string;
  contentId: string;
}
