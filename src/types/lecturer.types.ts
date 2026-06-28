import { UserStatus } from '@/types/enum';

export interface LecturerDepartment {
  id: string;
  name: string;
  slug?: string;
  institutionId?: string;
}

export interface LecturerListItem {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  department: LecturerDepartment | null;
  institution: { id: string; name: string } | null;
  coursesCount: number;
  createdAt: string;
}

export interface LecturerStatistics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  createdCoursesCount: number;
  assignedCoursesCount: number;
  totalLearners: number;
  averageCompletionRate: number | null;
}

export interface LecturerDetail extends Omit<LecturerListItem, 'coursesCount'> {
  specialization: string | null;
  bio: string | null;
  qualification: string | null;
  assignedCoursesCount: number;
  profileCreatedAt: string;
  statistics: LecturerStatistics;
}

export interface InviteLecturerPayload {
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
  phoneNumber?: string;
}

export interface ActivateLecturerPayload {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LecturerMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface VerifyLecturerInvitationData {
  email: string;
  institutionName: string;
}

export interface ActivateLecturerData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    status: UserStatus;
    role: string;
  };
  institution: {
    id: string;
    name: string;
  };
}

export interface ListLecturersQuery {
  searchq?: string;
  status?: UserStatus;
  departmentId?: string;
  institutionId?: string;
}
