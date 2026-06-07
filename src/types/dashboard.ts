import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './enum';
import type { User } from './user';

export interface Institution {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
}

export type NavigationSection = 'main' | 'tools' | 'workspace' | 'footer';

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
  section?: NavigationSection;
}

export interface NavigationGroup {
  id: NavigationSection;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export interface DashboardPermissions {
  canManageInstitutions: boolean;
  canManageUsers: boolean;
  canManageCourses: boolean;
  canReviewContent: boolean;
  canAccessReports: boolean;
  canManageSupport: boolean;
}

export interface DashboardContextValue {
  user: User | null;
  role: UserRole | null;
  institution: Institution | null;
  navigation: NavigationItem[];
  permissions: DashboardPermissions;
  isLoading: boolean;
}
