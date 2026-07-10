export interface InstitutionSettings {
  institutionId: string;
  requireCourseApproval: boolean;
  updatedAt: string;
}

export interface InstitutionSettingsResponse {
  success: boolean;
  message: string;
  data: InstitutionSettings;
}

export interface UpdateInstitutionSettingsPayload {
  requireCourseApproval: boolean;
}
