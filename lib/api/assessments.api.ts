'use client';

import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import type {
  ApiResult,
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentSubmission,
  AssessmentAnswerPayload,
  StartAttemptResponse,
  QuestionsForAttemptResponse,
  SubmitAssessmentResponse,
} from '@/lib/types/assessment-unified';

async function request<T>(fn: () => Promise<{ data: T }>): Promise<ApiResult<T>> {
  try {
    const res = await fn();
    return { ok: true, data: res.data };
  } catch (err) {
    const ax = err as AxiosError<{ message?: string }>;
    const status = ax.response?.status ?? 0;
    const message = ax.response?.data?.message || ax.message || 'Request failed';
    const details = ax.response?.data;
    return { ok: false, status, message, details };
  }
}

const BASE = '/api/assessments';

export function createAssessment(payload: {
  title: string;
  description?: string;
  type: 'QUIZ' | 'EXAM' | 'ASSIGNMENT';
  course: string;
  module?: string; // required for QUIZ/ASSIGNMENT
  totalMarks: number;
  duration?: number;
  dueDate?: string;
  publishResults?: boolean;
  assignmentSettings?: { submissionType: 'TEXT' | 'DOCUMENT' | 'BOTH' };
  maxAttempts?: number;
}): Promise<ApiResult<Assessment>> {
  return request<Assessment>(() => axiosInstance.post(BASE, payload));
}

export function getAssessmentsByCourse(courseId: string): Promise<ApiResult<Assessment[]>> {
  return request<Assessment[]>(() => axiosInstance.get(`${BASE}/course/${courseId}`));
}

export function getAssessmentsByModule(moduleId: string): Promise<ApiResult<Assessment[]>> {
  return request<Assessment[]>(() => axiosInstance.get(`${BASE}/module/${moduleId}`));
}

export function getAssessmentById(id: string): Promise<ApiResult<Assessment>> {
  return request<Assessment>(() => axiosInstance.get(`${BASE}/${id}`));
}

export function updateAssessmentQuestion(
  assessmentId: string,
  questionId: string,
  payload: {
    questionText?: string;
    type?: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'ESSAY' | 'TEXT';
    options?: { text: string; isCorrect: boolean }[];
    marks?: number;
    order?: number;
  }
): Promise<ApiResult<AssessmentQuestion>> {
  return request<AssessmentQuestion>(() =>
    axiosInstance.patch(`${BASE}/${assessmentId}/questions/${questionId}`, payload)
  );
}

export function addAssessmentQuestions(
  assessmentId: string,
  questions: Array<{
    questionText: string;
    type: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'ESSAY' | 'TEXT';
    options?: { text: string; isCorrect: boolean }[];
    marks: number;
    order?: number;
  }>
): Promise<ApiResult<Assessment>> {
  return request<Assessment>(() =>
    axiosInstance.post(`${BASE}/${assessmentId}/questions`, { questions })
  );
}

export function startAssessmentAttempt(assessmentId: string): Promise<ApiResult<StartAttemptResponse>> {
  return request<StartAttemptResponse>(() => axiosInstance.post(`${BASE}/${assessmentId}/start`));
}

export function getAssessmentQuestionsForAttempt(
  assessmentId: string
): Promise<ApiResult<QuestionsForAttemptResponse>> {
  return request<QuestionsForAttemptResponse>(() =>
    axiosInstance.get(`${BASE}/${assessmentId}/questions`)
  );
}

export function submitAssessment(
  assessmentId: string,
  payload: { answers: AssessmentAnswerPayload[] }
): Promise<ApiResult<SubmitAssessmentResponse>> {
  return request<SubmitAssessmentResponse>(() =>
    axiosInstance.post(`${BASE}/${assessmentId}/submit`, payload)
  );
}

export function getAssessmentSubmissions(
  assessmentId: string
): Promise<ApiResult<AssessmentSubmission[]>> {
  return request<AssessmentSubmission[]>(() =>
    axiosInstance.get(`${BASE}/${assessmentId}/submissions`)
  );
}

export interface SubmissionWithDetails extends AssessmentSubmission {
  attempt?: { student?: { name?: string; email?: string }; _id?: string };
  answers?: Array<{
    _id: string;
    question?: { questionText?: string; type?: string; marks?: number };
    selectedOptions?: string[];
    textAnswer?: string;
    fileUrl?: string;
    autoScore?: number;
    manualScore?: number;
  }>;
}

export function getSubmissionById(
  submissionId: string
): Promise<ApiResult<SubmissionWithDetails>> {
  return request<SubmissionWithDetails>(() =>
    axiosInstance.get(`${BASE}/submissions/${submissionId}`)
  );
}

export function gradeAssessmentSubmission(
  submissionId: string,
  payload: {
    manualScores?: Array<{ answerId: string; manualScore: number }>;
    feedback?: string;
  }
): Promise<ApiResult<AssessmentSubmission>> {
  return request<AssessmentSubmission>(() =>
    axiosInstance.patch(`${BASE}/submissions/${submissionId}/grade`, payload)
  );
}

export function publishAssessmentResults(
  assessmentId: string
): Promise<ApiResult<Assessment>> {
  return request<Assessment>(() =>
    axiosInstance.patch(`${BASE}/${assessmentId}/publish-results`)
  );
}
