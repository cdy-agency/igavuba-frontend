import { CourseLifecycleStatus } from '@/types/course-status';
import { CourseAccessType, CourseLevel } from '@/types/course';

export const COURSE_ACCESS_TYPE_LABELS: Record<CourseAccessType, string> = {
  [CourseAccessType.INTERNAL_ONLY]: 'Internal only',
  [CourseAccessType.PUBLIC_FREE]: 'Public free',
  [CourseAccessType.PUBLIC_PAID]: 'Public paid',
  [CourseAccessType.HYBRID]: 'Hybrid',
};

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  [CourseLevel.BEGINNER]: 'Beginner',
  [CourseLevel.INTERMEDIATE]: 'Intermediate',
  [CourseLevel.ADVANCED]: 'Advanced',
};

const COURSE_STATUS_CLASS: Record<CourseLifecycleStatus, string> = {
  [CourseLifecycleStatus.DRAFT]: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  [CourseLifecycleStatus.UNDER_REVIEW]: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  [CourseLifecycleStatus.CHANGES_REQUESTED]: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
  [CourseLifecycleStatus.APPROVED]: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  [CourseLifecycleStatus.PUBLISHED]: 'border-success/30 bg-success/10 text-success',
  [CourseLifecycleStatus.ARCHIVED]: 'border-border bg-muted text-muted-foreground',
};

export function getCourseStatusClassName(status: CourseLifecycleStatus): string {
  return COURSE_STATUS_CLASS[status] ?? COURSE_STATUS_CLASS.DRAFT;
}

export function getCourseAccessTypeLabel(accessType: CourseAccessType): string {
  return COURSE_ACCESS_TYPE_LABELS[accessType] ?? accessType;
}

export function getCourseLevelLabel(level: CourseLevel | null | undefined): string {
  if (!level) return '—';
  return COURSE_LEVEL_LABELS[level] ?? level;
}

export function isPublicCatalogAccessType(accessType: CourseAccessType): boolean {
  return (
    accessType === CourseAccessType.PUBLIC_FREE ||
    accessType === CourseAccessType.PUBLIC_PAID ||
    accessType === CourseAccessType.HYBRID
  );
}

export function requiresPublicPrice(accessType: CourseAccessType): boolean {
  return accessType === CourseAccessType.PUBLIC_PAID || accessType === CourseAccessType.HYBRID;
}
