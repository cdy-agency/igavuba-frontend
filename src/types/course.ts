import type { CourseLifecycleStatus } from './course-status';
import type { CourseLanguageCode } from './course-language';

export enum CourseAccessType {
  INTERNAL_ONLY = 'INTERNAL_ONLY',
  PUBLIC_FREE = 'PUBLIC_FREE',
  PUBLIC_PAID = 'PUBLIC_PAID',
  HYBRID = 'HYBRID',
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface CourseUserSummary {
  id: string;
  name: string | null;
  email: string;
}

export interface CourseOwnerSummary extends CourseUserSummary {
  role: string;
}

export interface CourseInstitution {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface CourseDepartment {
  id: string;
  name: string;
  slug: string;
}

export interface CourseLecturerUser {
  id: string;
  name: string | null;
  email: string;
}

export interface CourseLecturer {
  id: string;
  specialization: string | null;
  bio: string | null;
  qualification: string | null;
  user: CourseLecturerUser;
}

export interface CourseSkill {
  id: string;
  name: string;
}

export interface CourseTool {
  id: string;
  name: string;
}

export interface CourseCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  thumbnail: string | null;
  previewVideo: string | null;
  level: CourseLevel | null;
  language: string | null;
  estimatedHours: number | null;
  accessType: CourseAccessType;
  /** Live DB access type before draft metadata merge (published courses with revisions). */
  liveAccessType?: CourseAccessType;
  publicPrice: number | null;
  status: CourseLifecycleStatus;
  hasUnpublishedChanges?: boolean;
  revisionStatus?: import('./course-revision').CourseRevisionStatus | null;
  publishedAt?: string | null;
  institutionId: string;
  departmentId: string | null;
  lecturerId: string | null;
  createdById: string;
  ownerId: string;
  ownerAssignedAt: string | null;
  ownerAssignedById: string | null;
  lastOwnershipTransferAt: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
  institution: CourseInstitution;
  department: CourseDepartment | null;
  lecturer: CourseLecturer | null;
  owner: CourseOwnerSummary;
  createdBy: CourseUserSummary;
  updatedBy: CourseUserSummary | null;
  ownerAssignedBy: CourseUserSummary | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  submittedForReviewAt?: string | null;
  submittedById?: string | null;
  skills: CourseSkill[];
  tools: CourseTool[];
  categories?: Array<{ category: CourseCategorySummary }>;
}

export interface CourseListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseLifecycleStatus;
  level?: CourseLevel;
  departmentId?: string;
}

export interface CreateCoursePayload {
  title: string;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
  previewVideo?: string;
  level?: CourseLevel;
  language?: CourseLanguageCode;
  estimatedHours?: number;
  accessType: CourseAccessType;
  publicPrice?: number;
  departmentId?: string;
  lecturerId?: string;
  categoryIds?: string[];
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface CourseOwnerDetails {
  id: string;
  ownerId: string;
  ownerAssignedAt: string | null;
  lastOwnershipTransferAt: string | null;
  owner: CourseOwnerSummary;
  ownerAssignedBy: CourseUserSummary | null;
  createdBy: CourseUserSummary;
  updatedBy: CourseUserSummary | null;
}

export interface EligibleCourseOwner {
  id: string;
  name: string | null;
  email: string;
  role: string;
  lecturerProfileId: string | null;
}

export interface AssignCourseOwnerPayload {
  ownerId: string;
}

export interface CourseMutationResponse<T = Course> {
  success: boolean;
  message: string;
  data: T;
}
