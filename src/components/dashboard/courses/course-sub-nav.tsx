'use client';

import Link from 'next/link';
import { BarChart3, GraduationCap, Pencil, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type CourseSubNavTab = 'edit' | 'settings' | 'results' | 'students';

interface CourseSubNavProps {
  slug: string;
  active: CourseSubNavTab;
  className?: string;
}

const TABS: {
  id: CourseSubNavTab;
  label: string;
  href: (slug: string) => string;
  icon: typeof Pencil;
}[] = [
  {
    id: 'edit',
    label: 'Details',
    href: (slug) => `/dashboard/courses/${slug}`,
    icon: Pencil,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: (slug) => `/dashboard/courses/${slug}/settings`,
    icon: GraduationCap,
  },
  {
    id: 'results',
    label: 'Results',
    href: (slug) => `/dashboard/courses/${slug}/results`,
    icon: BarChart3,
  },
  {
    id: 'students',
    label: 'Students',
    href: (slug) => `/dashboard/courses/${slug}/students`,
    icon: Users,
  },
];

export function CourseSubNav({ slug, active, className }: CourseSubNavProps) {
  return (
    <nav
      className={cn(
        'flex flex-wrap gap-2 rounded-lg border border-border bg-card p-1.5 shadow-sm',
        className,
      )}
      aria-label="Course sections"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;

        return (
          <Link
            key={tab.id}
            href={tab.href(slug)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
