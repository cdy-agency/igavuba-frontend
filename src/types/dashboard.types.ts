import type { UserRole } from '@/types/enum';

export type DashboardChartType = 'line' | 'bar' | 'pie';

export interface DashboardMeta {
  badge: string;
  title: string;
  description: string;
}

export interface DashboardStat {
  key: string;
  label: string;
  value: number;
}

export interface DashboardChartPoint {
  label: string;
  value: number;
}

export interface DashboardChart {
  key: string;
  label: string;
  type: DashboardChartType;
  data: DashboardChartPoint[];
}

export interface DashboardActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  occurredAt: string;
  href?: string;
}

export interface DashboardRecentSection {
  key: string;
  title: string;
  items: DashboardActivityItem[];
}

export interface DashboardQuickAction {
  key: string;
  label: string;
  href: string;
}

export interface DashboardPayload {
  role: UserRole;
  meta: DashboardMeta;
  cards: DashboardStat[];
  charts: DashboardChart[];
  recentSections: DashboardRecentSection[];
  quickActions: DashboardQuickAction[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardPayload;
}
