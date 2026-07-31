export interface ModuleProgressSummary {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface CourseProgressSummary {
  courseId: string;
  enrollmentId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  modules: ModuleProgressSummary[];
}

export interface MyCourseProgressItem {
  enrollmentId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  thumbnail: string | null;
  estimatedHours: number | null;
  institution: {
    id: string;
    name: string;
    logo: string | null;
  };
  status: string;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  resumeContentId: string | null;
}

export interface ResumeLearningPosition {
  courseId: string;
  moduleId: string;
  contentId: string;
  moduleContentId?: string;
  lessonTitle: string;
  type?: string;
  lastViewedAt?: string;
  isCompleted?: boolean;
}

export interface StartContentProgressResult {
  contentId: string;
  courseId: string;
  moduleId: string;
  startedAt: string;
  lastViewedAt: string;
}

export interface CompleteContentProgressResult {
  contentId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  progress: number;
}

export interface CourseProgressApiResponse {
  data: CourseProgressSummary;
}

export interface MyProgressApiResponse {
  data: MyCourseProgressItem[];
}

export interface ResumeProgressApiResponse {
  data: ResumeLearningPosition;
}

export interface StartContentProgressApiResponse {
  data: StartContentProgressResult;
}

export interface CompleteContentProgressApiResponse {
  data: CompleteContentProgressResult;
}
