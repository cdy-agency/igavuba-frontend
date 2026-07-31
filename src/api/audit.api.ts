import { apiClient } from './api-client';
import type { AuditLogEntry, AuditLogsResponse, AuditStatistics } from '@/types/audit';

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  institutionId?: string;
  actorId?: string;
  actorRole?: string;
  action?: string;
  entityType?: string;
  status?: string;
  category?: string;
}

export async function getAuditLogs(params: AuditQueryParams = {}) {
  const response = await apiClient.get<AuditLogsResponse>('/audit', { params });
  return response.data;
}

export async function getAuditLog(id: string) {
  const response = await apiClient.get<{ data: AuditLogEntry }>(`/audit/${id}`);
  return response.data.data;
}

export async function getAuditStatistics() {
  const response = await apiClient.get<AuditStatistics>('/audit/statistics');
  return response.data;
}
