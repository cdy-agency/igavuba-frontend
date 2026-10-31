'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  Building2,
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
  draftCourses: FileEdit,
  coursesUnderReview: ClipboardCheck,
  totalLearners: Users,
  assignmentsWaitingGrading: ClipboardCheck,
  quizzes: ClipboardCheck,
  averageCourseRating: Star,
  totalLearnerReviews: Star,
  departments: Building2,
  lecturers: GraduationCap,
  internalLearners: Users,
  courses: BookOpen,
  pendingCourseReviews: ClipboardCheck,
  totalInstitutions: Building2,
  institutionAdmins: Users,
  learners: Users,
  totalEnrollments: Users,
};

function getStatIcon(key: string): LucideIcon {
  return STAT_ICONS[key] ?? BookOpen;
}

function shortenLabel(label: string): string {
  return label
    .replace(/^Total /i, '')
    .replace(/^My /i, '')
    .replace(/ Waiting For Grading$/i, ' to grade')
    .replace(/ Waiting Grading$/i, ' to grade');
}

interface StatCardsGridProps {
  cards: DashboardStat[];
  keys?: string[];
  className?: string;
}

export function StatCardsGrid({ cards, keys, className }: StatCardsGridProps) {
  const visibleCards = keys
    ? keys
        .map((key) => cards.find((card) => card.key === key))
        .filter((card): card is DashboardStat => Boolean(card))
    : cards;

  if (visibleCards.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-xl border border-border/60 bg-card/60 p-2 shadow-sm',
        className,
      )}
    >
      {visibleCards.map((card) => {
        const Icon = getStatIcon(card.key);

        return (
          <article
            key={card.key}
            className="inline-flex min-w-[9.5rem] flex-1 items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-2 sm:min-w-[10.5rem]"
            title={card.label}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {shortenLabel(card.label)}
              </p>
              <p className="text-base font-bold tabular-nums leading-tight text-foreground">
                {formatDashboardNumber(card.value)}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
