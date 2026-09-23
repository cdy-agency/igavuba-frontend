'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  ClipboardCheck,
  FileEdit,
  GraduationCap,
  Layers,
  Star,
  Users,
} from 'lucide-react';
import type { DashboardStat } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';
import { formatDashboardNumber } from './dashboard-helpers';

const STAT_ICONS: Record<string, LucideIcon> = {
  enrolledCourses: BookOpen,
  completedCourses: Award,
  assignmentsDue: FileEdit,
  pendingQuizzes: ClipboardCheck,
  certificatesEarned: Award,
  myCourses: BookOpen,
  publishedCourses: Layers,
  totalLearners: Users,
  courses: BookOpen,
  lecturers: GraduationCap,
  internalLearners: Users,
  pendingCourseReviews: ClipboardCheck,
  totalInstitutions: Users,
};

const STAT_ACCENTS: Record<string, string> = {
  enrolledCourses: 'bg-primary/10 text-primary',
  completedCourses: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  certificatesEarned: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  assignmentsDue: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  pendingQuizzes: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  myCourses: 'bg-primary/10 text-primary',
  totalLearners: 'bg-primary/10 text-primary',
  courses: 'bg-primary/10 text-primary',
  averageCourseRating: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

interface HeroStatCardsProps {
  cards: DashboardStat[];
  keys: string[];
  viewAllHref?: string;
  className?: string;
}

export function HeroStatCards({ cards, keys, viewAllHref, className }: HeroStatCardsProps) {
  const visibleCards = keys
    .map((key) => cards.find((card) => card.key === key))
    .filter((card): card is DashboardStat => Boolean(card));

  if (visibleCards.length === 0) return null;

  return (
    <div className={cn('grid gap-2 sm:grid-cols-3 lg:grid-cols-1', className)}>
      {visibleCards.map((card) => {
        const Icon = STAT_ICONS[card.key] ?? BookOpen;
        const accent = STAT_ACCENTS[card.key] ?? 'bg-primary/10 text-primary';

        return (
          <article
            key={card.key}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm"
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                accent,
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold tabular-nums leading-none text-foreground">
                {formatDashboardNumber(card.value)}
              </p>
              <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
                {card.label}
              </p>
            </div>
          </article>
        );
      })}
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="hidden text-center text-xs font-medium text-primary hover:underline lg:block"
        >
          View all →
        </Link>
      ) : null}
    </div>
  );
}
