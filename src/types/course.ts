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
  publicPrice: number | null;
  status: CourseLifecycleStatus;
  institutionId: string;
  departmentId: string | null;
  lecturerId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  institution: CourseInstitution;
  department: CourseDepartment | null;
  lecturer: CourseLecturer | null;
  skills: CourseSkill[];
  tools: CourseTool[];
}

export interface CourseListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseLifecycleStatus;
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
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface CourseMutationResponse {
  success: boolean;
  message: string;
  data: Course;
}
