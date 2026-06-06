/** Matches backend Prisma CourseStatus lifecycle values. */
export enum CourseLifecycleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export const COURSE_LIFECYCLE_LABELS: Record<CourseLifecycleStatus, string> = {
  [CourseLifecycleStatus.DRAFT]: 'Draft',
  [CourseLifecycleStatus.PUBLISHED]: 'Published',
  [CourseLifecycleStatus.ARCHIVED]: 'Archived',
};
