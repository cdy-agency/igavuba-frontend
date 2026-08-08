import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileCheck,
  GraduationCap,
  Heart,
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
  Star,
} from 'lucide-react';
import { UserRole } from '@/types/enum';
import type { NavigationGroup, NavigationItem, NavigationSection } from '@/types/dashboard';

export const DASHBOARD_HOME = '/dashboard';

/**
 * Canonical sidebar order — every role sees only their items, in this sequence.
 */
export const CANONICAL_NAV_ORDER = [
  DASHBOARD_HOME,
  '/dashboard/my-learning',
  '/dashboard/wishlist',
  '/dashboard/achievements',
  '/dashboard/institutions',
  '/dashboard/departments',
  '/dashboard/courses',
  '/dashboard/course-reviews',
  '/dashboard/reviews',
  '/dashboard/assessments',
  '/dashboard/grades',
  '/dashboard/enrollments',
  '/dashboard/payments',
  '/certificate/builder',
  '/dashboard/lecturers',
  '/dashboard/students',
  '/dashboard/reports',
  // '/dashboard/analytics',
  '/dashboard/live-sessions',
  '/dashboard/content-approval',
  '/dashboard/support-tickets',
  '/dashboard/users',
  '/dashboard/settings',
  '/dashboard/profile',
  '/dashboard/audit-logs',
] as const;

const ALL_ROLES = Object.values(UserRole);

const FOOTER_HREFS = new Set<string>(['/dashboard/settings', '/dashboard/profile']);

const NAVIGATION_ORDER_INDEX = new Map<string, number>(
  CANONICAL_NAV_ORDER.map((href, index) => [href, index]),
);

/** One entry per route; roles combined on shared links (e.g. Payments). */
export const navigationConfig: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: DASHBOARD_HOME,
    icon: LayoutDashboard,
    roles: ALL_ROLES,
    section: 'main',
  },
  {
    title: 'Institutions',
    href: '/dashboard/institutions',
    icon: Building2,
    roles: [UserRole.SUPER_ADMIN],
    section: 'main',
  },
  {
    title: 'Departments',
    href: '/dashboard/departments',
    icon: School,
    roles: [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.LECTURER],
    section: 'main',
  },
  {
    title: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
    roles: [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.LECTURER],
    section: 'main',
  },
  {
    title: 'Reviews',
    href: '/dashboard/course-reviews',
    icon: FileCheck,
    roles: [
      UserRole.INSTITUTION_ADMIN,
      UserRole.CONTENT_REVIEWER,
    ],
    section: 'main',
  },
  {
    title: 'Learner Reviews',
    href: '/dashboard/reviews',
    icon: Star,
    roles: [UserRole.LECTURER, UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN],
    section: 'main',
  },
  {
    title: 'Assessments',
    href: '/dashboard/assessments',
    icon: Layers,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER],
    section: 'main',
  },
  {
    title: 'Grades',
    href: '/dashboard/grades',
    icon: FileCheck,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER],
    section: 'main',
  },
  {
    title: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: ClipboardCheck,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.DATA_MANAGER],
    section: 'main',
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCard,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LEARNER],
    section: 'main',
  },
  {
    title: 'Certificates',
    href: '/certificate/builder',
    icon: Award,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER, UserRole.LEARNER],
    section: 'main',
  },
  {
    title: 'Lecturers',
    href: '/dashboard/lecturers',
    icon: GraduationCap,
    roles: [UserRole.INSTITUTION_ADMIN],
    section: 'main',
  },
  {
    title: 'Students',
    href: '/dashboard/students',
    icon: Users,
    roles: [UserRole.INSTITUTION_ADMIN, UserRole.LECTURER, UserRole.DATA_MANAGER],
    section: 'main',
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
    section: 'main',
  },
  // {
  //   title: 'Analytics',
  //   href: '/dashboard/analytics',
  //   icon: BarChart3,
  //   roles: [UserRole.SUPER_ADMIN],
  //   section: 'main',
  // },
  {
    title: 'Live Sessions',
    href: '/dashboard/live-sessions',
    icon: Video,
    roles: [UserRole.LECTURER],
    section: 'main',
  },
  {
    title: 'My Learning',
    href: '/dashboard/my-learning',
    icon: GraduationCap,
    roles: [UserRole.LEARNER],
    section: 'main',
  },
  {
    title: 'My Wishlist',
    href: '/dashboard/wishlist',
    icon: Heart,
    roles: [UserRole.LEARNER],
    section: 'main',
  },
  {
    title: 'Achievements',
    href: '/dashboard/achievements',
    icon: Trophy,
    roles: [UserRole.LEARNER],
    section: 'main',
  },
  {
    title: 'Content Approval',
    href: '/dashboard/content-approval',
    icon: ShieldCheck,
    roles: [UserRole.CONTENT_REVIEWER],
    section: 'main',
  },
  {
    title: 'Support Tickets',
    href: '/dashboard/support-tickets',
    icon: Ticket,
    roles: [UserRole.SUPPORT_AGENT],
    section: 'main',
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
    section: 'main',
  },
  {
    title: 'Audit Logs',
    href: '/dashboard/audit-logs',
    icon: FileCheck,
    roles: [UserRole.SUPER_ADMIN],
    section: 'main',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: [UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN],
    section: 'footer',
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: UserCog,
    roles: ALL_ROLES,
    section: 'footer',
  },
];

export const NAVIGATION_CHILD_ROUTES: Record<string, string[]> = {
  '/dashboard/assessments': [
    '/dashboard/quizzes',
    '/dashboard/exams',
    '/dashboard/assignments',
  ],
  '/dashboard/courses': ['/dashboard/course-builder'],
  '/certificate/builder': ['/certificate/link-certificate'],
};

function resolveSection(item: NavigationItem): NavigationSection {
  if (item.section) {
    return item.section;
  }
  if (FOOTER_HREFS.has(item.href)) {
    return 'footer';
  }
  return 'main';
}

function sortByCanonicalOrder(items: NavigationItem[]): NavigationItem[] {
  return [...items].sort((a, b) => {
    const orderA = NAVIGATION_ORDER_INDEX.get(a.href) ?? Number.MAX_SAFE_INTEGER;
    const orderB = NAVIGATION_ORDER_INDEX.get(b.href) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

export function getNavigationForRole(role: UserRole | null): NavigationItem[] {
  if (!role) {
    return [];
  }

  return sortByCanonicalOrder(
    navigationConfig.filter((item) => item.roles.includes(role)),
  );
}

export function getPrimaryNavigationForRole(role: UserRole | null): NavigationItem[] {
  return getNavigationForRole(role).filter((item) => !FOOTER_HREFS.has(item.href));
}

export function getNavigationGroupsForRole(role: UserRole | null): NavigationGroup[] {
  const primaryItems = getPrimaryNavigationForRole(role);

  if (primaryItems.length === 0) {
    return [];
  }

  return [{ id: 'main', label: 'Main menu', items: primaryItems }];
}

export function getFooterNavigationForRole(role: UserRole | null): NavigationItem[] {
  return getNavigationForRole(role).filter((item) => FOOTER_HREFS.has(item.href));
}

export function getNavigationItemByHref(
  href: string,
  role: UserRole | null,
): NavigationItem | undefined {
  return getNavigationForRole(role).find((item) => item.href === href);
}

export const ASSESSMENT_ROUTE_PREFIXES = [
  '/dashboard/assessments',
  '/dashboard/quizzes',
  '/dashboard/exams',
  '/dashboard/assignments',
] as const;

export function isRouteAllowedForRole(pathname: string, role: UserRole | null): boolean {
  if (pathname === DASHBOARD_HOME) {
    return true;
  }

  if (!role) {
    return false;
  }

  const allowedItems = getNavigationForRole(role);
  const hasAssessmentAccess = allowedItems.some((item) => item.href === '/dashboard/assessments');

  if (
    hasAssessmentAccess &&
    ASSESSMENT_ROUTE_PREFIXES.some(
      (prefix) => prefix !== '/dashboard/assessments' && pathname.startsWith(prefix),
    )
  ) {
    return true;
  }

  for (const item of allowedItems) {
    if (item.href === DASHBOARD_HOME) {
      continue;
    }

    if (pathname.startsWith(item.href)) {
      return true;
    }

    const childRoutes = NAVIGATION_CHILD_ROUTES[item.href] ?? [];
    if (childRoutes.some((childRoute) => pathname.startsWith(childRoute))) {
      return true;
    }
  }

  return false;
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
  '/dashboard/departments': {
    title: 'Departments',
    description: 'Manage academic departments and structure.',
  },
  '/dashboard/courses': {
    title: 'Courses',
    description: 'Manage institution courses and catalogs.',
  },
  '/dashboard/course-reviews': {
    title: 'Reviews',
    description: 'Review submitted courses for quality assurance.',
  },
  '/dashboard/reviews': {
    title: 'Learner Reviews',
    description: 'Ratings, feedback analytics, and review moderation.',
  },
  '/dashboard/assessments': {
    title: 'Assessments',
    description: 'Manage quizzes, exams, and assignments across your courses.',
  },
  '/dashboard/grades': {
    title: 'Grades',
    description: 'Review and publish student grades.',
  },
  '/dashboard/enrollments': {
    title: 'Enrollments',
    description: 'Track and manage course enrollments.',
  },
  '/dashboard/payments': {
    title: 'Payments',
    description: 'Review payment proofs or track your course payment submissions.',
  },
  '/certificate/builder': {
    title: 'Certificate Builder',
    description: 'Design certificate templates and assign them to your courses.',
  },
  '/dashboard/lecturers': {
    title: 'Lecturers',
    description: 'Manage lecturers and teaching assignments.',
  },
  '/dashboard/students': {
    title: 'Students',
    description: 'Manage student records and enrollment data.',
  },
  '/dashboard/reports': {
    title: 'Reports',
    description: 'Generate and review operational reports.',
  },
  // '/dashboard/analytics': {
  //   title: 'Analytics',
  //   description: 'Platform-wide analytics and insights.',
  // },
  '/dashboard/live-sessions': {
    title: 'Live Sessions',
    description: 'Schedule and manage live teaching sessions.',
  },
  '/dashboard/my-learning': {
    title: 'My Learning',
    description: 'Your enrolled courses and learning progress.',
  },
  '/dashboard/wishlist': {
    title: 'My Wishlist',
    description: 'Courses you saved for later.',
  },
  '/dashboard/achievements': {
    title: 'Achievements',
    description: 'Your marks across quizzes, assignments, exams, and course performance.',
  },
  '/dashboard/content-approval': {
    title: 'Content Approval',
    description: 'Approve or reject submitted learning content.',
  },
  '/dashboard/support-tickets': {
    title: 'Support Tickets',
    description: 'Handle user support requests and tickets.',
  },
  '/dashboard/users': {
    title: 'Users',
    description: 'View and manage platform users.',
  },
  '/dashboard/settings': {
    title: 'Settings',
    description: 'Configure institution policies such as course publishing approval.',
  },
  '/dashboard/profile': {
    title: 'Profile',
    description: 'Manage your profile, password, and account details.',
  },
  '/dashboard/modules': {
    title: 'Modules',
    description: 'Organize course modules and learning paths.',
  },
  '/dashboard/course-builder': {
    title: 'Course Builder',
    description: 'Build and manage course content.',
  },
  '/dashboard/quizzes': {
    title: 'Quizzes',
    description: 'Manage quiz assessments across your courses.',
  },
  '/dashboard/exams': {
    title: 'Exams',
    description: 'Manage exams, grade essays, and publish results.',
  },
  '/dashboard/assignments': {
    title: 'Assignments',
    description: 'Manage assignments and submissions.',
  },
  '/dashboard/audit-logs': {
    title: 'Audit Logs',
    description: 'View system audit logs and administrative actions.',
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
