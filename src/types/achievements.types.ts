export type AchievementAssessmentStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'AWAITING_REVIEW'
  | 'GRADED'
  | 'PUBLISHED';

export interface AchievementAssessmentItem {
  id: string;
  title: string;
  passingScore: number;
  maxScore: number | null;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  status: AchievementAssessmentStatus;
  submittedAt: string | null;
}

export interface CourseAchievement {
  courseId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  institution: {
    id: string;
    name: string;
  };
  enrollment: {
    id: string;
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
    completedAt: string | null;
  };
  performance: {
    quizAverage: number | null;
    assignmentAverage: number | null;
    examAverage: number | null;
    overallAverage: number | null;
    passed: boolean | null;
  };
  assessmentCounts: {
    total: number;
    completed: number;
    quizzes: number;
    assignments: number;
    exams: number;
  };
  assessments: {
    quizzes: AchievementAssessmentItem[];
    assignments: AchievementAssessmentItem[];
    exams: AchievementAssessmentItem[];
  };
}

export interface AchievementsSummary {
  enrolledCourses: number;
  coursesPassed: number;
  overallAverage: number | null;
  totalAssessments: number;
  completedAssessments: number;
}

export interface AchievementsData {
  summary: AchievementsSummary;
  courses: CourseAchievement[];
}

export interface AchievementsResponse {
  success: boolean;
  message: string;
  data: AchievementsData;
}
