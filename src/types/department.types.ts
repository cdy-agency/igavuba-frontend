export interface Department {
  id: string;
  name: string;
  slug: string;
  institutionId: string;
  institution: { id: string; name: string } | null;
  coursesCount: number;
  lecturersCount: number;
  createdAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  institutionId?: string;
}

export interface UpdateDepartmentPayload {
  name: string;
}

export interface ListDepartmentsQuery {
  page?: number;
  limit?: number;
  searchq?: string;
  institutionId?: string;
}

export interface DepartmentMutationResponse<T = Department> {
  success: boolean;
  message: string;
  data: T;
}
