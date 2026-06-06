import { InstitutionStatus, UserStatus } from '@/types/enum';
import { CourseLifecycleStatus, COURSE_LIFECYCLE_LABELS } from '@/types/course-status';

const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
  BANNED: 'Banned',
};

const USER_STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: 'border-success/30 bg-success/10 text-success',
  INACTIVE: 'border-border bg-muted text-muted-foreground',
  PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  SUSPENDED: 'border-destructive/30 bg-destructive/10 text-destructive',
  BANNED: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const INSTITUTION_STATUS_CLASS: Record<InstitutionStatus, string> = {
  ACTIVE: 'border-success/30 bg-success/10 text-success',
  INACTIVE: 'border-border bg-muted text-muted-foreground',
};

export function getUserStatusLabel(status: UserStatus): string {
  return USER_STATUS_LABELS[status] ?? status;
}

export function getUserStatusClassName(status: UserStatus): string {
  return USER_STATUS_CLASS[status] ?? USER_STATUS_CLASS.INACTIVE;
}

export function getInstitutionStatusClassName(status: InstitutionStatus): string {
  return INSTITUTION_STATUS_CLASS[status] ?? INSTITUTION_STATUS_CLASS.INACTIVE;
}

export function isUserActiveStatus(status: UserStatus): boolean {
  return status === UserStatus.ACTIVE;
}

export function getCourseLifecycleLabel(status: CourseLifecycleStatus): string {
  return COURSE_LIFECYCLE_LABELS[status] ?? status;
}
