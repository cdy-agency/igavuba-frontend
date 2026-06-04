import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  Layers,
  School,
  Settings,
  ShieldCheck,
  Ticket,
  Trophy,
  UserCog,
  Users,
  Video,
} from 'lucide-react';
import { UserRole } from '@/types/enum';
import type { NavigationGroup, NavigationItem, NavigationSection } from '@/types/dashboard';

export const DASHBOARD_HOME = '/dashboard';

export const navigationConfig: NavigationItem[] = [
  // Shared dashboard home
  {
    title: 'Dashboard',
    href: DASHBOARD_HOME,
    icon: LayoutDashboard,
    roles: Object.values(UserRole),
  },

  // SUPER_ADMIN
  {
    title: 'Institutions',
    href: '/dashboard/institutions',
    icon: Building2,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Institution Admins',
    href: '/dashboard/institution-admins',
    icon: UserCog,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: [UserRole.SUPER_ADMIN],
  },

  // INSTITUTION_ADMIN
  {
    title: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Modules',
    href: '/dashboard/modules',
    icon: Layers,
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Lecturers',
    href: '/dashboard/lecturers',
    icon: GraduationCap,
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Students',
    href: '/dashboard/students',
    icon: Users,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER, UserRole.DATA_MANAGER],
  },
  {
    title: 'Departments',
    href: '/dashboard/departments',
    icon: School,
    roles: [UserRole.INSTITUTION_ADMIN],
  },
  {
    title: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: ClipboardCheck,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.DATA_MANAGER],
  },
  {
    title: 'Certificates',
    href: '/dashboard/certificates',
    icon: Award,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER, UserRole.LEARNER],
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: [
      UserRole.INSTITUTION_ADMIN,
      UserRole.DATA_MANAGER,
      UserRole.CONTENT_REVIEWER,
      UserRole.SUPPORT_AGENT,
    ],
  },

  // LECTURER
  {
    title: 'My Courses',
    href: '/dashboard/my-courses',
    icon: BookOpen,
    roles: [UserRole.LECTURER, UserRole.LEARNER],
  },
  {
    title: 'Course Builder',
    href: '/dashboard/course-builder',
    icon: Layers,
    roles: [UserRole.LECTURER],
  },
  {
    title: 'Assignments',
    href: '/dashboard/assignments',
    icon: ClipboardCheck,
    roles: [UserRole.LECTURER, UserRole.LEARNER],
  },
  {
    title: 'Grades',
    href: '/dashboard/grades',
    icon: FileCheck,
    roles: [UserRole.LECTURER],
  },
  {
    title: 'Live Sessions',
    href: '/dashboard/live-sessions',
    icon: Video,
    roles: [UserRole.LECTURER],
  },

  // LEARNER
  {
    title: 'My Learning',
    href: '/dashboard/my-learning',
    icon: GraduationCap,
    roles: [UserRole.LEARNER],
  },
  {
    title: 'Achievements',
    href: '/dashboard/achievements',
    icon: Trophy,
    roles: [UserRole.LEARNER],
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: UserCog,
    roles: [UserRole.LEARNER],
  },

  // CONTENT_REVIEWER
  {
    title: 'Course Reviews',
    href: '/dashboard/course-reviews',
    icon: BookOpen,
    roles: [UserRole.CONTENT_REVIEWER],
  },
  {
    title: 'Content Approval',
    href: '/dashboard/content-approval',
    icon: ShieldCheck,
    roles: [UserRole.CONTENT_REVIEWER],
  },

  // SUPPORT_AGENT
  {
    title: 'Support Tickets',
    href: '/dashboard/support-tickets',
    icon: Ticket,
    roles: [UserRole.SUPPORT_AGENT],
  },

  // Shared settings
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN],
  },
];

const TOOLS_PATHS = new Set([
  '/dashboard/reports',
  '/dashboard/analytics',
  '/dashboard/course-reviews',
  '/dashboard/content-approval',
]);

const WORKSPACE_PATHS = new Set([
  '/dashboard/institutions',
  '/dashboard/institution-admins',
  '/dashboard/users',
  '/dashboard/courses',
  '/dashboard/modules',
  '/dashboard/lecturers',
  '/dashboard/students',
  '/dashboard/departments',
  '/dashboard/enrollments',
  '/dashboard/course-builder',
  '/dashboard/grades',
  '/dashboard/live-sessions',
  '/dashboard/support-tickets',
]);

const FOOTER_PATHS = new Set(['/dashboard/settings', '/dashboard/profile']);

function resolveSection(item: NavigationItem): NavigationSection {
  if (item.section) {
    return item.section;
  }
  if (FOOTER_PATHS.has(item.href)) {
    return 'footer';
  }
  if (TOOLS_PATHS.has(item.href)) {
    return 'tools';
  }
  if (WORKSPACE_PATHS.has(item.href)) {
    return 'workspace';
  }
  return 'main';
}

export function getNavigationForRole(role: UserRole | null): NavigationItem[] {
  if (!role) {
    return [];
  }

  return navigationConfig.filter((item) => item.roles.includes(role));
}

export function getNavigationGroupsForRole(role: UserRole | null): NavigationGroup[] {
  const items = getNavigationForRole(role);
  const buckets: Record<NavigationSection, NavigationItem[]> = {
    main: [],
    tools: [],
    workspace: [],
    footer: [],
  };

  for (const item of items) {
    buckets[resolveSection(item)].push(item);
  }

  const groups: NavigationGroup[] = [];

  if (buckets.main.length > 0) {
    groups.push({ id: 'main', label: 'Main menu', items: buckets.main });
  }
  if (buckets.tools.length > 0) {
    groups.push({ id: 'tools', label: 'Tools', items: buckets.tools });
  }
  if (buckets.workspace.length > 0) {
    groups.push({
      id: 'workspace',
      label: 'Workspace',
      items: buckets.workspace,
      collapsible: true,
    });
  }

  return groups;
}

export function getFooterNavigationForRole(role: UserRole | null): NavigationItem[] {
  return getNavigationForRole(role).filter((item) => resolveSection(item) === 'footer');
}

export function getNavigationItemByHref(
  href: string,
  role: UserRole | null,
): NavigationItem | undefined {
  return getNavigationForRole(role).find((item) => item.href === href);
}

export function isRouteAllowedForRole(pathname: string, role: UserRole | null): boolean {
  if (pathname === DASHBOARD_HOME) {
    return true;
  }

  if (!role) {
    return false;
  }

  const allowedItems = getNavigationForRole(role);
  return allowedItems.some(
    (item) => item.href !== DASHBOARD_HOME && pathname.startsWith(item.href),
  );
}

export const dashboardPageMeta: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your workspace activity and key metrics.',
  },
  '/dashboard/institutions': {
    title: 'Institutions',
    description: 'Manage platform institutions and onboarding.',
  },
  '/dashboard/institution-admins': {
    title: 'Institution Admins',
    description: 'Assign and manage institution administrators.',
  },
  '/dashboard/users': {
    title: 'Users',
    description: 'View and manage platform users.',
  },
  '/dashboard/analytics': {
    title: 'Analytics',
    description: 'Platform-wide analytics and insights.',
  },
  '/dashboard/courses': {
    title: 'Courses',
    description: 'Manage institution courses and catalogs.',
  },
  '/dashboard/modules': {
    title: 'Modules',
    description: 'Organize course modules and learning paths.',
  },
  '/dashboard/lecturers': {
    title: 'Lecturers',
    description: 'Manage lecturers and teaching assignments.',
  },
  '/dashboard/students': {
    title: 'Students',
    description: 'Manage student records and enrollment data.',
  },
  '/dashboard/departments': {
    title: 'Departments',
    description: 'Manage academic departments and structure.',
  },
  '/dashboard/enrollments': {
    title: 'Enrollments',
    description: 'Track and manage course enrollments.',
  },
  '/dashboard/certificates': {
    title: 'Certificates',
    description: 'Issue and manage learning certificates.',
  },
  '/dashboard/reports': {
    title: 'Reports',
    description: 'Generate and review operational reports.',
  },
  '/dashboard/my-courses': {
    title: 'My Courses',
    description: 'Courses you teach or are enrolled in.',
  },
  '/dashboard/course-builder': {
    title: 'Course Builder',
    description: 'Build and manage course content.',
  },
  '/dashboard/assignments': {
    title: 'Assignments',
    description: 'Manage assignments and submissions.',
  },
  '/dashboard/grades': {
    title: 'Grades',
    description: 'Review and publish student grades.',
  },
  '/dashboard/live-sessions': {
    title: 'Live Sessions',
    description: 'Schedule and manage live teaching sessions.',
  },
  '/dashboard/my-learning': {
    title: 'My Learning',
    description: 'Continue your learning journey.',
  },
  '/dashboard/achievements': {
    title: 'Achievements',
    description: 'Track badges, milestones, and accomplishments.',
  },
  '/dashboard/profile': {
    title: 'Profile',
    description: 'Manage your learner profile and preferences.',
  },
  '/dashboard/course-reviews': {
    title: 'Course Reviews',
    description: 'Review submitted courses for quality assurance.',
  },
  '/dashboard/content-approval': {
    title: 'Content Approval',
    description: 'Approve or reject submitted learning content.',
  },
  '/dashboard/support-tickets': {
    title: 'Support Tickets',
    description: 'Handle user support requests and tickets.',
  },
  '/dashboard/settings': {
    title: 'Settings',
    description: 'Configure workspace and account settings.',
  },
};

export function getPageMeta(pathname: string) {
  const exact = dashboardPageMeta[pathname];
  if (exact) {
    return exact;
  }

  const match = Object.entries(dashboardPageMeta)
    .filter(([href]) => href !== DASHBOARD_HOME)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => pathname.startsWith(href));

  return match?.[1] ?? {
    title: 'Dashboard',
    description: 'Manage your e-learning workspace.',
  };
}
