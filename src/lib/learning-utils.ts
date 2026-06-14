import type {
  AugmentedModule,
  LearningCourse,
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
    locked: false,
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
    raw: {
      moduleId,
      moduleContentId: content.moduleContentId,
      content: {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        createdAt: content.createdAt,
        textContent: content.textContent,
        videoContent: content.videoContent,
        documentContent: content.documentContent,
      },
    },
  };
}

