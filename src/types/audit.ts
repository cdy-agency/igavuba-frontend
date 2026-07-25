export type AuditLogStatus = 'SUCCESS' | 'FAILED' | 'PENDING';
export type AuditLogCategory =
  | 'AUTHENTICATION'
  | 'INSTITUTION'
  | 'LECTURER'
  | 'STUDENT'
  | 'COURSE'
  | 'MODULE'
  | 'CONTENT'
  | 'ASSESSMENT'
  | 'ACADEMIC'
  | 'PAYMENT'
  | 'CERTIFICATE'
  | 'SYSTEM';

export interface AuditLogEntry {
  id: string;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  institutionId?: string | null;
  institutionName?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  entityName?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: AuditLogStatus;
  category: AuditLogCategory;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogsResponse {
  data: AuditLogEntry[];
  pagination: AuditLogPagination;
}

export interface AuditActionCount {
  action: string;
  count: number;
}

export interface AuditInstitutionCount {
  institutionId: string | null;
  count: number;
}

export interface AuditUserCount {
  actorId: string | null;
  count: number;
}

export interface AuditStatistics {
  totalLogs: number;
  todaysActivities: number;
  activeUsers: number;
  topActions: AuditActionCount[];
  mostActiveInstitutions: AuditInstitutionCount[];
  mostActiveUsers: AuditUserCount[];
  recentActivities: AuditLogEntry[];
}
