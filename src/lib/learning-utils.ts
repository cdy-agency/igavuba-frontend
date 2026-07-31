import type {
  AugmentedModule,
  LearningCourse,
  LearningFinalExam,
  LearningLessonContent,
  LessonSummary,
} from '@/types/learning';

export function mapLearningCourseToModules(
  course: LearningCourse,
  options?: { enableLockedModules?: boolean },
): AugmentedModule[] {
  const enableLockedModules = options?.enableLockedModules ?? false;

  return course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    courseTitle: module.courseTitle || course.title,
    description: module.description || '',
    slug: module.slug,
    lessons: module.contents.map((content) => mapContentToLesson(content, module.id)),
    expanded: false,
    locked: Boolean(module.isPaymentLocked),
    enableLockedModules,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function mapContentToLesson(
  content: LearningLessonContent,
  moduleId: string,
): LessonSummary {
  return {
    id: content.id,
    title: content.title,
    type: content.type,
    completed: content.completed,
    isPaymentLocked: content.isPaymentLocked,
    raw: {
      moduleId,
      moduleContentId: content.moduleContentId,
      isPaymentLocked: content.isPaymentLocked,
      content: {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        createdAt: content.createdAt,
        textContent: content.textContent,
        videoContent: content.videoContent,
        documentContent: content.documentContent,
        quizContent: content.quizContent,
        assignmentContent: content.assignmentContent,
        examContent: content.examContent,
      },
    },
  };
}

export function mapFinalExamToLesson(finalExam: LearningFinalExam): LessonSummary {
  return {
    id: finalExam.id,
    title: finalExam.title,
    type: finalExam.type,
    completed: finalExam.completed,
    isFinalExam: true,
    isPaymentLocked: finalExam.isPaymentLocked,
    raw: {
      moduleId: '',
      moduleContentId: finalExam.courseFinalExamId,
      content: {
        id: finalExam.id,
        title: finalExam.title,
        description: finalExam.description,
        type: finalExam.type,
        createdAt: finalExam.createdAt,
        examContent: finalExam.examContent,
      },
    },
  };
}

