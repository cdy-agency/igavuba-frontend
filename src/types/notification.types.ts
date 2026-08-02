export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type NotificationCategory =
  | 'AUTHENTICATION'
  | 'COURSE'
  | 'ASSESSMENT'
  | 'ASSIGNMENT'
  | 'EXAM'
  | 'PAYMENT'
  | 'CERTIFICATE'
  | 'ENROLLMENT'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  recipientId: string;
  /** @deprecated Compatibility with older payloads */
  userId?: string;
  institutionId: string | null;
  title: string;
  message: string;
  type: NotificationType | string;
  category: NotificationCategory | string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  actionUrl: string | null;
  courseId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unread?: boolean;
  category?: NotificationCategory;
}
