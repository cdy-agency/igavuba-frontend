export const PUBLIC_ROUTES = {
  LANDING: '/',
  COURSES: '/courses',
  COURSE: (id: string) => `/courses/${id}`,
  CONTACT: '/contact',
} as const;

export const GUEST_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/veryfy-email',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_RESET_PASSWORD: '/verify-reset-password',
  RESET_PASSWORD: '/reset-password',
} as const;

export const PUBLIC_AUTH_ROUTES = {
  ACTIVATE_ACCOUNT: '/admin/activate-account',
} as const;

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  STUDENT: '/student',
  BUILDER: '/builder',
  LEARN: '/learn',
  INSTRUCTOR: '/instructor',
  INSTITUTION: '/institution',
  ADMIN: '/admin',
} as const;

export const GUEST_ROUTE_PATTERNS = Object.values(GUEST_ROUTES);
export const PROTECTED_ROUTE_PATTERNS = Object.values(PROTECTED_ROUTES);

export const isGuestRoute = (pathname: string): boolean => {
  return GUEST_ROUTE_PATTERNS.some((route) => pathname.startsWith(route));
};

export const isProtectedRoute = (pathname: string): boolean => {
  if (isPublicRoute(pathname) || isGuestRoute(pathname)) {
    return false;
  }

  return PROTECTED_ROUTE_PATTERNS.some((route) => pathname.startsWith(route));
};

export const isPublicRoute = (pathname: string): boolean => {
  if (pathname === '/') return true;
  if (pathname === '/courses' || pathname.startsWith('/courses/')) return true;
  if (pathname === '/contact') return true;
  if (pathname.startsWith('/admin/activate-account')) return true;
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/veryfy-email' ||
    pathname === '/forgot-password' ||
    pathname === '/verify-reset-password' ||
    pathname === '/reset-password'
  ) {
    return true;
  }

  return Object.values(PUBLIC_ROUTES).some((route) => {
    if (typeof route === 'string') {
      return pathname === route || pathname.startsWith(route);
    }

    return false;
  });
};

export const isProfileCompletionRoute = (): boolean => false;
