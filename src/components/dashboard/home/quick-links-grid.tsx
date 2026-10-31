'use client';

import Link from 'next/link';
import {
  Award,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileEdit,
  GraduationCap,
  Layers,
  PlayCircle,
  UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardQuickAction } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, LucideIcon> = {
  inviteLecturer: UserPlus,
  reviewCourses: ClipboardCheck,
  createDepartment: Building2,
  createCourse: BookOpen,
  continueDraft: FileEdit,
  gradeAssignments: GraduationCap,
  continueLearning: PlayCircle,
  resumeQuiz: ClipboardCheck,
  viewCertificates: Award,
  reviewQueue: Layers,
};

function getActionIcon(key: string): LucideIcon {
  return ACTION_ICONS[key] ?? BookOpen;
}

interface QuickLinksGridProps {
  actions: DashboardQuickAction[];
  title?: string;
  className?: string;
}

export function QuickLinksGrid({
  actions,
  title = 'Quick links',
  className,
}: QuickLinksGridProps) {
  if (actions.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-sm',
        className,
      )}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Jump to common tasks</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {actions.map((action) => {
          const Icon = getActionIcon(action.key);

          return (
            <Link
              key={action.key}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium leading-tight text-foreground">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
