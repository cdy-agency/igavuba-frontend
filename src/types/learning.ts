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
}

export interface LearningModule {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  courseTitle: string;
  contents: LearningLessonContent[];
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
  modules: LearningModule[];
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
  raw?: LearningLessonRaw;
}

export interface LearningLessonRaw {
  content: LearningRenderableContent;
  moduleId: string;
  moduleContentId: string;
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
