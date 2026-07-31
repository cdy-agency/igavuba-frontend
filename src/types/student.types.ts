import type { UserStatus } from '@/types/enum';

export interface StudentDepartment {
  id: string;
  name: string;
}

export interface StudentInstitution {
  id: string;
  name: string;
}

export interface StudentListItem {
  id: string;
  userId: string;
  studentId: string | null;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  department: StudentDepartment | null;
  institution: StudentInstitution | null;
  coursesCount: number;
  createdAt: string;
}

export interface StudentCourseEnrollment {
  enrollmentId: string;
  status: string;
  progress: number;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
  };
}

export interface StudentDetail extends StudentListItem {
  program: string | null;
  level: number | null;
  courses?: StudentCourseEnrollment[];
}

export interface InviteStudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  studentId: string;
  departmentId?: string;
  program?: string;
  level?: number;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  studentId?: string;
  departmentId?: string;
  program?: string;
  level?: number;
}

export interface ListStudentsQuery {
  searchq?: string;
  status?: UserStatus;
  departmentId?: string;
  institutionId?: string;
}

export interface StudentImportSummary {
  totalRecords: number;
  successfulInvitations: number;
  failedInvitations: number;
  skipped: number;
  imported: number;
  failedCount: number;
  importedEmails: string[];
  skippedRows: { rowNumber: number; email: string; reason: string }[];
  failedRows: { rowNumber: number; reason: string; email?: string }[];
}

export interface StudentImportPreview {
  previewToken: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  validStudents: {
    rowNumber: number;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
    department?: string;
    program?: string;
  }[];
  invalidRows: { rowNumber: number; email?: string; reason: string }[];
}

export interface ConfirmStudentImportPayload {
  previewToken: string;
}

export interface StudentMutationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface VerifyStudentInvitationData {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  institutionName: string;
}

export interface ActivateStudentPayload {
  token: string;
  password: string;
}

export interface ActivateStudentData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
    role: string;
  };
  institution: {
    id: string;
    name: string;
  };
}

export interface CourseStudentRow {
  enrollmentId: string;
  learnerProfileId: string;
  studentId: string | null;
  name: string | null;
  email: string;
  status: string;
  department: StudentDepartment | null;
  progress: number;
  enrolledAt: string;
  enrollmentStatus: string;
  completedAt: string | null;
}

export interface InternalEnrollmentPayload {
  learnerProfileIds: string[];
  courseId: string;
}

export interface BulkInternalEnrollmentPayload {
  learnerProfileIds: string[];
  courseIds: string[];
}
