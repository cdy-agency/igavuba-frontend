export function buildCourseBuilderContentPath(params: {
  courseSlug: string;
  contentId: string;
  moduleId?: string;
}) {
  const query = new URLSearchParams({
    contentId: params.contentId,
  });

  if (params.moduleId) {
    query.set('moduleId', params.moduleId);
  }

  return `/builder/course/${params.courseSlug}?${query.toString()}`;
}

export function buildAssessmentsPath(tab: 'quizzes' | 'exams' | 'assignments' = 'quizzes') {
  return `/dashboard/assessments?tab=${tab}`;
}

export function buildExamBuilderPath(
  params: {
    examId?: string;
    courseSlug?: string;
    contentId?: string;
    returnTo?: 'builder' | 'assessments';
  } = {},
) {
  const query = new URLSearchParams();

  if (params.courseSlug) query.set('courseSlug', params.courseSlug);
  if (params.contentId) query.set('contentId', params.contentId);
  if (params.returnTo) query.set('returnTo', params.returnTo);

  const queryString = query.toString();

  if (params.examId) {
    return `/dashboard/exams/${params.examId}/edit${queryString ? `?${queryString}` : ''}`;
  }

  return `/dashboard/exams/new${queryString ? `?${queryString}` : ''}`;
}
