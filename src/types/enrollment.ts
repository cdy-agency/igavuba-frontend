export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';

export type EnrollmentSource =
  | 'INSTITUTION_ASSIGNMENT'
  | 'PUBLIC_SELF_ENROLL'
  | 'ADMIN_ENROLLMENT';

export interface EnrollmentRecord {
  id: string;
  learnerId: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  source: EnrollmentSource;
  progress: number;
  completedAt: string | null;
  droppedAt: string | null;
}

export interface EnrollmentStatusResponse {
  isEnrolled: boolean;
  enrollmentId: string | null;
  progress: number;
  status: EnrollmentStatus | null;
}

export interface MyEnrollmentCourse {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  estimatedHours: number | null;
  institution: {
    id: string;
    name: string;
    logo: string | null;
  };
}

export interface MyEnrollmentItem {
  id: string;
  learnerId: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  progress: number;
  completedAt: string | null;
  course: MyEnrollmentCourse;
}

export interface CourseLearnerItem {
  enrollmentId: string;
  learnerId: string;
  name: string;
  email: string;
  progress: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  source: EnrollmentSource;
}

export interface CreateEnrollmentPayload {
  courseId: string;
}

export interface AssignLearnersPayload {
  learnerIds: string[];
}

export interface EnrollmentMutationResponse {
  success: boolean;
  message: string;
  data: EnrollmentRecord;
}

export interface MyEnrollmentsResponse {
  data: MyEnrollmentItem[];
}

export interface EnrollmentStatusApiResponse {
  data: EnrollmentStatusResponse;
}

export interface CourseLearnersResponse {
  data: CourseLearnerItem[];
}
