import { apiClient } from './api-client';
import type {
  Assignment,
  AssignmentDeleteResponse,
  AssignmentMutationResponse,
  CreateAssignmentContentPayload,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/types/assignment.types';
import type {
  AssignmentSubmissionMutationResponse,
  AssignmentSubmissionHistory,
  AssignmentSubmissionsPageData,
  GradeAssignmentSubmissionPayload,
  PublishGradeResult,
  SubmitAssignmentPayload,
  SubmitAssignmentResult,
  DeleteAssignmentSubmissionResult,
  LecturerAssignmentSubmission,
} from '@/types/assignment-submission.types';

export async function createAssignment(payload: CreateAssignmentPayload) {
  const response = await apiClient.post<AssignmentMutationResponse<Assignment>>(
    '/assignments',
    payload,
  );
  return response.data;
}

export async function getAssignment(assignmentId: string) {
  const response = await apiClient.get<AssignmentMutationResponse<Assignment>>(
    `/assignments/${assignmentId}`,
  );
  return response.data;
}

export async function updateAssignment(
  assignmentId: string,
  payload: UpdateAssignmentPayload,
) {
  const response = await apiClient.patch<AssignmentMutationResponse<Assignment>>(
    `/assignments/${assignmentId}`,
    payload,
  );
  return response.data;
}

export async function deleteAssignment(assignmentId: string) {
  const response = await apiClient.delete<AssignmentDeleteResponse>(
    `/assignments/${assignmentId}`,
  );
  return response.data;
}

export async function getMyAssignmentSubmissions(
  assignmentId: string,
  courseId?: string,
) {
  const response = await apiClient.get<
    AssignmentSubmissionMutationResponse<AssignmentSubmissionHistory>
  >(`/assignments/${assignmentId}/submissions/me`, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}

export async function submitAssignment(
  assignmentId: string,
  payload: SubmitAssignmentPayload,
  courseId?: string,
) {
  const response = await apiClient.post<
    AssignmentSubmissionMutationResponse<SubmitAssignmentResult>
  >(`/assignments/${assignmentId}/submit`, payload, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}

export async function deleteAssignmentSubmission(
  assignmentId: string,
  submissionId: string,
  courseId?: string,
) {
  const response = await apiClient.delete<
    AssignmentSubmissionMutationResponse<DeleteAssignmentSubmissionResult>
  >(`/assignments/${assignmentId}/submissions/${submissionId}`, {
    params: courseId ? { courseId } : undefined,
  });
  return response.data;
}

export async function listAssignmentSubmissions(assignmentId: string) {
  const response = await apiClient.get<
    AssignmentSubmissionMutationResponse<AssignmentSubmissionsPageData>
  >(`/assignments/${assignmentId}/submissions`);
  return response.data;
}

export async function saveAssignmentGrade(
  assignmentId: string,
  submissionId: string,
  payload: GradeAssignmentSubmissionPayload,
) {
  const response = await apiClient.patch<
    AssignmentSubmissionMutationResponse<LecturerAssignmentSubmission>
  >(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, payload);
  return response.data;
}

export async function publishAssignmentGrade(
  assignmentId: string,
  submissionId: string,
) {
  const response = await apiClient.post<
    AssignmentSubmissionMutationResponse<PublishGradeResult>
  >(`/assignments/${assignmentId}/submissions/${submissionId}/publish`);
  return response.data;
}

export type { CreateAssignmentContentPayload };
