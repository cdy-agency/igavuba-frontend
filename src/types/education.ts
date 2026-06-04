import type { Course, Institution } from "@/lib/api";

export type IInstitution = Institution;
export type ICourse = Course;

export interface IEnrollment {
  _id?: string;
  course_id?: Course;
  status: string;
  progress_percentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
  enrolled_at: string;
}
