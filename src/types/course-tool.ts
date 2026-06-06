export interface CourseTool {
  id: string;
  name: string;
}

export interface CreateCourseToolPayload {
  name: string;
}

export interface UpdateCourseToolPayload {
  name: string;
}

export interface CourseToolMutationResponse {
  success: boolean;
  message: string;
  data: CourseTool;
}

export interface CourseToolDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}
