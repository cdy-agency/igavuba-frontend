export interface CourseSkill {
  id: string;
  name: string;
}

export interface CreateCourseSkillPayload {
  name: string;
}

export interface UpdateCourseSkillPayload {
  name: string;
}

export interface CourseSkillMutationResponse {
  success: boolean;
  message: string;
  data: CourseSkill;
}

export interface CourseSkillDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string };
}
