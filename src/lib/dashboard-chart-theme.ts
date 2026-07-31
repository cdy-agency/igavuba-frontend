/** Reference-style dashboard chart palette */
export const DASHBOARD_CHART_COLORS = [
  '#4285F4', // blue
  '#FF7043', // orange
  '#26A69A', // teal
  '#AB47BC', // purple
  '#EF5350', // red
  '#66BB6A', // green
  '#5C6BC0', // indigo
  '#FFA726', // amber
] as const;

export function getChartColor(index: number): string {
  return DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length];
}

export const CHART_SUBTITLES: Record<string, string> = {
  institutionGrowth: 'Monthly new institutions on the platform.',
  courseGrowth: 'Monthly new courses created.',
  userDistribution: 'Breakdown of users by role.',
  monthlyEnrollments: 'New enrollments per month.',
  studentEnrollmentTrend: 'Enrollment activity over time.',
  courseCompletionRate: 'Status of enrolled learners.',
  courseStatusDistribution: 'Courses grouped by current status.',
  lecturerActivity: 'Enrollments across lecturer courses.',
  enrollmentPerCourse: 'Learners enrolled in each course.',
  quizPassRate: 'Quiz outcomes across your courses.',
  assignmentStatus: 'Submissions by grading status.',
  courseCompletion: 'Completion status across your learners.',
  learningProgress: 'Completion percentage per enrolled course.',
  weeklyLearningActivity: 'Activity over the last 7 days.',
  assessmentPerformance: 'Quiz scores and attempt summary.',
};

export const FULL_WIDTH_CHART_KEYS = new Set([
  'institutionGrowth',
  'courseGrowth',
  'studentEnrollmentTrend',
  'monthlyEnrollments',
  'weeklyLearningActivity',
]);

export const DONUT_CHART_KEYS = new Set([
  'courseCompletionRate',
  'courseCompletion',
  'quizPassRate',
]);

export const BAR_LEGEND_LABELS: Record<string, string> = {
  enrollmentPerCourse: 'enrollments',
  monthlyEnrollments: 'enrollments',
  lecturerActivity: 'enrollments',
  learningProgress: 'progress',
  assessmentPerformance: 'score',
  institutionGrowth: 'count',
  courseGrowth: 'count',
  studentEnrollmentTrend: 'enrollments',
};
